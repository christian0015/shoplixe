// components/ShopForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input, Select, Button } from '@/components/ui';
import { createShop, updateShop } from '@/lib/shop-actions';
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

export function ShopForm({ initial }: { initial?: ShopFormData }) {
  const router = useRouter();
  const isEdit = Boolean(initial?._id);

  const [form, setForm] = useState<ShopFormData>(
    initial ?? {
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
    }
  );
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
        if (isEdit && initial?._id) {
          await updateShop(initial._id, { ...form, location });
          router.push(`/dashboard/${initial._id}`);
        } else {
          const shop = await createShop({ ...form, location });
          router.push(`/dashboard/${shop._id}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
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
          className="px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:ring-2 focus:ring-orange/40 font-normal"
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
          value={form.accentColor ?? '#FF6B35'}
          onChange={(e) => update('accentColor', e.target.value)}
          className="w-16 h-10 rounded-lg border border-stone-300"
        />
      </label>

      <ImageUploadField label="Logo" value={form.logo} onChange={(url) => update('logo', url)} />
      <ImageUploadField label="Cover" value={form.cover} onChange={(url) => update('cover', url)} />

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
        {isPending ? 'Enregistrement...' : isEdit ? 'Enregistrer les modifications' : 'Créer ma boutique'}
      </Button>
    </form>
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

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const { url } = await res.json();
      onChange(url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-stone-700">{label}</p>
      {preview && (
        <div className="relative w-full h-32 rounded-xl overflow-hidden bg-stone-100">
          <Image src={preview} alt={label} fill className="object-cover" />
        </div>
      )}
      <label className="text-sm underline cursor-pointer text-stone-600">
        {uploading ? 'Envoi...' : preview ? 'Changer' : 'Ajouter une image'}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
}
