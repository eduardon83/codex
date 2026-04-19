import { supabase } from '@/integrations/supabase/client';

/**
 * Upload a File object to a Supabase storage bucket.
 * Returns the permanent public URL, or null on failure.
 */
export async function uploadFileToStorage(
  bucket: string,
  path: string,
  file: File | Blob,
): Promise<string | null> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  if (error) {
    console.error(`Storage upload failed (${bucket}/${path}):`, error.message);
    return null;
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  // Cache-bust so browsers always pick up the latest version
  return `${data.publicUrl}?t=${Date.now()}`;
}

/**
 * Download an image from an external URL and re-upload it to Supabase storage.
 * Returns the permanent public URL, or null on failure.
 */
export async function reuploadExternalImage(
  externalUrl: string,
  bucket: string,
  path: string,
): Promise<string | null> {
  if (!externalUrl) return null;
  try {
    const res = await fetch(externalUrl);
    if (!res.ok) return null;
    const blob = await res.blob();
    return uploadFileToStorage(bucket, path, blob);
  } catch (e) {
    console.warn('Failed to re-upload external image:', e);
    return null;
  }
}
