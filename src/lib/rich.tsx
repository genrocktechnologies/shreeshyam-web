import type { ReactNode } from 'react';

/**
 * Tag handlers for messages that keep the old site's emphasis as <b>…</b>
 * (e.g. common.footer.blurb, about.foundation.body1, milestones.award.body1).
 * Render those keys with `t.rich(key, richTags)`; plain `t()` would print the tags.
 */
export const richTags = {
  b: (chunks: ReactNode) => <strong className="font-bold">{chunks}</strong>,
};
