import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type ImageType = 'profile' | 'thumbnail' | 'cover';

export async function processAndStoreImage(imageUrl: string, type: ImageType): Promise<string> {
  try {
    // First check if we already have this image in our storage
    const existingImage = await supabase
      .from('processed_images')
      .select('processed_url')
      .eq('original_url', imageUrl)
      .single();

    if (existingImage?.data?.processed_url) {
      return existingImage.data.processed_url;
    }

    // If not, process and store the image
    const response = await fetch('/api/process-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl, type }),
    });

    if (!response.ok) {
      throw new Error('Failed to process image');
    }

    const { url: processedUrl } = await response.json();

    // Store the mapping in the database
    await supabase
      .from('processed_images')
      .insert({
        original_url: imageUrl,
        processed_url: processedUrl,
        type,
      });

    return processedUrl;
  } catch (error) {
    console.error('Error processing image:', error);
    // Return the original URL as fallback
    return imageUrl;
  }
} 