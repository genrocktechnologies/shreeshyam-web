'use client';

import dynamic from 'next/dynamic';

/**
 * The registration form, hydrated from its own chunk (react-hook-form, ~12 KB gzip) so it
 * stays out of the page's first-load JS (CLAUDE.md budget). The server HTML is the full
 * form, so it is visible at once and, until the chunk arrives, posts natively.
 */
export const LazyRegisterForm = dynamic(() => import('./RegisterForm').then((m) => m.RegisterForm));
