'use server';
// lib/upload-actions.ts

import { requireSession } from '@/lib/session';
import { uploadImage } from '@/lib/cloudinary';

/**
 * Server action appelable directement depuis un composant client,
 * sans passer par une route API — évite l'aller-retour HTTP supplémentaire.
 */
export async function uploadImageAction(formData: FormData): Promise<string> {
  // On protège l'action : seul un utilisateur connecté peut uploader.
  await requireSession();
  return uploadImage(formData);
}