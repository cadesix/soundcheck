import sharp from 'sharp';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

// Test settings to try
const testSettings = [
  { maxWidth: 400, maxHeight: 400, quality: 60 },
  { maxWidth: 400, maxHeight: 400, quality: 70 },
  { maxWidth: 400, maxHeight: 400, quality: 80 },
  { maxWidth: 400, maxHeight: 400, quality: 90 },
  { maxWidth: 800, maxHeight: 800, quality: 60 },
  { maxWidth: 800, maxHeight: 800, quality: 70 },
  { maxWidth: 800, maxHeight: 800, quality: 80 },
  { maxWidth: 800, maxHeight: 800, quality: 90 },
];

async function testCompression(imageUrl: string) {
  console.log('Testing compression settings for:', imageUrl);
  console.log('----------------------------------------');

  // Download image
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error('Failed to download image');
  const buffer = await response.buffer();
  const originalSize = buffer.length;

  // Create output directory
  const outputDir = path.join(process.cwd(), 'test-output');
  await fs.mkdir(outputDir, { recursive: true });

  // Test each setting
  for (const settings of testSettings) {
    try {
      const processedBuffer = await sharp(buffer)
        .resize(settings.maxWidth, settings.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: settings.quality,
          progressive: true
        })
        .toBuffer();

      const processedSize = processedBuffer.length;
      const compressionRatio = originalSize / processedSize;

      // Save test image
      const fileName = `test-${settings.maxWidth}x${settings.maxHeight}-q${settings.quality}.jpg`;
      await fs.writeFile(path.join(outputDir, fileName), processedBuffer);

      console.log(`Settings: ${settings.maxWidth}x${settings.maxHeight}, quality: ${settings.quality}`);
      console.log(`Original size: ${(originalSize / 1024).toFixed(2)}KB`);
      console.log(`Processed size: ${(processedSize / 1024).toFixed(2)}KB`);
      console.log(`Compression ratio: ${compressionRatio.toFixed(2)}x`);
      console.log(`Saved to: ${fileName}`);
      console.log('----------------------------------------');
    } catch (error) {
      console.error(`Error with settings ${JSON.stringify(settings)}:`, error);
    }
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  const imageUrl = process.argv[2];
  if (!imageUrl) {
    console.error('Please provide an image URL as an argument');
    process.exit(1);
  }
  testCompression(imageUrl).catch(console.error);
} 