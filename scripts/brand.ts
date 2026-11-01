/**
 * Exports optimised logo files to public/brand/ and the app icons to src/app/.
 *
 *   pnpm exec tsx scripts/brand.ts
 *
 * Source: client-inputs/logo/ (client-supplied). If that folder is missing, falls back to
 * the crawled logo in assets/original/. Files are only resized and recompressed; the
 * artwork is never altered.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(__dirname, '..');
const CLIENT = path.join(ROOT, 'client-inputs', 'logo');
const CRAWLED = path.join(ROOT, 'assets', 'original', 'index');
const OUT = path.join(ROOT, 'public', 'brand');
const APP = path.join(ROOT, 'src', 'app');

/** [output name, client source, crawled fallback, max width]. */
const LOGOS: [string, string, string | null, number][] = [
  ['logo-full', 'logo-full.png', 'logo-white.webp', 640], // full colour, for light backgrounds
  ['logo-white', 'logo-white.png', 'white_img_2.png', 640], // reversed, for rani/plum backgrounds
  // Display sizes used by <Logo> (header ≈56px tall, footer ≈80px; 2× for retina).
  ['logo-full-240', 'logo-full.png', 'logo-white.webp', 240],
  ['logo-white-320', 'logo-white.png', 'white_img_2.png', 320],
  ['logo-mark', 'logo-mark.png', null, 512],
  // CR-01 lockup emblem (header ≈76px tall, footer ≈64px; 2× for retina).
  ['logo-mark-160', 'logo-mark.png', null, 160],
  ['logo-wordmark', 'logo-wordmark.png', null, 640],
  ['logo-wordmark-white', 'logo-wordmark-white.png', null, 640],
];

const kb = (n: number) => `${(n / 1024).toFixed(0)} KB`;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const useClient = fs.existsSync(CLIENT);
  console.log(`Logo source: ${useClient ? 'client-inputs/logo' : 'assets/original (crawled; client files missing)'}`);

  for (const [name, clientFile, crawledFile, maxWidth] of LOGOS) {
    const src = useClient ? path.join(CLIENT, clientFile) : crawledFile && path.join(CRAWLED, crawledFile);
    if (!src || !fs.existsSync(src)) {
      console.log(`  - ${name}: no source, skipped`);
      continue;
    }
    const img = sharp(src).resize({ width: maxWidth, withoutEnlargement: true });
    const webp = await img.clone().webp({ quality: 85, alphaQuality: 90, effort: 6 }).toFile(path.join(OUT, `${name}.webp`));
    // PNG copy for JSON-LD, OG templates and email, where WebP isn't safe.
    const png = await img.clone().png({ compressionLevel: 9, palette: true, quality: 95, effort: 10 }).toFile(path.join(OUT, `${name}.png`));
    console.log(`  ✓ ${name}: ${webp.width}×${webp.height}  webp ${kb(webp.size)}  png ${kb(png.size)}`);
  }

  // App Router icon conventions: src/app/icon.png, apple-icon.png, favicon.ico.
  if (useClient && fs.existsSync(path.join(CLIENT, 'icon.png'))) {
    const icon = await sharp(path.join(CLIENT, 'icon.png'))
      .resize(512, 512, { fit: 'cover' })
      .png({ compressionLevel: 9, palette: true, quality: 95, effort: 10 })
      .toFile(path.join(APP, 'icon.png'));
    const apple = await sharp(path.join(CLIENT, 'apple-icon.png'))
      .resize(180, 180, { fit: 'cover' })
      .flatten({ background: '#FFFCF6' }) // iOS ignores transparency
      .png({ compressionLevel: 9, palette: true, quality: 95, effort: 10 })
      .toFile(path.join(APP, 'apple-icon.png'));
    fs.copyFileSync(path.join(CLIENT, 'favicon.ico'), path.join(APP, 'favicon.ico'));
    console.log(`  ✓ icons: icon.png ${kb(icon.size)}, apple-icon.png ${kb(apple.size)}, favicon.ico copied`);
  } else {
    console.log('  ! No client icons. Generate them from a tight crop of the emblem and show the crop before committing.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
