// components/ShopForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input, Select, Button } from '@/components/ui';
import { createShop, updateShop } from '@/lib/shop-actions';
import { uploadImageAction } from '@/lib/upload-actions';
import { useAutosave } from '@/hooks/useAutosave';
import { AutosaveIndicator } from '@/components/AutosaveIndicator';
import { themes } from '@/lib/themes';
import { CATEGORY_LABELS } from '@/types';
import type { ShopCategory, ShopTemplate, ShopTheme } from '@/types';

interface ShopFormData {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  cover: string | null;
  category: ShopCategory;
  theme: ShopTheme;
  template: ShopTemplate;
  accentColor: string | null;
  whatsappNumber: string;
  instagram: string | null;
  facebook: string | null;
  city: string | null;
  district: string | null;
}

const EMPTY_FORM: ShopFormData = {
  name: '',
  slug: '',
  description: '',
  logo: null,
  cover: null,
  category: 'other',
  theme: 'minimal',
  template: 'grid',
  accentColor: null,
  whatsappNumber: '',
  instagram: null,
  facebook: null,
  city: null,
  district: null,
};

export function ShopForm({ initial }: { initial?: ShopFormData }) {
  const isEdit = Boolean(initial?._id);
  return isEdit ? <ShopFormEdit initial={initial as ShopFormData & { _id: string }} /> : <ShopFormCreate />;
}

