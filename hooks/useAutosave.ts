// hooks/useAutosave.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutosaveOptions {
  /** Délai de debounce en ms pour les champs texte (défaut 900ms). */
  delay?: number;
  /** Désactive complètement l'autosave (ex: mode création avant que le document existe). */
  enabled?: boolean;
}

/**
 * Sauvegarde automatiquement `data` via `saveFn` dès qu'il change.
 *
 * - Par défaut, chaque changement est debouncé (utile pour les champs texte :
 *   on évite un appel serveur par lettre tapée).
 * - Pour les champs "discrets" (select, toggle, couleur, image) où l'utilisateur
 *   a déjà terminé son geste, appeler `saveInstantly()` juste avant de mettre
 *   à jour le state pour sauvegarder sans attendre le délai.
 * - Une seule requête est en vol à la fois : si des changements arrivent
 *   pendant qu'une sauvegarde est en cours, ils sont automatiquement
 *   renvoyés dès qu'elle se termine (pas de requêtes en parallèle qui
 *   pourraient s'écraser dans le désordre).
 */
export function useAutosave<T>(data: T, saveFn: (data: T) => Promise<unknown>, options?: UseAutosaveOptions) {
  const { delay = 900, enabled = true } = options ?? {};

  const [status, setStatus] = useState<AutosaveStatus>('idle');

  const latestDataRef = useRef(data);
  const savingRef = useRef(false);
  const pendingRef = useRef<T | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextDelayRef = useRef(delay);
  const isFirstRender = useRef(true);
  const saveFnRef = useRef(saveFn);

  latestDataRef.current = data;
  saveFnRef.current = saveFn;

  const flush = useCallback(async () => {
    if (savingRef.current) {
      // Une sauvegarde est déjà en cours : on mémorise juste qu'il faudra
      // en relancer une avec les données les plus récentes à la fin.
      pendingRef.current = latestDataRef.current;
      return;
    }

    savingRef.current = true;
    setStatus('saving');
    try {
      await saveFnRef.current(latestDataRef.current);
      setStatus('saved');
    } catch {
      setStatus('error');
    } finally {
      savingRef.current = false;
      if (pendingRef.current) {
        pendingRef.current = null;
        flush();
      }
    }
  }, []);

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      flush();
    }, nextDelayRef.current);
    nextDelayRef.current = delay; // on revient au délai normal après usage
  }, [delay, flush]);

  useEffect(() => {
    if (!enabled) return;
    if (isFirstRender.current) {
      // On ne sauvegarde pas au montage, seulement sur un vrai changement.
      isFirstRender.current = false;
      return;
    }
    scheduleSave();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data), enabled]);

  /** À appeler juste avant setState pour un champ "discret" (select/toggle/image). */
  const saveInstantly = useCallback(() => {
    nextDelayRef.current = 0;
  }, []);

  /** Force une sauvegarde immédiate (ex: onBlur d'un champ texte). */
  const saveNow = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    flush();
  }, [flush]);

  return { status, saveInstantly, saveNow };
}