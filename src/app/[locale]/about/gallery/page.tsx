import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { GoldenThread } from '@/components/motion';
import { CtaBand } from '@/components/sections/CtaBand';
import { GalleryLightbox } from '@/components/sections/gallery/GalleryLightbox';
import { PageHero } from '@/components/sections/PageHero';
import { PhotoFrame } from '@/components/ui/PhotoFrame';
import { aboutRoutes } from '@/data/about';
import { gallery } from '@/data/gallery';
import { altKeyFor, fullSizeUrl, isTeamPortrait, pictureSources } from '@/data/images';
import { team } from '@/data/team';

export { generateStaticParams } from '@/i18n/static-params';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  // Hidden until the client's photos arrive: not linked, not indexed, not in the sitemap.
  return { title: t('common.nav.gallery'), ...(gallery.enabled ? {} : { robots: { index: false, follow: true } }) };
}

/**
 * Our Gallery (site-plan): masonry + lightbox. Built and tested with the real photos we
 * have; kept out of navigation and the sitemap until the client sends gallery photos.
 * Tiles keep each photo's frame and focal point (wide 4:3, arch portraits), which gives the
 * masonry its rhythm; the lightbox shows the whole, uncropped photo.
 */
export default async function GalleryPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const total = gallery.photos.length;
  const items = gallery.photos.map((image) => {
    const member = isTeamPortrait(image) ? team.find((m) => m.photo === image) : undefined;
    return { id: image, image, alt: t(altKeyFor(image), member ? { name: t(member.nameKey) } : undefined), sources: pictureSources(image) };
  });
  const labels = {
    close: t('common.a11y.closeDialog'),
    previous: t('common.a11y.previous'),
    next: t('common.a11y.next'),
    slideOf: items.map((_, i) => t('common.a11y.slideOf', { current: i + 1, total })),
  };

  return (
    <>
      <PageHero title={t('common.nav.gallery')} breadcrumbs={[{ label: t('about.title'), href: aboutRoutes.about }, { label: t('common.nav.gallery') }]} />

      <section className="relative bg-ivory">
        <div className="container-site thread-gutter section-pad relative">
          <GoldenThread className="thread-col inset-y-0 h-full" />
          <GalleryLightbox items={items.map(({ id, alt, sources }) => ({ id, alt, sources }))} labels={labels}>
            {/* No Reveal: the first tiles are in the first screen (the LCP element). */}
            <ul className="columns-1 gap-5 sm:columns-2 md:gap-6 lg:columns-3 [&>li]:mb-5 [&>li]:break-inside-avoid md:[&>li]:mb-6">
              {items.map((item, i) => (
                <li key={item.image}>
                  <a href={fullSizeUrl(item.image)} data-gallery-index={i} className="group block rounded-2xl">
                    <PhotoFrame
                      image={item.image}
                      alt={item.alt}
                      motion="none"
                      sizes="(min-width: 1024px) 24rem, (min-width: 640px) 45vw, 90vw"
                      className="w-full shadow-soft transition-transform duration-card ease-growth group-hover:-translate-y-1"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </GalleryLightbox>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
