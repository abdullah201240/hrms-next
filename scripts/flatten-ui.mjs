// One-off: strip shadow / rounded / drop-shadow utility tokens from all
// src/components/ui/*.tsx so the source truly matches the flat-UI policy
// (previously only neutralized globally in globals.css). Run: node scripts/flatten-ui.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'src/components/ui';

// Is this class token a flat-UI token to drop? (checks the LAST colon segment,
// so variant prefixes like hover:/data-[state=open]: are handled correctly.)
const isFlatToken = (tok) => {
  const seg = tok.split(':').pop();
  return /^(rounded|shadow|drop-shadow)(-.*)?$/.test(seg);
};
// A class token = run of non-whitespace, non-quote, non-JSX-delimiter chars.
const TOKEN_RE = /[^ \t\r\n"'`<>{}=,;()]+/g;

// Collapse extra whitespace ONLY inside double-quoted string literals so we
// never touch JSX attribute spacing or source-code indentation.
function normalizeStrings(text) {
  return text.replace(/"[^"\n]*"/g, (s) => {
    const inner = s.slice(1, -1).replace(/[ \t]{2,}/g, ' ').replace(/^ +| +$/g, '');
    return `"${inner}"`;
  });
}

let filesTouched = 0;
let totalRemoved = 0;

for (const name of readdirSync(dir)) {
  if (!name.endsWith('.tsx')) continue;
  const path = join(dir, name);
  const before = readFileSync(path, 'utf8');

  let removed = 0;
  let out = before.replace(TOKEN_RE, (tok) => {
    if (isFlatToken(tok)) {
      removed++;
      return ' '; // leave a space; collapse happens in normalizeStrings
    }
    return tok;
  });
  if (removed === 0) continue;

  out = normalizeStrings(out);

  writeFileSync(path, out);
  filesTouched++;
  totalRemoved += removed;
  console.log(`  ${name}: removed ${removed}`);
}

console.log(`\nDone. ${totalRemoved} tokens removed across ${filesTouched} files.`);
