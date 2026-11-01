/**
 * Optimises the real photos and illustrations from assets/original into public/images/.
 *
 *   pnpm exec tsx scripts/images.ts
 *
 * - AVIF + WebP at 480 / 960 / 1600 px wide (never upscaled).
 * - Photos get the consistent "slight warm lift" grade from design-system.md and a tiny
 *   blur placeholder. Illustrations (transparent PNGs) get neither.
 * - Writes src/data/images.generated.json, the manifest read by src/data/images.ts and
 *   the <Picture> component.
 * - Fails if the hero exceeds the 120 KB performance budget.
 *
 * Theme decorations from the old site (counter background, divider line, icon SVGs) and
 * the old logos are deliberately not included: the new design uses lucide icons and the
 * client's logo files (public/brand/).
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp, { type Sharp } from 'sharp';

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'original');
const OUT = path.join(ROOT, 'public', 'images');
const MANIFEST = path.join(ROOT, 'src', 'data', 'images.generated.json');

const WIDTHS = [480, 960, 1600];
/** The hero image(s): above the fold, held to the 120 KB budget. */
const HERO_KEYS = new Set(['heroArch']);
const HERO_BUDGET = 120 * 1024;

type Kind = 'photo' | 'illustration';
/** Optional crop in source pixels (docs/photo-candidates.html shows each one). */
type Crop = { left: number; top: number; width: number; height: number };

/** key → [source under assets/original, kind, crop?]. Keys match `common.alt.<key>` in messages. */
const IMAGES: Record<string, [string, Kind, Crop?]> = {
  // Home page crops chosen in docs/photo-candidates.html (Phase 3).
  heroArch: ['index/finance_banner.jpg', 'photo', { left: 600, top: 0, width: 819, height: 1024 }],
  aboutArch: ['index/best_hrms_banner.jpg', 'photo', { left: 560, top: 0, width: 819, height: 1024 }],
  processStepRegistration: ['index/finance_banner.jpg', 'photo', { left: 0, top: 0, width: 1000, height: 750 }],
  processStepSupport: ['index/best_hrms_banner.jpg', 'photo', { left: 0, top: 330, width: 900, height: 675 }],
  processStepMonitoring: ['index/best_hrms_banner.jpg', 'photo', { left: 1150, top: 60, width: 770, height: 578 }],
  // Phase 5: About hero. Same source as the home hero, but the right-hand group (a different
  // person in focus), so the inner page never repeats the home crop.
  aboutHeroArch: ['index/finance_banner.jpg', 'photo', { left: 1101, top: 0, width: 819, height: 1024 }],
  heroWomenCards: ['index/finance_banner.jpg', 'photo'],
  fieldMeeting: ['index/best_hrms_banner.jpg', 'photo'],
  membersLedger: ['index/about_me.jpg', 'photo'],
  membersCircle: ['about-us/thumb1.jpg', 'photo'],
  visionGroup: ['our-vision/vision.jpg', 'photo'],
  award: ['index/our-awards.jpeg', 'photo'],
  bannerAbout: ['about-us/about_us_hero.jpg', 'photo'],
  bannerContact: ['contact-us/contact_us.jpg', 'photo'],
  processRegistration: ['index/Registration.png', 'illustration'],
  processSupport: ['index/support.png', 'illustration'],
  processCommunity: ['index/Community.png', 'illustration'],
  careers: ['career/career.png', 'illustration'],
  // Team portraits, keyed by the member ids in messages/en/team.json.
  teamSatyamPushkar: ['index/satyam.jpg', 'photo'],
  teamRanjeetKumar: ['index/Ranjeet.jpg', 'photo'],
  teamSumitKumar: ['index/sumit.jpg', 'photo'],
  teamSauravPrakash: ['index/saurav.jpg', 'photo'],
  teamVikramSinha: ['index/vikram-kumar.jpg', 'photo'],
  teamSonuKumar: ['index/sonu-kumar.jpg', 'photo'],
  teamShishirKumar: ['index/Shishir.jpg', 'photo'],
};

export interface ImageEntry {
  kind: Kind;
  width: number;
  height: number;
  widths: number[];
  /** Base path without width/extension, e.g. "/images/award". */
  base: string;
  /** Tiny WebP data URI for photos; null for illustrations (transparent). */
  blur: string | null;
  source: string;
}

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const kb = (n: number) => `${(n / 1024).toFixed(0)} KB`;

/** Slight warm lift: a touch brighter and warmer, never a heavy filter. */
const grade = (img: Sharp) =>
  img.modulate({ brightness: 1.02, saturation: 1.04 }).recomb([
    [1.03, 0, 0],
    [0, 1.0, 0],
    [0, 0, 0.96],
  ]);

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const manifest: Record<string, ImageEntry> = {};
  let failed = false;

  for (const [key, [rel, kind, crop]] of Object.entries(IMAGES)) {
    const src = path.join(SRC, rel);
    if (!fs.existsSync(src)) throw new Error(`${key}: missing source ${rel}`);
    const load = () => (crop ? sharp(src).rotate().extract(crop) : sharp(src).rotate());
    const meta = await sharp(src).metadata();
    const width = crop?.width ?? meta.width!;
    const height = crop?.height ?? meta.height!;
    // Never upscale. Small originals get one size; a near-duplicate of 480 is dropped.
    let widths = WIDTHS.filter((w) => w <= width);
    if (!widths.length) widths = [width];
    else if (width > widths[widths.length - 1] * 1.15 && width < 1600) widths.push(width);

    const name = kebab(key);
    const sizes: string[] = [];
    for (const w of widths) {
      const base = load().resize({ width: w, withoutEnlargement: true });
      const img = kind === 'photo' ? grade(base) : base;
      const avif = await img.clone().avif({ quality: kind === 'photo' ? 50 : 60, effort: 6 }).toFile(path.join(OUT, `${name}-${w}.avif`));
      const webp = await img.clone().webp({ quality: kind === 'photo' ? 74 : 85, effort: 6, alphaQuality: 90 }).toFile(path.join(OUT, `${name}-${w}.webp`));
      sizes.push(`${w}: ${kb(avif.size)}/${kb(webp.size)}`);
      if (HERO_KEYS.has(key) && (avif.size > HERO_BUDGET || webp.size > HERO_BUDGET)) {
        console.error(`  ✗ ${key} ${w}px exceeds the 120 KB hero budget (avif ${kb(avif.size)}, webp ${kb(webp.size)})`);
        failed = true;
      }
    }

    const blur =
      kind === 'photo'
        ? `data:image/webp;base64,${(await grade(load().resize({ width: 16 })).webp({ quality: 40 }).toBuffer()).toString('base64')}`
        : null;

    manifest[key] = { kind, width, height, widths, base: `/images/${name}`, blur, source: `assets/original/${rel}${crop ? ` (crop ${crop.left},${crop.top} ${crop.width}×${crop.height})` : ''}` };
    console.log(`  ✓ ${key.padEnd(20)} ${width}×${height}  ${sizes.join('  ')}  (avif/webp)`);
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Wrote ${path.relative(ROOT, MANIFEST)} (${Object.keys(manifest).length} images).`);
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
