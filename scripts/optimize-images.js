#!/usr/bin/env node

/**
 * Image optimization script
 * Converts JPG/PNG to AVIF and WebP formats with responsive sizes
 * Generates srcset-ready images for multiple breakpoints
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const SOURCE_DIR = 'src/assets/images';
const OUTPUT_DIR = 'src/assets/images/optimized';
const SIZES = [640, 1024, 1280, 1920]; // Responsive breakpoints
const FORMATS = ['avif', 'webp', 'jpeg']; // Keep original jpeg as fallback

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath, ext);
  const dirname = path.dirname(filePath).replace(SOURCE_DIR, '').slice(1) || '';
  const outSubdir = dirname ? path.join(OUTPUT_DIR, dirname) : OUTPUT_DIR;

  // Create subdirectories if needed
  if (!fs.existsSync(outSubdir)) {
    fs.mkdirSync(outSubdir, { recursive: true });
  }

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    console.log(`📸 Processing: ${filePath} (${metadata.width}x${metadata.height})`);

    // Process each size
    for (const size of SIZES) {
      // Skip if original is smaller
      if (metadata.width < size) continue;

      // Generate AVIF
      await image
        .resize(size, Math.round((size / metadata.width) * metadata.height), {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .avif({ quality: 80 })
        .toFile(path.join(outSubdir, `${basename}-${size}w.avif`));

      // Generate WebP
      await image
        .resize(size, Math.round((size / metadata.width) * metadata.height), {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: 80 })
        .toFile(path.join(outSubdir, `${basename}-${size}w.webp`));

      // Generate JPEG fallback
      await image
        .resize(size, Math.round((size / metadata.width) * metadata.height), {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ quality: 80 })
        .toFile(path.join(outSubdir, `${basename}-${size}w.jpg`));

      console.log(`  ✓ Generated ${size}w formats`);
    }

    // Also save full-size versions
    for (const format of FORMATS) {
      const formatMethod = format === 'jpeg' ? 'jpg' : format;
      await image[formatMethod === 'jpg' ? 'jpeg' : formatMethod](
        format === 'avif' ? { quality: 80 } :
        format === 'webp' ? { quality: 80 } :
        { quality: 80 }
      ).toFile(path.join(outSubdir, `${basename}-full.${formatMethod}`));
    }
    console.log(`  ✓ Generated full-size versions\n`);

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

async function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // Skip the optimized directory to prevent recursion
    if (file === 'optimized') {
      continue;
    }

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      await processDirectory(filePath);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        await optimizeImage(filePath);
      }
    }
  }
}

// Main execution
(async () => {
  console.log('🚀 Starting image optimization...\n');
  try {
    await processDirectory(SOURCE_DIR);
    console.log('✅ Image optimization complete!\n');
    console.log('Generated images in:', OUTPUT_DIR);
  } catch (error) {
    console.error('❌ Optimization failed:', error);
    process.exit(1);
  }
})();
