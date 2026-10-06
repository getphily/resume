import { ratio } from './tests/support/contrast.mjs';
const r = ratio("#64748b", "#1e293b");
console.log(`border #64748b on #1e293b = ${r.toFixed(2)}`);
