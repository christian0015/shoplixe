// app/account/ProfileForm.tsx
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Input, Toggle } from '@/components/ui';
import { updateProfile } from '@/lib/user-actions';

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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleFile = (file: File | null) => {
    setAvatarFile(file);
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      let avatarForm: FormData | undefined;
      if (avatarFile) {
        avatarForm = new FormData();
        avatarForm.set('file', avatarFile);
      }
      await updateProfile({ name, phone, newsletter }, avatarForm);
      setSaved(true);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-stone-200 bg-white/70 backdrop-blur-sm shadow-sm p-6 md:p-8 space-y-6"
    >
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
        </div>
      </div>

      <div className="h-px bg-stone-100" />

      <div className="space-y-4">
        <Input label="Email" value={user.email} disabled />
        <Input label="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Téléphone (WhatsApp)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <div className="flex items-center justify-between rounded-2xl bg-stone-50 border border-stone-100 px-4 py-3">
          <span className="text-sm text-stone-700">Recevoir les nouveautés par email</span>
          <Toggle checked={newsletter} onChange={setNewsletter} label="Recevoir les nouveautés par email" />
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3 rounded-full bg-[#2e5e4d] text-white text-sm font-semibold hover:bg-[#518c76] transition-all shadow-md shadow-[#5ac9a2]/20 disabled:opacity-60"
        >
          {isPending ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        {saved && <p className="text-sm text-[#2e5e4d] font-medium">Profil mis à jour ✓</p>}
      </div>
    </form>
  );
}