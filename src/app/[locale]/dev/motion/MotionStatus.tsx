'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useLenis } from '@/components/motion';
import { isLowEnd, media } from '@/lib/motion';

/** Dev-only readout of the motion environment, used to verify each fallback path. */
export function MotionStatus() {
  const t = useTranslations('dev.ui');
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

  const flag = (on: boolean | undefined) => (on ? t('on') : t('off'));

  return (
    <dl
      data-testid="motion-status"
      data-reduce={env?.reduce ? 'true' : 'false'}
      data-lenis={lenis ? 'true' : 'false'}
      className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-small"
    >
      <dt className="text-ink-muted">{t('reducedMotion')}</dt>
      <dd className="font-bold">{flag(env?.reduce)}</dd>
      <dt className="text-ink-muted">{t('smoothScroll')}</dt>
      <dd className="font-bold">{flag(!!lenis)}</dd>
      <dt className="text-ink-muted">{t('lowEnd')}</dt>
      <dd className="font-bold">{flag(env?.lowEnd)}</dd>
      <dt className="text-ink-muted">{t('viewport')}</dt>
      <dd className="font-bold tabular-nums">{env ? `${env.width}px` : '—'}</dd>
    </dl>
  );
}
