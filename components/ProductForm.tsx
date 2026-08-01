// components/ProductForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input, Button, Toggle } from '@/components/ui';
import { createProduct, updateProduct } from '@/lib/product-actions';
import { uploadImageAction } from '@/lib/upload-actions';
import { useAutosave } from '@/hooks/useAutosave';
import { AutosaveIndicator } from '@/components/AutosaveIndicator';

interface ProductFormData {
  _id?: string;
  name: string;
  price: number;
  promoPrice: number | null;
  description: string;
  images: string[];
  category: string;
  subcategory: string;
  tags: string[];
  available: boolean;
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  price: 0,
  promoPrice: null,
  description: '',
  images: [],
  category: '',
  subcategory: '',
  tags: [],
  available: true,
};

export function ProductForm({ shopId, initial }: { shopId: string; initial?: ProductFormData }) {
  return initial?._id ? (
    <ProductFormEdit shopId={shopId} initial={initial as ProductFormData & { _id: string }} />
  ) : (
    <ProductFormCreate shopId={shopId} />
  );
}

/* ------------------------------------------------------------------ */
/* Création : formulaire classique, un bouton.                         */
/* ------------------------------------------------------------------ */
function ProductFormCreate({ shopId }: { shopId: string }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const update = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const uploadedUrls: string[] = [];
        for (const file of newFiles) {
          const fd = new FormData();
          fd.set('file', file);
          uploadedUrls.push(await uploadImageAction(fd));
        }
        const payload = { ...form, images: [...form.images, ...uploadedUrls] };
        await createProduct(shopId, payload);
        router.push(`/dashboard/${shopId}`);
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
      <Input label="Nom du produit" value={form.name} onChange={(e) => update('name', e.target.value)} required />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Prix (MAD)"
          type="number"
          value={form.price}
          onChange={(e) => update('price', parseFloat(e.target.value) || 0)}
          required
        />
        <Input
          label="Prix promo (optionnel)"
          type="number"
          value={form.promoPrice ?? ''}
          onChange={(e) => update('promoPrice', e.target.value ? parseFloat(e.target.value) : null)}
        />
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
        Description
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
          className="px-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#2e5e4d]/25 focus:border-[#2e5e4d] font-normal transition"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Catégorie" value={form.category} onChange={(e) => update('category', e.target.value)} />
        <Input label="Sous-catégorie" value={form.subcategory} onChange={(e) => update('subcategory', e.target.value)} />
      </div>

      <Input
        label="Tags (séparés par une virgule)"
        value={form.tags.join(', ')}
        onChange={(e) => update('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium text-stone-700">Images</p>
        <div className="flex gap-2 flex-wrap">
          {form.images.map((url, i) => (
            <div key={url} className="relative w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 ring-1 ring-stone-200">
              <Image src={url} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => update('images', form.images.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-black/60 text-white rounded-full text-xs leading-none"
              >
                ×
              </button>
            </div>
          ))}
          <label className="w-20 h-20 rounded-2xl border border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-xs cursor-pointer hover:border-[#2e5e4d] hover:text-[#2e5e4d] transition-colors text-center px-1">
            + Ajouter
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setNewFiles(Array.from(e.target.files ?? []))}
            />
          </label>
        </div>
        {newFiles.length > 0 && <p className="text-xs text-stone-400">{newFiles.length} fichier(s) prêt(s) à l&apos;envoi</p>}
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-stone-50 border border-stone-100 px-4 py-3">
        <span className="text-sm text-stone-700">Disponible à la vente</span>
        <Toggle checked={form.available} onChange={(v) => update('available', v)} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Enregistrement...' : 'Ajouter le produit'}
      </Button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Édition : autosave. Images uploadées et supprimées immédiatement.   */
/* ------------------------------------------------------------------ */
function ProductFormEdit({ shopId, initial }: { shopId: string; initial: ProductFormData & { _id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(initial);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const update = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const { status, saveInstantly, saveNow } = useAutosave(form, async (data) => {
    await updateProduct(initial._id, data);
  });

  const handleAddFiles = async (files: File[]) => {
    if (!files.length) return;
    setImageUploading(true);
    setImageError(null);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.set('file', file);
        urls.push(await uploadImageAction(fd));
      }
      saveInstantly();
      update('images', [...form.images, ...urls]);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Échec de l'envoi d'une image.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = (idx: number) => {
    saveInstantly();
    update('images', form.images.filter((_, i) => i !== idx));
  };

  return (
    <div className="rounded-3xl border border-stone-200 bg-white/70 backdrop-blur-sm shadow-sm p-6 md:p-8 space-y-5 max-w-xl">
      <Input label="Nom du produit" value={form.name} onChange={(e) => update('name', e.target.value)} onBlur={saveNow} required />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Prix (MAD)"
          type="number"
          value={form.price}
          onChange={(e) => update('price', parseFloat(e.target.value) || 0)}
          onBlur={saveNow}
          required
        />
        <Input
          label="Prix promo (optionnel)"
          type="number"
          value={form.promoPrice ?? ''}
          onChange={(e) => update('promoPrice', e.target.value ? parseFloat(e.target.value) : null)}
          onBlur={saveNow}
        />
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

      <div className="grid grid-cols-2 gap-3">
        <Input label="Catégorie" value={form.category} onChange={(e) => update('category', e.target.value)} onBlur={saveNow} />
        <Input label="Sous-catégorie" value={form.subcategory} onChange={(e) => update('subcategory', e.target.value)} onBlur={saveNow} />
      </div>

      <Input
        label="Tags (séparés par une virgule)"
        value={form.tags.join(', ')}
        onChange={(e) => update('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
        onBlur={saveNow}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium text-stone-700">Images</p>
        <div className="flex gap-2 flex-wrap">
          {form.images.map((url, i) => (
            <div key={url} className="relative w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 ring-1 ring-stone-200">
              <Image src={url} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(i)}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-black/60 text-white rounded-full text-xs leading-none"
              >
                ×
              </button>
            </div>
          ))}
          <label className="w-20 h-20 rounded-2xl border border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-xs cursor-pointer hover:border-[#2e5e4d] hover:text-[#2e5e4d] transition-colors text-center px-1">
            + Ajouter
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleAddFiles(Array.from(e.target.files ?? []))}
            />
          </label>
        </div>
        {imageUploading && <p className="text-xs text-stone-400">Envoi en cours...</p>}
        {imageError && <p className="text-xs text-red-600">{imageError}</p>}
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-stone-50 border border-stone-100 px-4 py-3">
        <span className="text-sm text-stone-700">Disponible à la vente</span>
        <Toggle
          checked={form.available}
          onChange={(v) => {
            saveInstantly();
            update('available', v);
          }}
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <AutosaveIndicator status={status} onRetry={saveNow} />
        <button
          type="button"
          onClick={() => router.push(`/dashboard/${shopId}`)}
          className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
        >
          Retour à la boutique
        </button>
      </div>
    </div>
  );
}