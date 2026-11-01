import howToJoin from '../../messages/en/howToJoin.json';

/** Membership routes (CR-01, section 7): one page replaces How to Join and Register. */
export const membershipRoutes = {
  membership: '/membership/',
  /** The registration form on the Membership page (mobile bar, CTA bands). */
  register: '/membership/#register',
} as const;

/** Crawled How to Join lists, in order: benefits and eligibility (the documents checklist). */
export const membershipBenefitKeys = Object.keys(howToJoin.benefits.items).map((k) => `howToJoin.benefits.items.${k}`);
export const membershipEligibilityKeys = Object.keys(howToJoin.eligibility.items).map((k) => `howToJoin.eligibility.items.${k}`);
