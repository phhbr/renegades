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
const QUALITY = { avif: 50, webp: 80, jpg: 80 };
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
    const metadata = await sharp(filePath).metadata();

    console.log(`📸 Processing: ${filePath} (${metadata.width}x${metadata.height})`);

    // A sharp instance is a mutable pipeline, so every output needs its own: reusing one
    // leaks the previous .resize() into the next write, which silently capped the
    // "full-size" versions at the last generated breakpoint.
    // AVIF's quality scale is not JPEG's: at 80 it encodes larger files than the JPEG
    // fallback it is meant to replace, so browsers picked the heaviest source in the
    // <picture>. ~50 is the visual equivalent of JPEG 80 at roughly half the bytes.
    const encode = (pipeline, format, target) =>
      pipeline[format === 'jpg' ? 'jpeg' : format]({ quality: QUALITY[format] }).toFile(target);

    // Process each size
    for (const size of SIZES) {
      // Skip if original is smaller
      if (metadata.width < size) continue;

      for (const format of ['avif', 'webp', 'jpg']) {
        await encode(
          sharp(filePath).resize(size, Math.round((size / metadata.width) * metadata.height), {
            withoutEnlargement: true,
            fit: 'inside'
          }),
          format,
          path.join(outSubdir, `${basename}-${size}w.${format}`)
        );
      }

      console.log(`  ✓ Generated ${size}w formats`);
    }

    // Also save full-size versions
    for (const format of FORMATS) {
      const ext = format === 'jpeg' ? 'jpg' : format;
      await encode(sharp(filePath), ext, path.join(outSubdir, `${basename}-full.${ext}`));
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
