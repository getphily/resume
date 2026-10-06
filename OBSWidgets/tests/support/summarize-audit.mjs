// Aggregates test-results/a11y-findings/*.json written by tests/a11y-audit.spec.ts
//   node tests/support/summarize-audit.mjs [--detail]
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('test-results/a11y-findings');
const all = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));

const counts = new Map();
for (const f of all) counts.set(f.check, (counts.get(f.check) || 0) + 1);

console.log(`\n=== AUDIT SUMMARY — ${all.length} findings in ${fs.readdirSync(dir).length} test runs ===`);
for (const [k, v] of [...counts.entries()].sort((a, b) => b[1] - a[1])) console.log(`${String(v).padStart(4)}  ${k}`);

if (process.argv.includes('--detail')) {
  const byCheck = new Map();
  for (const f of all) {
    if (!byCheck.has(f.check)) byCheck.set(f.check, []);
    byCheck.get(f.check).push(f);
  }
  for (const [check, list] of byCheck) {
    console.log(`\n--- ${check} (${list.length}) ---`);
    const seen = new Set();
    for (const f of list) {
      const key = JSON.stringify(f.detail);
      if (seen.has(key)) continue;
      seen.add(key);
      console.log(`[${f.page} @ ${f.viewport} / ${f.theme}]`, JSON.stringify(f.detail).slice(0, 700));
      if (seen.size >= 4) break;
    }
  }
}
