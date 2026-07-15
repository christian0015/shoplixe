// app/account/ProfileForm.tsx
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Input, Button, Toggle } from '@/components/ui';
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-stone-200">
          {avatarPreview && <Image src={avatarPreview} alt="" fill className="object-cover" />}
        </div>
        <label className="text-sm underline cursor-pointer text-stone-600">
          Changer la photo
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>

      <Input label="Email" value={user.email} disabled />
      <Input label="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Téléphone (WhatsApp)" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Toggle checked={newsletter} onChange={setNewsletter} label="Recevoir les nouveautés par email" />

      {saved && <p className="text-sm text-green-600">Profil mis à jour.</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Enregistrement...' : 'Enregistrer'}
      </Button>
    </form>
  );
}
