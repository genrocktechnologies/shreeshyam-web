import type { PhotoKey } from './images';

export interface ProcessStep {
  id: string;
  titleKey: string;
  textKey: string;
  image: PhotoKey;
}

const step = (id: string, image: PhotoKey): ProcessStep => ({
  id,
  titleKey: `home.process.steps.${id}.title`,
  textKey: `home.process.steps.${id}.text`,
  image,
});

/** The three home-page process steps, in crawled order, with their field-photo crops. */
export const processSteps: ProcessStep[] = [
  step('registration', 'processStepRegistration'),
  step('support', 'processStepSupport'),
  step('monitoring', 'processStepMonitoring'),
];

export const processHeadingKey = 'home.process.heading';
export const howToJoinHref = '/how-to-join/';