/* ------------------------------------------------------------------ */
/* Création : formulaire classique, un bouton, rien à autosave avant   */
/* que le document existe.                                             */
/* ------------------------------------------------------------------ */
function ShopFormCreate() {
  const router = useRouter();
  const [form, setForm] = useState<ShopFormData>(EMPTY_FORM);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const update = <K extends keyof ShopFormData>(key: K, value: ShopFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const location = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;
        const shop = await createShop({ ...form, location });
        router.push(`/dashboard/${shop._id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-stone-200 bg-white/70 backdrop-blur-sm shadow-sm p-6 md:p-8 space-y-5 max-w-xl"
    >
      <Input label="Nom de la boutique" value={form.name} onChange={(e) => update('name', e.target.value)} required />
      <Input
        label="Lien (slug)"
        value={form.slug}
        onChange={(e) => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
        placeholder="ma-boutique"
        required
      />
      <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
        Description
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
          className="px-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#2e5e4d]/25 focus:border-[#2e5e4d] font-normal transition"
        />
      </label>

      <Select label="Catégorie" value={form.category} onChange={(e) => update('category', e.target.value as ShopCategory)} required>
        {(Object.keys(CATEGORY_LABELS) as ShopCategory[]).map((c) => (
          <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
        ))}
      </Select>

      <Select label="Thème" value={form.theme} onChange={(e) => update('theme', e.target.value as ShopTheme)}>
        {Object.keys(themes).map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </Select>

      <Select label="Template" value={form.template} onChange={(e) => update('template', e.target.value as ShopTemplate)}>
        <option value="grid">Grid — classique et lisible</option>
        <option value="magazine">Magazine — éditorial, rythmé</option>
        <option value="bento">Bento — blocs étirés, contrastés</option>
        <option value="liquidGlass">Liquid Glass — verre liquide, distortion</option>
        <option value="flux3d">Flux 3D — reveal produit en 3D</option>
      </Select>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
        Couleur d&apos;accent (optionnel)
        <input
          type="color"
          value={form.accentColor ?? '#E25B38'}
          onChange={(e) => update('accentColor', e.target.value)}
          className="w-16 h-10 rounded-xl border border-stone-200 cursor-pointer"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <ImageUploadField label="Logo" value={form.logo} onChange={(url) => update('logo', url)} />
        <ImageUploadField label="Cover" value={form.cover} onChange={(url) => update('cover', url)} />
      </div>

      <div className="h-px bg-stone-100" />

      <Input
        label="Numéro WhatsApp (format international)"
        value={form.whatsappNumber}
        onChange={(e) => update('whatsappNumber', e.target.value)}
        placeholder="212600000000"
        required
      />
      <Input label="Instagram (lien)" value={form.instagram ?? ''} onChange={(e) => update('instagram', e.target.value)} />
      <Input label="Facebook (lien)" value={form.facebook ?? ''} onChange={(e) => update('facebook', e.target.value)} />
      <Input label="Ville" value={form.city ?? ''} onChange={(e) => update('city', e.target.value)} />
      <Input label="Quartier" value={form.district ?? ''} onChange={(e) => update('district', e.target.value)} />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Latitude (optionnel)" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="33.5731" />
        <Input label="Longitude (optionnel)" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="-7.5898" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Enregistrement...' : 'Créer ma boutique'}
      </Button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Édition : autosave. Debounce sur les champs texte, sauvegarde       */
/* instantanée sur select/toggle/couleur/image. Le slug est à part     */
/* car il change l'URL publique — confirmation explicite requise.      */
/* ------------------------------------------------------------------ */
function ShopFormEdit({ initial }: { initial: ShopFormData & { _id: string } }) {
  const [form, setForm] = useState<ShopFormData>(initial);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const update = <K extends keyof ShopFormData>(key: K, value: ShopFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const { status, saveInstantly, saveNow } = useAutosave(
    { ...form, lat, lng },
    async (data) => {
      const { lat: latVal, lng: lngVal, ...shopData } = data;
      const location = latVal && lngVal ? { lat: parseFloat(latVal), lng: parseFloat(lngVal) } : undefined;
      await updateShop(initial._id, { ...shopData, location });
    }
  );

  // --- Slug : traité séparément, avec confirmation explicite ---
  const [slugDraft, setSlugDraft] = useState(form.slug);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const slugChanged = slugDraft !== form.slug;

  const handleSlugSave = async () => {
    setSlugStatus('saving');
    try {
      await updateShop(initial._id, { slug: slugDraft });
      update('slug', slugDraft);
      setSlugStatus('saved');
    } catch (err) {
      setSlugStatus('error');
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  return (
    <div className="rounded-3xl border border-stone-200 bg-white/70 backdrop-blur-sm shadow-sm p-6 md:p-8 space-y-5 max-w-xl">
      <Input label="Nom de la boutique" value={form.name} onChange={(e) => update('name', e.target.value)} onBlur={saveNow} required />

      <div className="space-y-1.5">
        <Input
          label="Lien (slug)"
          value={slugDraft}
          onChange={(e) => setSlugDraft(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          placeholder="ma-boutique"
          required
        />
        {slugChanged && (
          <div className="flex items-center gap-3">
            <p className="text-xs text-orange">L&apos;URL publique de votre boutique va changer.</p>
            <button
              type="button"
              onClick={handleSlugSave}
              disabled={slugStatus === 'saving'}
              className="text-xs font-medium text-[#2e5e4d] underline disabled:opacity-60"
            >
              {slugStatus === 'saving' ? 'Enregistrement...' : 'Confirmer le nouveau lien'}
            </button>
          </div>
        )}
        {slugStatus === 'error' && <p className="text-xs text-red-600">Ce lien est peut-être déjà pris.</p>}
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
        Description
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          onBlur={saveNow}
          rows={3}
          className="px-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#2e5e4d]/25 focus:border-[#2e5e4d] font-normal transition"
        />
      </label>

      <Select
        label="Catégorie"
        value={form.category}
        onChange={(e) => {
          saveInstantly();
          update('category', e.target.value as ShopCategory);
        }}
        required
      >
        {(Object.keys(CATEGORY_LABELS) as ShopCategory[]).map((c) => (
          <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
        ))}
      </Select>

      <Select
        label="Thème"
        value={form.theme}
        onChange={(e) => {
          saveInstantly();
          update('theme', e.target.value as ShopTheme);
        }}
      >
        {Object.keys(themes).map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </Select>

      <Select
        label="Template"
        value={form.template}
        onChange={(e) => {
          saveInstantly();
          update('template', e.target.value as ShopTemplate);
        }}
      >
        <option value="grid">Grid — classique et lisible</option>
        <option value="magazine">Magazine — éditorial, rythmé</option>
        <option value="bento">Bento — blocs étirés, contrastés</option>
        <option value="liquidGlass">Liquid Glass — verre liquide, distortion</option>
        <option value="flux3d">Flux 3D — reveal produit en 3D</option>
      </Select>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
        Couleur d&apos;accent (optionnel)
        <input
          type="color"
          value={form.accentColor ?? '#E25B38'}
          onChange={(e) => {
            saveInstantly();
            update('accentColor', e.target.value);
          }}
          className="w-16 h-10 rounded-xl border border-stone-200 cursor-pointer"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <ImageUploadField
          label="Logo"
          value={form.logo}
          onChange={(url) => {
            saveInstantly();
            update('logo', url);
          }}
        />
        <ImageUploadField
          label="Cover"
          value={form.cover}
          onChange={(url) => {
            saveInstantly();
            update('cover', url);
          }}
        />
      </div>

      <div className="h-px bg-stone-100" />

      <Input
        label="Numéro WhatsApp (format international)"
        value={form.whatsappNumber}
        onChange={(e) => update('whatsappNumber', e.target.value)}
        onBlur={saveNow}
        placeholder="212600000000"
        required
      />
      <Input label="Instagram (lien)" value={form.instagram ?? ''} onChange={(e) => update('instagram', e.target.value)} onBlur={saveNow} />
      <Input label="Facebook (lien)" value={form.facebook ?? ''} onChange={(e) => update('facebook', e.target.value)} onBlur={saveNow} />
      <Input label="Ville" value={form.city ?? ''} onChange={(e) => update('city', e.target.value)} onBlur={saveNow} />
      <Input label="Quartier" value={form.district ?? ''} onChange={(e) => update('district', e.target.value)} onBlur={saveNow} />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Latitude (optionnel)" value={lat} onChange={(e) => setLat(e.target.value)} onBlur={saveNow} placeholder="33.5731" />
        <Input label="Longitude (optionnel)" value={lng} onChange={(e) => setLng(e.target.value)} onBlur={saveNow} placeholder="-7.5898" />
      </div>

      <AutosaveIndicator status={status} onRetry={saveNow} />
    </div>
  );
}

function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (url: string) => void;
}) {
  const [preview, setPreview] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set('file', file);
      const url = await uploadImageAction(fd);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi de l'image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-stone-700">{label}</p>
      <label className="block cursor-pointer group">
        <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-stone-50 border border-dashed border-stone-300 group-hover:border-[#2e5e4d] transition-colors flex items-center justify-center">
          {preview ? (
            <Image src={preview} alt={label} fill className="object-cover" />
          ) : (
            <span className="text-xs text-stone-400 group-hover:text-[#2e5e4d] transition-colors">Ajouter une image</span>
          )}
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
      </label>
      {uploading && <p className="text-xs text-stone-400">Envoi en cours...</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}