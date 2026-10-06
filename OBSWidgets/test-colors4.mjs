import { ratio } from './tests/support/contrast.mjs';
function check(name, fg, bg) {
  const r = ratio(fg, bg);
  console.log(`${name}: ${fg} on ${bg} = ${r.toFixed(2)}`);
}

const cand = "#6062e0";
check("cand on page", cand, "#0f172a");
check("cand on card", cand, "#1e293b");
check("white on cand", "#ffffff", cand);

const cand2 = "#6163e8";
check("cand2 on card", cand2, "#1e293b");
check("white on cand2", "#ffffff", cand2);

