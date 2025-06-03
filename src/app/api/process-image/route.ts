import { NextResponse } from 'next/server';
import sharp from 'sharp';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Types for image processing
type ImageType = 'profile' | 'thumbnail' | 'cover';

// Compression settings for different image types
const compressionSettings = {
  profile: {
    maxWidth: 400,
    maxHeight: 400,
    quality: 80,
  },
  thumbnail: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 85,
  },
  cover: {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 90,
  },
};

// Helper function to generate filename
function generateFileName(originalUrl: string, type: ImageType): string {
  const timestamp = Date.now();
  const hash = Buffer.from(originalUrl).toString('base64').slice(0, 8);
  return `${type}/${timestamp}-${hash}.jpg`;
}

// Helper function to process image
async function processImage(buffer: Buffer, type: ImageType) {
  const settings = compressionSettings[type];
  
  return await sharp(buffer)
    .resize(settings.maxWidth, settings.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({
      quality: settings.quality,
      progressive: true
    })
    .toBuffer();
}

export async function POST(request: Request) {
  const startTime = Date.now();
  let originalSize = 0;
  let processedSize = 0;

  try {
    // Parse request body
    const { imageUrl, type } = await request.json();

    // Validate input
    if (!imageUrl || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['profile', 'thumbnail', 'cover'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid image type' },
        { status: 400 }
      );
    }

    // Download image
    console.log(`Downloading image from: ${imageUrl}`);
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    const buffer = await response.buffer();
    originalSize = buffer.length;

    // Process image
    console.log(`Processing image as ${type}`);
    const processedBuffer = await processImage(buffer, type as ImageType);
    processedSize = processedBuffer.length;

    // Generate filename
    const fileName = generateFileName(imageUrl, type as ImageType);

    // Upload to Supabase
    console.log(`Uploading to Supabase: ${fileName}`);
    const { error: uploadError } = await supabase.storage
      .from('tiktok-images')
      .upload(fileName, processedBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Failed to upload to Supabase: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('tiktok-images')
      .getPublicUrl(fileName);

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    // Return success response
    return NextResponse.json({
      url: publicUrl,
      stats: {
        originalSize,
        processedSize,
        compressionRatio: originalSize / processedSize,
        processingTime: `${processingTime}ms`
      }
    });

  } catch (error) {
    console.error('Error processing image:', error);
    
    // Return error response
    return NextResponse.json(
      {
        error: 'Failed to process image',
        details: error instanceof Error ? error.message : 'Unknown error',
        stats: {
          originalSize,
          processedSize,
          processingTime: `${Date.now() - startTime}ms`
        }
      },
      { status: 500 }
    );
  }
} 