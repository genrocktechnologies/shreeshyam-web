export interface Stat {
  id: string;
  /** The value exactly as published ("1200+"); CountUp keeps the prefix/suffix. */
  valueKey: string;
  labelKey: string;
}

const stat = (id: string): Stat => ({
  id,
  valueKey: `home.stats.${id}.value`,
  labelKey: `home.stats.${id}.label`,
});

/** As on the live site (D15). */
export const stats: Stat[] = [stat('women'), stat('literacy'), stat('trust')];
