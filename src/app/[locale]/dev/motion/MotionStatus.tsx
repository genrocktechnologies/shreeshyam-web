'use client';

import { useEffect, useState } from 'react';
import { useLenis } from '@/components/motion';
import { isLowEnd, media } from '@/lib/motion';

export interface MotionStatusLabels {
  reducedMotion: string;
  smoothScroll: string;
  lowEnd: string;
  viewport: string;
  on: string;
  off: string;
}

/** Dev-only readout of the motion environment, used to verify each fallback path. */
export function MotionStatus({ labels }: { labels: MotionStatusLabels }) {
  const lenis = useLenis();
  const [env, setEnv] = useState<{ reduce: boolean; lowEnd: boolean; width: number } | null>(null);

  useEffect(() => {
    const mql = window.matchMedia(media.reduce);
    const read = () => setEnv({ reduce: mql.matches, lowEnd: isLowEnd(), width: window.innerWidth });
    read();
    mql.addEventListener('change', read);
    window.addEventListener('resize', read);
    return () => {
      mql.removeEventListener('change', read);
      window.removeEventListener('resize', read);
    };
  }, []);

  const flag = (on: boolean | undefined) => (on ? labels.on : labels.off);

  return (
    <dl
      data-testid="motion-status"
      data-reduce={env?.reduce ? 'true' : 'false'}
      data-lenis={lenis ? 'true' : 'false'}
      className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-small"
    >
      <dt className="text-ink-muted">{labels.reducedMotion}</dt>
      <dd className="font-bold">{flag(env?.reduce)}</dd>
      <dt className="text-ink-muted">{labels.smoothScroll}</dt>
      <dd className="font-bold">{flag(!!lenis)}</dd>
      <dt className="text-ink-muted">{labels.lowEnd}</dt>
      <dd className="font-bold">{flag(env?.lowEnd)}</dd>
      <dt className="text-ink-muted">{labels.viewport}</dt>
      <dd className="font-bold tabular-nums">{env ? `${env.width}px` : '—'}</dd>
    </dl>
  );
}
