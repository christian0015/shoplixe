// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const formData = await request.formData();
    const url = await uploadImage(formData);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Échec de l'upload" }, { status: 500 });
  }
}
