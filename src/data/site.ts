/**
 * Site-wide facts. Client-confirmed values (docs/client-requests.md → "Confirmed")
 * override crawled ones. Anything not yet supplied is `null`, and the UI that depends on
 * it must render nothing (CLAUDE.md, content rule 5).
 *
 * Display text (address, hours) lives in messages/<locale>/common.json so it can be
 * translated; this file holds the machine-readable values and links.
 */

export type SocialNetwork = 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'whatsapp';

export interface SocialLink {
  network: SocialNetwork;
  url: string;
  /**
   * true = temporary placeholder at the client's request (the network's home page).
   * Rendered as an icon opening in a new tab, excluded from JSON-LD `sameAs`, and the
   * Phase 8 launch check fails while any remain.
   */
  placeholder: boolean;
}

export interface Site {
  url: string;
  nameKey: string;
  /**
   * Header and footer brand (CR-01, section 3). 'typeset': the real emblem (logo-mark,
   * never cropped or recoloured) beside the typeset two-line name and tagline: a new
   * lockup, pending client approval. 'image': the one-line fallback, the client's full
   * logo file (logo-full / logo-white) exactly as supplied.
   */
  logoLockup: 'typeset' | 'image';
  phone: { display: string; e164: string; href: string } | null;
  whatsapp: { e164: string; href: string } | null;
  email: string;
  address: {
    textKey: string;
    streetAddress: string;
    locality: string;
    region: string;
    postalCode: string;
    country: 'IN';
  };
  map: {
    pinNameKey: string;
    /** Confirmed pin: Motihari Chini Mill. */
    pinAddress: string;
    plusCode: string;
    shortUrl: string;
    embedUrl: string;
  };
  hours: {
    textKey: string;
    opens: string;
    closes: string;
    /** Not confirmed yet: show the time only and omit JSON-LD openingHours. */
    days: string[] | null;
  };
  socials: SocialLink[];
  /** Pending client inputs (B. Trust & compliance). Hidden slots until supplied. */
  legal: { registration: string; regulatoryStatus: string } | null;
  grievance: { name: string; phone: string | null; email: string | null } | null;
  fraudNotice: { textKey: string } | null;
}

export const site: Site = {
  url: 'https://shreeshyamfoundation.in',
  nameKey: 'common.siteName',
  logoLockup: 'typeset',
  phone: { display: '+91 87509 71329', e164: '+918750971329', href: 'tel:+918750971329' },
  // Not confirmed. Switching it on is one line: { e164: '+91…', href: 'https://wa.me/91…' }.
  whatsapp: null,
  email: 'shreeshyamfoundation2026@gmail.com',
  address: {
    textKey: 'common.contact.address',
    streetAddress: 'Shambu Sah Building Near Transformer, Bariyarpur',
    locality: 'Motihari',
    region: 'Bihar',
    postalCode: '845401',
    country: 'IN',
  },
  map: {
    pinNameKey: 'common.contact.mapPinName',
    pinAddress: 'JWP7+H82, Maharshi Nagar, Chhota Bariyarpur, Motihari, Lauthaha, Bihar 845401',
    plusCode: 'JWP7+H82',
    shortUrl: 'https://maps.app.goo.gl/CE8evf9puHXMrTCe7',
    // Embed from the live contact page; it is already pinned to Motihari Chini Mill.
    embedUrl:
      'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14266.622959147255!2d84.894306!3d26.6274794!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399334ecbb7f97ad%3A0x7113dbc006fbb9ac!2sMotihari%20Chini%20Mill!5e0!3m2!1sen!2sin!4v1783409913813!5m2!1sen!2sin',
  },
  hours: { textKey: 'common.contact.hours', opens: '09:00', closes: '21:00', days: null },
  // Placeholders exactly as on the live site, kept at the client's request.
  socials: [
    { network: 'facebook', url: 'https://www.facebook.com/', placeholder: true },
    { network: 'linkedin', url: 'https://www.linkedin.com/', placeholder: true },
    { network: 'twitter', url: 'https://twitter.com/', placeholder: true },
    { network: 'instagram', url: 'https://www.instagram.com/', placeholder: true },
  ],
  legal: null,
  grievance: null,
  fraudNotice: null,
};

/** Social links safe for JSON-LD `sameAs` (never placeholders). */
export const realSocials = () => site.socials.filter((s) => !s.placeholder);
