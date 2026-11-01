// Minimal static server for the Next export in ./out (trailing-slash index.html routing, 404.html fallback).
//   node scripts/serve-static.mjs [dir=out] [port=4321]   (used by playwright.config.ts)
// It also applies the `redirects` from vercel.json (the subset of Vercel's syntax we use:
// literal paths, `:name`, `:name(a|b)`, the optional `{/}?` and `has` header conditions),
// so tests/redirects.spec.ts checks the real rules before a Vercel preview exists.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'out');
const port = Number(process.argv[3] ?? 4321);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain', '.json': 'application/json', '.svg': 'image/svg+xml' };

/** vercel.json source pattern → RegExp with named groups. */
function toRegExp(source) {
  let re = '';
  for (let i = 0; i < source.length; ) {
    const rest = source.slice(i);
    let m;
    if (rest.startsWith('{/}?')) {
      re += '(?:/)?';
      i += 4;
    } else if ((m = rest.match(/^:([A-Za-z_]\w*)(\(([^)]*)\))?/))) {
      re += `(?<${m[1]}>${m[3] ?? '[^/]+'})`;
      i += m[0].length;
    } else {
      re += source[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      i += 1;
    }
  }
  return new RegExp(`^${re}$`);
}

const vercel = JSON.parse(fs.readFileSync(path.resolve('vercel.json'), 'utf8'));
const redirects = (vercel.redirects ?? []).map((r) => ({ ...r, re: toRegExp(r.source) }));

function redirectFor(req, pathname) {
  for (const r of redirects) {
    const m = pathname.match(r.re);
    if (!m) continue;
    const headersOk = (r.has ?? []).every((h) => h.type !== 'header' || new RegExp(h.value).test(String(req.headers[h.key] ?? '')));
    if (!headersOk) continue;
    const location = r.destination.replace(/:([A-Za-z_]\w*)/g, (_, k) => m.groups?.[k] ?? '');
    return { status: r.statusCode ?? (r.permanent ? 308 : 307), location };
  }
  return null;
}

http
  .createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const redirect = redirectFor(req, p);
    if (redirect) return res.writeHead(redirect.status, { location: redirect.location }).end();
    let file = path.join(root, p);
    if (!file.startsWith(root)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) {
      res.writeHead(404, { 'content-type': types['.html'] });
      return fs.createReadStream(path.join(root, '404.html')).pipe(res);
    }
    res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
