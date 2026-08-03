// app/(auth)/login/page.tsx
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { unstable_rethrow } from 'next/navigation';
import { Input, Button } from '@/components/ui';
import { authenticateUser } from '@/lib/auth-actions';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await authenticateUser({ email, password });
        // Si authenticateUser réussit, il redirige lui-même — on n'atteint
        // ce point que s'il a retourné une erreur "attendue".
        if (result?.error) setError(result.error);
      } catch (err) {
        // Laisse passer les redirections internes de Next.js (ex: redirect('/dashboard')
        // après connexion réussie) — sans ça, elles s'affichaient comme une erreur rouge.
        unstable_rethrow(err);
        setError('Une erreur est survenue. Réessayez dans un instant.');
      }
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 bg-white p-8 rounded-2xl border border-stone-200">
        <h1 className="font-display font-bold text-2xl text-stone-900">Se connecter</h1>

        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Connexion...' : 'Se connecter'}
        </Button>

        <p className="text-sm text-center text-stone-500">
          Pas encore de compte ? <Link href="/signup" className="underline">Créer un compte</Link>
        </p>
      </form>
    </main>
  );
}