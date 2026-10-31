import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { CountUp, GoldenThread, ImageReveal, MagneticButton, Parallax, Reveal, SplitHeading } from '@/components/motion';
import { Picture } from '@/components/ui/Picture';
import { altKeyFor } from '@/data/images';
import { pickMessages } from '@/i18n/pick';
import { MotionStatus } from './MotionStatus';

/**
 * Hidden motion playground: one demo per primitive from docs/motion-spec.md.
 * Not linked, noindex, excluded from the sitemap. DELETE BEFORE LAUNCH (Phase 8),
 * together with messages/<locale>/dev.json.
 */
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'dev.meta' });
  return { title: t('title'), robots: { index: false, follow: false } };
}

const SERVICES = ['financialInclusion', 'womenEmpowerment', 'financialLiteracy', 'entrepreneurship', 'livelihood', 'communityWelfare'] as const;
const STATS = ['women', 'literacy', 'trust'] as const;

// A gentle S-curve down the section; the thread sits on a fixed column so
// segments line up from section to section.
const THREAD = 'M50 0 C 50 20, 80 30, 50 50 S 20 80, 50 100';

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 font-body text-small font-bold text-rani-700">{children}</p>;
}

function ThreadColumn() {
  return (
    <GoldenThread
      d={THREAD}
      className="absolute inset-y-0 left-[20px] w-6 md:left-[8%] md:w-10"
    />
  );
}

export default async function MotionPlayground({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('dev');
  const tAll = await getTranslations();

  return (
    <main id="main">
      <div className="border-b border-rani-100 bg-ivory-100">
        <div className="container-site flex flex-wrap items-start justify-between gap-4 py-4">
          <div>
            <p className="eyebrow">{t('ui.label')}</p>
            <p className="text-small text-ink-muted">
              {t('ui.scrollHint')} {t('ui.replay')}
            </p>
          </div>
          <NextIntlClientProvider messages={pickMessages(await getMessages(), ['dev.ui'])}>
            <MotionStatus />
          </NextIntlClientProvider>
        </div>
      </div>

      {/* Hero: SplitHeading (load) + ImageReveal (load) + MagneticButton */}
      <section className="relative overflow-hidden">
        <ThreadColumn />
        <div className="container-site grid items-center gap-10 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div className="pl-8 md:pl-0">
            <Label>{t('primitives.splitHeading')}</Label>
            <Reveal>
              <p className="eyebrow mb-4">{t('demo.eyebrow')}</p>
            </Reveal>
            <SplitHeading as="h1" trigger="load" delay={0.1} className="text-balance">
              {t('demo.heading')}
            </SplitHeading>
            <div className="mt-8">
              <Label>{t('primitives.magnetic')}</Label>
              <MagneticButton>
                <a
                  href="#reveal"
                  className="inline-flex min-h-tap items-center rounded-full bg-marigold-400 px-7 font-bold text-plum-900 shadow-soft transition-shadow duration-300 hover:shadow-lift"
                >
                  {t('demo.cta')}
                </a>
              </MagneticButton>
            </div>
          </div>
          <div className="pl-8 md:pl-0">
            <Label>{t('primitives.imageReveal')}</Label>
            <ImageReveal trigger="load" delay={0.2} className="mx-auto aspect-[400/424] w-full max-w-[400px]">
              <Picture
                image="membersLedger"
                alt={tAll(altKeyFor('membersLedger'))}
                sizes="(min-width: 768px) 400px, 100vw"
                priority
                className="block h-full w-full"
                imgClassName="h-full w-full object-cover"
              />
            </ImageReveal>
          </div>
        </div>
      </section>

      {/* Reveal with stagger */}
      <section id="reveal" className="relative bg-rani-50">
        <ThreadColumn />
        <div className="container-site section-pad pl-12 md:pl-8">
          <Label>{t('primitives.splitScroll')}</Label>
          <SplitHeading className="mb-10 max-w-3xl text-balance">{t('demo.servicesHeading')}</SplitHeading>
          <Label>{t('primitives.reveal')}</Label>
          <Reveal stagger fromScale={0.98} as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((key) => (
              <li key={key} className="rounded-2xl border border-rani-100 bg-white p-6 shadow-soft">
                <h3>{t(`demo.services.${key}`)}</h3>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* CountUp on the plum trust band */}
      <section className="grain relative bg-plum-900 text-ivory">
        <div className="container-site section-pad">
          <p className="mb-8 font-body text-small font-bold text-marigold-300">{t('primitives.countUp')}</p>
          <Reveal stagger as="dl" className="grid gap-10 md:grid-cols-3">
            {STATS.map((key) => (
              <div key={key} className="flex flex-col-reverse gap-2 md:border-l md:border-marigold-400/40 md:pl-8">
                <dt className="text-body text-ivory-100">{t(`demo.stats.${key}.label`)}</dt>
                <dd className="stat-number text-marigold-400">
                  <CountUp value={t(`demo.stats.${key}.value`)} />
                </dd>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Parallax inside the arch + scroll SplitHeading */}
      <section className="relative overflow-hidden">
        <ThreadColumn />
        <div className="container-site section-pad grid items-center gap-10 pl-12 md:grid-cols-2 md:pl-8">
          <div>
            <Label>{t('primitives.parallax')}</Label>
            <Parallax className="mask-arch aspect-[4/5] w-full max-w-[460px]">
              <Picture
                image="award"
                alt={tAll(altKeyFor('award'))}
                sizes="(min-width: 768px) 460px, 100vw"
                className="block h-full w-full"
                imgClassName="h-full w-full object-cover object-[60%_center]"
              />
            </Parallax>
          </div>
          <div>
            <SplitHeading className="text-balance">{t('demo.milestoneHeading')}</SplitHeading>
          </div>
        </div>
      </section>

      {/* GoldenThread over a tall section so the scrub is easy to see */}
      <section className="relative bg-marigold-50">
        <GoldenThread
          d="M10 0 C 10 25, 90 25, 90 50 S 10 75, 10 100"
          className="absolute inset-y-0 left-[20px] right-[20px] md:left-[8%] md:right-[8%]"
        />
        <div className="container-site section-pad relative min-h-[120vh] pl-12 md:pl-8">
          <Label>{t('primitives.thread')}</Label>
          <Reveal className="max-w-prose rounded-2xl bg-ivory/90 p-6 shadow-soft">
            <h2 className="mb-4">{t('demo.aboutHeading')}</h2>
            <p>{t('demo.aboutBody')}</p>
          </Reveal>
        </div>
      </section>

      <section className="relative">
        <div className="container-site section-pad pl-12 md:pl-8">
          <SplitHeading className="max-w-3xl text-balance">{t('demo.processHeading')}</SplitHeading>
        </div>
      </section>
    </main>
  );
}
