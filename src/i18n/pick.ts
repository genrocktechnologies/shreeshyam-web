import type { AbstractIntlMessages } from 'next-intl';

/**
 * Picks top-level namespaces or dotted sub-paths (e.g. 'dev.ui') from the full message
 * tree, keeping their nesting, so a NextIntlClientProvider ships only what its client
 * components use.
 */
export function pickMessages(messages: AbstractIntlMessages, paths: readonly string[]): AbstractIntlMessages {
  const out: Record<string, unknown> = {};
  for (const p of paths) {
    const parts = p.split('.');
    let src: unknown = messages;
    for (const part of parts) src = (src as Record<string, unknown> | undefined)?.[part];
    if (src === undefined) throw new Error(`pickMessages: no messages at "${p}"`);
    let dst = out;
    parts.slice(0, -1).forEach((part) => {
      dst = (dst[part] ??= {}) as Record<string, unknown>;
    });
    dst[parts[parts.length - 1]] = src;
  }
  return out as AbstractIntlMessages;
}
