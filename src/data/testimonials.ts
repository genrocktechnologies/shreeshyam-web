export interface Testimonial {
  id: string;
  quoteKey: string;
  nameKey: string;
}

const testimonial = (id: string): Testimonial => ({
  id,
  quoteKey: `home.testimonials.items.${id}.quote`,
  nameKey: `home.testimonials.items.${id}.name`,
});

/**
 * Exactly as crawled (content rule 9). There are no photos, so TestimonialCard uses an
 * initials avatar. Flagged for client confirmation before launch (D16).
 */
export const testimonials: Testimonial[] = [
  testimonial('sunitaDevi'),
  testimonial('rajeshKumar'),
  testimonial('anitaSharma'),
  testimonial('maheshYadav'),
];

export const testimonialsHeadingKey = 'home.testimonials.heading';
export const testimonialsLeadKey = 'home.testimonials.lead';

/** Initials for the avatar, from the translated name ("Sunita Devi" → "SD"). */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => Array.from(w)[0]?.toUpperCase() ?? '')
    .join('');
}
