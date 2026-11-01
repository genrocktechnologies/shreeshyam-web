/**
 * Phase 7: the Hindi review sheet for the client's reviewer.
 *
 *   pnpm exec tsx scripts/hindi-review.ts
 *
 * Writes docs/hindi-review.csv (UTF-8 with BOM, so Excel shows Devanagari) and
 * docs/hindi-review.xlsx with the same rows: key, page, English, Hindi draft, reviewer
 * comment (empty), sorted by page in site order, then key. The XLSX has a frozen,
 * filterable header, wrapped text, and a second sheet with the reviewer's instructions.
 * The motion playground (`dev`) is left out: it is deleted before launch.
 *
 * No spreadsheet dependency: the XLSX is a small zip written with Node's zlib CRC-free
 * "stored" entries (CRC32 computed here).
 */
import fs from 'node:fs';
import path from 'node:path';
import { namespaces } from '../src/i18n/routing';

const ROOT = path.resolve(__dirname, '..');
type Tree = { [k: string]: string | Tree };

/** Page for a key: the most specific prefix wins. Order = site order (and sort order). */
const PAGES: [string, RegExp][] = [
  ['Every page: header, footer and menus', /^common\.(siteName|brand|continueToSite|nav|buttons|footer|languages|social|contact)\b/],
  ['Home', /^home\.(meta|compact|hero|aboutIntro|stats)\b/],
  ['About', /^(about\.|home\.(services|testimonials)\b)/],
  ['Vision & Mission', /^(vision|mission)\./],
  ['Team', /^team\./],
  ['Milestones', /^milestones\./],
  ['Loans', /^loans\./],
  ['Membership (how to join, registration form, questions)', /^(howToJoin|register)\.|^home\.(process|faq)\b/],
  ['Contact', /^contact\./],
  ['Careers', /^careers\./],
  ['HR Policy', /^hrPolicy\./],
  ['Privacy Policy', /^privacy\./],
  ['Forms (labels, errors, messages)', /^common\.form\./],
  ['Page not found', /^common\.notFound\./],
  ['Picture descriptions (read aloud, not shown)', /^common\.alt\./],
  ['Screen-reader labels (read aloud, not shown)', /^common\.a11y\./],
];

const flatten = (t: Tree, prefix: string, out: [string, string][] = []) => {
  for (const [k, v] of Object.entries(t)) {
    if (k.startsWith('_')) continue;
    const key = `${prefix}.${k}`;
    if (typeof v === 'string') out.push([key, v]);
    else flatten(v, key, out);
  }
  return out;
};

const rows: { key: string; page: string; order: number; en: string; hi: string }[] = [];
for (const ns of namespaces.filter((n) => n !== 'dev')) {
  const read = (l: string) => JSON.parse(fs.readFileSync(path.join(ROOT, 'messages', l, `${ns}.json`), 'utf8')) as Tree;
  const hi = new Map(flatten(read('hi'), ns));
  for (const [key, en] of flatten(read('en'), ns)) {
    const order = PAGES.findIndex(([, r]) => r.test(key));
    if (order < 0) throw new Error(`No page for ${key}: add it to PAGES`);
    rows.push({ key, page: PAGES[order][0], order, en, hi: hi.get(key) ?? '' });
  }
}
rows.sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));

const HEADER = ['Key', 'Page', 'English', 'Hindi draft', 'Reviewer comment'];
const table = [HEADER, ...rows.map((r) => [r.key, r.page, r.en, r.hi, ''])];

// ---- CSV
const csvCell = (s: string) => `"${s.replace(/"/g, '""')}"`;
fs.writeFileSync(path.join(ROOT, 'docs', 'hindi-review.csv'), '﻿' + table.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n');

// ---- XLSX
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const col = (i: number) => String.fromCharCode(65 + i);
const sheetXml = (data: string[][], widths: number[], filter: boolean) => {
  const last = `${col(data[0].length - 1)}${data.length}`;
  const body = data
    .map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => `<c r="${col(ci)}${ri + 1}" t="inlineStr" s="${ri === 0 && filter ? 1 : 2}"><is><t xml:space="preserve">${esc(v)}</t></is></c>`).join('')}</row>`)
    .join('');
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    (filter ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` : '') +
    `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` +
    `<sheetData>${body}</sheetData>` +
    (filter ? `<autoFilter ref="A1:${last}"/>` : '') +
    `</worksheet>`
  );
};

