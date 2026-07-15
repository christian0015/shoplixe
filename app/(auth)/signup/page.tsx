// app/(auth)/signup/page.tsx
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Input, Button, Toggle } from '@/components/ui';
import { createUser } from '@/lib/auth-actions';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createUser({ name, email, password, newsletter });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      }
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 bg-white p-8 rounded-2xl border border-stone-200">
        <h1 className="font-display font-bold text-2xl text-stone-900">Créer un compte</h1>

        <Input label="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <Input label="Confirmer le mot de passe" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />

        <Toggle checked={newsletter} onChange={setNewsletter} label="Recevoir les nouveautés par email" />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Création...' : 'Créer mon compte'}
        </Button>

        <p className="text-sm text-center text-stone-500">
          Déjà un compte ? <Link href="/login" className="underline">Se connecter</Link>
        </p>
      </form>
    </main>
  );
}
