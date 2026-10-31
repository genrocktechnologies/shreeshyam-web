export interface Service {
  id: string;
  titleKey: string;
  textKey: string;
}

const service = (id: string): Service => ({
  id,
  titleKey: `home.services.items.${id}.title`,
  textKey: `home.services.items.${id}.text`,
});

/** The six home-page services, in crawled order. Icons are chosen in Phase 3 (lucide). */
export const services: Service[] = [
  service('financialInclusion'),
  service('womenEmpowerment'),
  service('financialLiteracy'),
  service('entrepreneurshipDevelopment'),
  service('livelihoodPromotion'),
  service('communityWelfare'),
];

export const servicesHeadingKey = 'home.services.heading';
