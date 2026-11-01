import type { PhotoKey } from './images';
import { team } from './team';

/**
 * The gallery is built and tested but NOT published until the client sends gallery photos
 * (client-requests, E. Media). While false: no nav or footer link, `noindex`, and the
 * Phase 8 sitemap must leave /about/gallery/ out.
 */
export const galleryPublished = false;

/**
 * Photos shown in the gallery, in order. For now: the real photos we have (two field
 * photos, the award, the team portraits) so the masonry and lightbox are exercised with
 * wide, 4:3 and arch tiles. Replace with the client's photos when they arrive (process
 * them with scripts/images.ts and give each a frame and focal point in images.ts).
 */
export const galleryPhotos: PhotoKey[] = ['heroWomenCards', 'award', 'fieldMeeting', ...team.map((m) => m.photo)];
