/** Reserves the fixed header's height for pages that don't start with a PageHero/Hero. */
export function HeaderSpacer() {
  return <div aria-hidden="true" className="h-[var(--header-total)]" />;
}
