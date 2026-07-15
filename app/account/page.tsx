// app/account/page.tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { ProfileForm } from './ProfileForm';

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  await connectDB();
  const user = await User.findById(session.userId).lean();
  if (!user) redirect('/login');

  const plainUser = JSON.parse(JSON.stringify(user));

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-2xl mb-6">Mon profil</h1>
      <ProfileForm user={plainUser} />
    </main>
  );
}
