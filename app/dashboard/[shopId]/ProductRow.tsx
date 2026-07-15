// app/dashboard/[shopId]/ProductRow.tsx
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Toggle } from '@/components/ui';
import { updateProduct, deleteProduct } from '@/lib/product-actions';

interface Product {
  _id: string;
  name: string;
  price: number;
  promoPrice: number | null;
  images: string[];
  available: boolean;
  slug: string;
}

export function ProductRow({ product, shopId }: { product: Product; shopId: string }) {
  const [available, setAvailable] = useState(product.available);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = (value: boolean) => {
    setAvailable(value);
    startTransition(async () => {
      await updateProduct(product._id, { available: value });
    });
  };

  const handleDelete = () => {
    if (!confirm(`Supprimer "${product.name}" ?`)) return;
    startTransition(async () => {
      await deleteProduct(product._id);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-3">
      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-800 shrink-0">
        {product.images[0] && <Image src={product.images[0]} alt={product.name} fill className="object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{product.name}</p>
        <p className="text-xs text-stone-400 font-mono">
          {product.promoPrice ? (
            <>
              <span className="line-through mr-1">{product.price} MAD</span>
              {product.promoPrice} MAD
            </>
          ) : (
            `${product.price} MAD`
          )}
        </p>
      </div>
      <Toggle checked={available} onChange={handleToggle} />
      <Link href={`/dashboard/${shopId}/products/${product._id}`} className="text-xs underline text-stone-300">
        Modifier
      </Link>
      <button onClick={handleDelete} disabled={isPending} className="text-xs text-red-400 underline">
        Supprimer
      </button>
    </div>
  );
}