const GUIDE = [
  ['How to review the Hindi'],
  ['Thank you for checking the Hindi text of the new website. Every Hindi text is a draft written for you to check.'],
  ['1. Read the "Hindi draft" column. The English it translates is beside it.'],
  ['2. If a Hindi text is right, leave "Reviewer comment" empty.'],
  ['3. If it needs a change, write the correct Hindi (or your note) in "Reviewer comment". Please don\'t change the other columns.'],
  ['4. Keep anything in curly brackets exactly as it is, e.g. {name}, {email}, {year}. The website fills these in. Keep <b>…</b> around the same words (they are shown in bold).'],
  ['Choices made in the draft (please tell us if you want them different):'],
  ['• Simple, respectful Hindi, at about a Class 8 reading level. We use "आप" throughout.'],
  ['• Common words people in Bihar already use stay as they are, in Devanagari: लोन, आधार कार्ड, पैन कार्ड, बैंक, ईमेल, मोबाइल, फ़ॉर्म, CV.'],
  ['• The name "Shree Shyam Small Growth Foundation" and people\'s names (Saurav Prakash, Vikram Kumar Sinha…) are kept exactly as in English. If you prefer them in Devanagari (e.g. श्री श्याम स्मॉल ग्रोथ फ़ाउंडेशन), tell us once and we will change all of them.'],
  ['• Numbers and amounts stay in English digits (1200+, ₹10,000 – ₹30,000, 18 साल).'],
  ['• The policy pages (HR Policy, Privacy Policy) are legal texts. Please have them checked carefully: in case of doubt, the English version applies until you approve the Hindi.'],
  ['• Rows marked "read aloud, not shown" are for blind users\' screen readers. They are never shown on the page.'],
];

const parts: Record<string, string> = {
  '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
  '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
  'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Hindi review" sheetId="1" r:id="rId1"/><sheet name="How to review" sheetId="2" r:id="rId2"/></sheets><definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">'Hindi review'!$A$1:$E$${table.length}</definedName></definedNames></workbook>`,
  'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
  'xl/styles.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFCEAF2"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="3"><xf/><xf fontId="1" fillId="2" applyFont="1" applyFill="1"><alignment vertical="top" wrapText="1"/></xf><xf applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs></styleSheet>`,
  'xl/worksheets/sheet1.xml': sheetXml(table, [34, 26, 55, 55, 40], true),
  'xl/worksheets/sheet2.xml': sheetXml(GUIDE, [140], false),
};

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf: Buffer) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

/** Minimal zip writer: "stored" (uncompressed) entries, which every spreadsheet app reads. */
function zip(files: Record<string, string>): Buffer {
  const chunks: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const [name, text] of Object.entries(files)) {
    const data = Buffer.from(text, 'utf8');
    const fname = Buffer.from(name, 'utf8');
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(0, 8); // stored
    local.writeUInt32LE(0, 10); // time/date
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(fname.length, 26);
    local.writeUInt16LE(0, 28);
    chunks.push(local, fname, data);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4);
    cen.writeUInt16LE(20, 6);
    cen.writeUInt16LE(0x0800, 8);
    cen.writeUInt16LE(0, 10);
    cen.writeUInt32LE(0, 12);
    cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(data.length, 20);
    cen.writeUInt32LE(data.length, 24);
    cen.writeUInt16LE(fname.length, 28);
    cen.writeUInt32LE(offset, 42);
    central.push(cen, fname);
    offset += local.length + fname.length + data.length;
  }
  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(Object.keys(files).length, 8);
  end.writeUInt16LE(Object.keys(files).length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, cd, end]);
}

fs.writeFileSync(path.join(ROOT, 'docs', 'hindi-review.xlsx'), zip(parts));
const empty = rows.filter((r) => !r.hi).length;
console.log(`Wrote docs/hindi-review.csv and docs/hindi-review.xlsx: ${rows.length} rows, ${new Set(rows.map((r) => r.page)).size} pages, ${empty} without a Hindi draft.`);
if (empty) process.exit(1);
