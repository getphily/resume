// WCAG 2.x contrast calculator for design-token pairs.
// usage: node tests/support/contrast.mjs
const hex = (h) => {
  h = h.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const lum = ([r, g, b]) => {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
// blend rgba over a solid background
const over = (fg, a, bg) => hex(fg).map((c, i) => Math.round(c * a + hex(bg)[i] * (1 - a)));
export const ratio = (a, b) => {
  const [l1, l2] = [lum(typeof a === 'string' ? hex(a) : a), lum(typeof b === 'string' ? hex(b) : b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

export const pairs = (name, list) => {
  console.log(`\n${name}`);
  for (const [label, fg, bg, min] of list) {
    const r = ratio(fg, bg);
    console.log(`${r >= min ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (need ${min})  ${label}  ${typeof fg === 'string' ? fg : ''} on ${typeof bg === 'string' ? bg : ''}`);
  }
};

if (process.argv[1]?.endsWith('contrast.mjs')) {
  pairs('CURRENT light theme (baseline)', [
    ['muted text on page', '#64748b', '#f4f5f7', 4.5],
    ['muted text on card', '#64748b', '#ffffff', 4.5],
    ['input border on white', '#e2e8f0', '#ffffff', 3],
    ['card border on page', '#e2e8f0', '#f4f5f7', 3],
    ['destructive text on white', '#ef4444', '#ffffff', 4.5],
    ['emerald-500 status text', '#10b981', '#ffffff', 4.5],
    ['amber-500 status text', '#f59e0b', '#ffffff', 4.5],
    ['amber-600 badge text', '#d97706', '#ffffff', 4.5],
    ['primary text on white', '#4f46e5', '#ffffff', 4.5],
    ['white on primary', '#ffffff', '#4f46e5', 4.5],
    ['slate-400 on navbar', '#94a3b8', '#0f172a', 4.5],
    ['placeholder muted on white', '#64748b', '#ffffff', 4.5],
  ]);

  pairs('PROPOSED light theme', [
    ['foreground on page', '#0f172a', '#f4f5f7', 4.5],
    ['foreground on card', '#0f172a', '#ffffff', 4.5],
    ['muted text (slate-600) on page', '#475569', '#f4f5f7', 4.5],
    ['muted text on card', '#475569', '#ffffff', 4.5],
    ['muted text on muted surface', '#475569', '#eceff3', 4.5],
    ['control border (slate-500) on white', '#64748b', '#ffffff', 3],
    ['control border on page', '#64748b', '#f4f5f7', 3],
    ['decorative card border on page (not required)', '#cbd5e1', '#f4f5f7', 1],
    ['primary (indigo-700) text on white', '#4338ca', '#ffffff', 4.5],
    ['primary (indigo-700) text on page', '#4338ca', '#f4f5f7', 4.5],
    ['white on primary button', '#ffffff', '#4338ca', 4.5],
    ['white on primary hover (indigo-800)', '#ffffff', '#3730a3', 4.5],
    ['primary on accent tint (selected row)', '#4338ca', over('#4338ca', 0.1, '#ffffff'), 4.5],
    ['focus ring (indigo-700) on white', '#4338ca', '#ffffff', 3],
    ['focus ring on page', '#4338ca', '#f4f5f7', 3],
    ['focus ring on navbar (white ring)', '#ffffff', '#0f172a', 3],
    ['danger text (red-700) on white', '#b91c1c', '#ffffff', 4.5],
    ['danger text on danger tint', '#b91c1c', over('#b91c1c', 0.1, '#ffffff'), 4.5],
    ['white on danger button', '#ffffff', '#b91c1c', 4.5],
    ['success text (green-700) on white', '#15803d', '#ffffff', 4.5],
    ['success on success tint', '#15803d', over('#15803d', 0.1, '#ffffff'), 4.5],
    ['warning text (amber-800) on white', '#92400e', '#ffffff', 4.5],
    ['warning on warning tint', '#92400e', over('#f59e0b', 0.15, '#ffffff'), 4.5],
    ['navbar text on navbar', '#ffffff', '#0f172a', 4.5],
    ['navbar secondary (slate-300) on navbar', '#cbd5e1', '#0f172a', 4.5],
    ['sidebar muted on sidebar', '#475569', '#ffffff', 4.5],
    ['disabled-state is exempt but keep legible', '#64748b', '#e2e8f0', 3],
  ]);
}
