/**
 * `lang="en"` for a string with no Devanagari (names, the organisation's name, figures),
 * so on Hindi pages it keeps the English display face (the `:lang(hi)` rules switch display
 * text to Tiro Devanagari Hindi) and screen readers pronounce it as English.
 */
export const latinLang = (text: string): 'en' | undefined => (/[ऀ-ॿ]/.test(text) ? undefined : 'en');
