import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET_NAME = 'tiktok-images';

export async function downloadAndProcessImage(imageUrl: string, fileName: string): Promise<string> {
  try {
    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to download image');
    const buffer = await response.buffer();

    // Process the image with Sharp
    const processedBuffer = await sharp(buffer)
      .resize(800, 800, { // Resize to reasonable dimensions
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ // Convert to JPEG for better compression
        quality: 80, // Good balance between quality and size
        progressive: true // Progressive loading
      })
      .toBuffer();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, processedBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

// Helper function to generate a unique filename
export function generateImageFileName(originalUrl: string, type: 'profile' | 'thumbnail' | 'cover'): string {
  const timestamp = Date.now();
  const hash = Buffer.from(originalUrl).toString('base64').slice(0, 8);
  return `${type}/${timestamp}-${hash}.jpg`;
} 