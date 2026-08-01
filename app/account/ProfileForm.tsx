// app/account/ProfileForm.tsx
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Input, Toggle } from '@/components/ui';
import { updateProfile } from '@/lib/user-actions';
import { logoutUser, deleteAccount } from '@/lib/auth-actions';
import { useAutosave } from '@/hooks/useAutosave';
import { AutosaveIndicator } from '@/components/AutosaveIndicator';

interface UserData {
  name: string;
  phone: string | null;
  avatar: string | null;
  newsletter: boolean;
  email: string;
}

export function ProfileForm({ user }: { user: UserData }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [newsletter, setNewsletter] = useState(user.newsletter);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [isLoggingOut, startLogout] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Nom / téléphone / newsletter : autosave debouncé (texte) ou instantané (toggle).
  const { status, saveInstantly, saveNow } = useAutosave(
    { name, phone, newsletter },
    async (data) => {
      await updateProfile(data);
    }
  );

  // La photo est un geste discret et unique : on l'uploade et on l'enregistre
  // immédiatement, sans attendre le debounce des autres champs.
  const handleFile = (file: File | null) => {
    if (!file) return;
    setAvatarError(null);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);

    const avatarForm = new FormData();
    avatarForm.set('file', file);

    updateProfile({ name, phone, newsletter }, avatarForm)
      .catch((err) => setAvatarError(err instanceof Error ? err.message : "Échec de l'envoi de la photo."))
      .finally(() => setAvatarUploading(false));
  };

  const handleLogout = () => {
    startLogout(async () => {
      await logoutUser();
    });
  };

  const handleDeleteAccount = () => {
    setDeleteError(null);
    startDelete(async () => {
      try {
        await deleteAccount();
      } catch (err) {
        setDeleteError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      }
    });
  };

  return (
    <>
      <div className="rounded-3xl border border-stone-200 bg-white/70 backdrop-blur-sm shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-stone-100 ring-1 ring-stone-200 shrink-0">
            {avatarPreview && <Image src={avatarPreview} alt="" fill className="object-cover" />}
          </div>
          <div>
            <label className="inline-block text-sm font-medium text-[#2e5e4d] underline decoration-[#2e5e4d]/30 underline-offset-4 cursor-pointer hover:text-[#518c76] transition-colors">
              Changer la photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
            </label>
            <p className="text-xs text-stone-400 mt-1">JPG ou PNG, 2 Mo maximum.</p>
            {avatarUploading && <p className="text-xs text-stone-400 mt-1">Envoi en cours...</p>}
            {avatarError && <p className="text-xs text-red-600 mt-1">{avatarError}</p>}
          </div>
        </div>

        <div className="h-px bg-stone-100" />

        <div className="space-y-4">
          <Input label="Email" value={user.email} disabled />
          <Input label="Nom" value={name} onChange={(e) => setName(e.target.value)} onBlur={saveNow} required />
          <Input label="Téléphone (WhatsApp)" value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={saveNow} />
          <div className="flex items-center justify-between rounded-2xl bg-stone-50 border border-stone-100 px-4 py-3">
            <span className="text-sm text-stone-700">Recevoir les nouveautés par email</span>
            <Toggle
              checked={newsletter}
              onChange={(v) => {
                saveInstantly();
                setNewsletter(v);
              }}
              label="Recevoir les nouveautés par email"
            />
          </div>
        </div>

        <div className="pt-1">
          <AutosaveIndicator status={status} onRetry={saveNow} />
        </div>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white/70 backdrop-blur-sm shadow-sm p-6 md:p-8 mt-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-medium text-stone-700">Déconnexion</p>
            <p className="text-xs text-stone-400 mt-0.5">Vous devrez vous reconnecter pour accéder à votre compte.</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-5 py-2.5 rounded-full border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-60"
          >
            {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
          </button>
        </div>

        <div className="h-px bg-stone-100" />

        <div>
          <p className="text-sm font-medium text-red-700">Supprimer mon compte</p>
          <p className="text-xs text-stone-400 mt-0.5 mb-3">
            Cette action est irréversible. Vos boutiques, produits et avis seront définitivement supprimés.
          </p>

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="px-5 py-2.5 rounded-full border border-red-200 text-red-700 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Supprimer mon compte
            </button>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-sm text-stone-700 font-medium">Êtes-vous sûr ? Cette action est définitive.</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {isDeleting ? 'Suppression...' : 'Oui, supprimer définitivement'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-full border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-60"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
          {deleteError && <p className="text-sm text-red-600 mt-2">{deleteError}</p>}
        </div>
      </div>
    </>
  );
}