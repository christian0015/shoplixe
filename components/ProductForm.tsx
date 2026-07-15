// components/ProductForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input, Button, Toggle } from '@/components/ui';
import { createProduct, updateProduct } from '@/lib/product-actions';

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

export function ProductForm({ shopId, initial }: { shopId: string; initial?: ProductFormData }) {
  const router = useRouter();
  const isEdit = Boolean(initial?._id);

  const [form, setForm] = useState<ProductFormData>(
    initial ?? {
      name: '',
      price: 0,
      promoPrice: null,
      description: '',
      images: [],
      category: '',
      subcategory: '',
      tags: [],
      available: true,
    }
  );
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
          const res = await fetch('/api/upload', { method: 'POST', body: fd });
          const { url } = await res.json();
          uploadedUrls.push(url);
        }

        const payload = { ...form, images: [...form.images, ...uploadedUrls] };

        if (isEdit && initial?._id) {
          await updateProduct(initial._id, payload);
        } else {
          await createProduct(shopId, payload);
        }
        router.push(`/dashboard/${shopId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
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
          className="px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:ring-2 focus:ring-orange/40 font-normal"
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
            <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100">
              <Image src={url} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => update('images', form.images.filter((_, idx) => idx !== i))}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <label className="text-sm underline cursor-pointer text-stone-600">
          Ajouter des photos
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => setNewFiles(Array.from(e.target.files ?? []))}
          />
        </label>
        {newFiles.length > 0 && <p className="text-xs text-stone-400">{newFiles.length} fichier(s) prêt(s) à l&apos;envoi</p>}
      </div>

      <Toggle checked={form.available} onChange={(v) => update('available', v)} label="Disponible à la vente" />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Ajouter le produit'}
      </Button>
    </form>
  );
}
