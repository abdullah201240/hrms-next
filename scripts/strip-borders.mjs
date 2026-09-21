// One-off: strip border / divide utility tokens from the app pages and shared
// components so the source matches the borderless policy (also enforced
// globally in globals.css). Run: node scripts/strip-borders.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIRS = ['src/app', 'src/components/shared'];

// Is this class token a border/divide token to drop? Checks the LAST colon
// segment so variant prefixes (hover:, sm:, dark:, data-[...]:) are handled.
const isBorderToken = (tok) => {
  const seg = tok.split(':').pop();
  return /^(border|divide)(-.*)?$/.test(seg);
};
const TOKEN_RE = /[^ \t\r\n"'`<>{}=,;()]+/g;

// Collapse extra whitespace ONLY inside double-quoted string literals.
function normalizeStrings(text) {
  return text.replace(/"[^"\n]*"/g, (s) => {
    const inner = s.slice(1, -1).replace(/[ \t]{2,}/g, ' ').replace(/^ +| +$/g, '');
    return `"${inner}"`;
  });
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (name.endsWith('.tsx')) yield path;
  }
}

let filesTouched = 0;
let totalRemoved = 0;

for (const base of DIRS) {
  for (const path of walk(base)) {
    const before = readFileSync(path, 'utf8');
    let removed = 0;
    let out = before.replace(TOKEN_RE, (tok) => {
      if (isBorderToken(tok)) {
        removed++;
        return ' ';
      }
      return tok;
    });
    if (removed === 0) continue;
    out = normalizeStrings(out);
    writeFileSync(path, out);
    filesTouched++;
    totalRemoved += removed;
    console.log(`  ${path}: removed ${removed}`);
  }
}

console.log(`\nDone. ${totalRemoved} border tokens removed across ${filesTouched} files.`);
