import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

const BUCKET_NAME = 'receipts';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const SIGNED_URL_EXPIRY = 3600; // 1 hour

// Polyfill-safe UUID generator
function generateId(): string {
  // Use crypto if available, otherwise timestamp+random fallback
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {}
  // Fallback: timestamp + random hex
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export const storageService = {
  /**
   * Uploads a receipt file to private Supabase Storage.
   * Returns the STORAGE PATH (not a public URL).
   * Use getSignedUrl() to access the file.
   */
  async uploadReceipt(
    uri: string,
    expenseId: string,
    userId: string,
    functionId?: string
  ): Promise<string> {
    if (!userId) throw new Error('Authentication required to upload receipts.');

    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) throw new Error('File not found');

    if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE) {
      throw new Error('File too large. Maximum size is 5 MB.');
    }

    const extension = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mimeTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      pdf: 'application/pdf',
    };
    const contentType = mimeTypeMap[extension] ?? 'image/jpeg';

    if (!ALLOWED_TYPES.includes(contentType)) {
      throw new Error('Invalid file type. Allowed types: JPEG, PNG, WebP, PDF.');
    }

    // UUID-based path — do not expose user/expense IDs in public filenames
    const uuid = generateId();
    const fnSegment = functionId ? `${functionId}/` : 'general/';
    const filePath = `${fnSegment}${expenseId}/${uuid}.${extension}`;

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const arrayBuffer = decode(base64);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, arrayBuffer, { contentType, upsert: false });

    if (error) {
      console.error('Receipt upload error:', error.message);
      throw new Error(`Failed to upload receipt: ${error.message}`);
    }

    // Return the storage PATH, not a public URL
    return filePath;
  },

  /**
   * Generates a short-lived signed URL for an authenticated user to view a receipt.
   * Default expiry: 1 hour.
   */
  async getSignedUrl(storagePath: string, expiresIn = SIGNED_URL_EXPIRY): Promise<string> {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, expiresIn);

    if (error || !data?.signedUrl) {
      console.error('Signed URL error:', error?.message);
      throw new Error('Unable to generate receipt access link.');
    }
    return data.signedUrl;
  },

  /**
   * Deletes a receipt by its storage path.
   */
  async deleteReceipt(storagePath: string): Promise<void> {
    // Handle both legacy public URLs and new storage paths
    let path = storagePath;
    if (storagePath.includes('/storage/v1/object/')) {
      // Legacy public URL format — extract path after bucket name
      const match = storagePath.match(new RegExp(`/${BUCKET_NAME}/(.+)$`));
      path = match ? match[1] : storagePath;
    }
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);
    if (error) {
      console.error('Receipt delete error:', error.message);
      throw new Error(`Failed to delete receipt: ${error.message}`);
    }
  },

  /**
   * @deprecated Use getSignedUrl() instead for private buckets.
   * Kept for backward compatibility during migration only.
   */
  getPublicUrl(path: string): string {
    console.warn('storageService.getPublicUrl() is deprecated. Use getSignedUrl() instead.');
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return data.publicUrl;
  },
};
