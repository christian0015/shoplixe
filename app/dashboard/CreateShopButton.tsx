// app/dashboard/CreateShopButton.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';

export function CreateShopButton({
  label = 'Créer ma boutique',
  variant = 'primary',
}: {
  label?: string;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <Link href="/dashboard/new">
      <Button variant={variant}>{label}</Button>
    </Link>
  );
}
