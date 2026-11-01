import type { PhotoKey } from './images';
import { team } from './team';

/**
 * The gallery is built and tested but NOT published until the client sends at least 12
 * real photos (CR-01, section 7). `enabled` is the one switch: while false there is no
 * nav item, the page is `noindex`, and the sitemap must leave /about/gallery/ out. Setting
 * it to true turns on the header nav item and indexing together.
 *
 * `photos` are shown in order. For now: the real photos we have (two field photos, the
 * award, the team portraits) so the masonry and lightbox are exercised with wide, 4:3 and
 * arch tiles. Replace them with the client's photos when they arrive (process them with
 * scripts/images.ts and give each a frame and focal point in images.ts).
 */
export const gallery: { enabled: boolean; photos: PhotoKey[] } = {
  enabled: false,
  photos: ['heroWomenCards', 'award', 'fieldMeeting', ...team.map((m) => m.photo)],
};
