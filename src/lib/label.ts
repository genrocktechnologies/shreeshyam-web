/**
 * Whitespace-only tidy for crawled labels (content rule 1 allows whitespace changes):
 * "Common Features :" → "Common Features:". The colon itself is crawled text and stays
 * until the client approves removing it (docs/client-requests.md).
 */
export const tidyLabel = (label: string) => label.replace(/\s+:\s*$/, ':').trim();
