/**
 * Web3Forms (site-plan, Forms): submissions go to the foundation's inbox. The public
 * access key comes from NEXT_PUBLIC_WEB3FORMS_KEY at build time (docs/deploy.md). Without
 * it the forms still render and validate, but sending reports the "could not be sent,
 * please call us" error.
 */
export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
export const WEB3FORMS_KEY: string | null = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || null;

/** POSTs a submission as JSON; resolves true only when Web3Forms reports success. */
export async function sendToWeb3Forms(fields: Record<string, string | boolean>): Promise<boolean> {
  if (!WEB3FORMS_KEY) return false;
  try {
    const res = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...fields }),
    });
    const json = (await res.json().catch(() => null)) as { success?: boolean } | null;
    return res.ok && json?.success === true;
  } catch {
    return false;
  }
}
