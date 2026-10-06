import { ratio } from './tests/support/contrast.mjs';
function check(name, fg, bg, target) {
  const r = ratio(fg, bg);
  console.log(`${name}: ${fg} on ${bg} = ${r.toFixed(2)} (${r >= target ? 'PASS' : 'FAIL'})`);
}
console.log("--- DARK THEME FIXES ---");
check("Button bg on page", "#6366f1", "#0f172a", 3.0);
check("Button text on bg", "#ffffff", "#6366f1", 4.5);
check("Danger text on card", "#f87171", "#1e293b", 4.5);
check("Danger text on page", "#f87171", "#0f172a", 4.5);
check("Success text on card", "#4ade80", "#1e293b", 4.5);
check("Warning text on card", "#fbbf24", "#1e293b", 4.5);

console.log("\n--- LIGHT THEME FIXES ---");
check("Success text on card", "#166534", "#ffffff", 4.5);
check("Warning text on card", "#92400e", "#ffffff", 4.5);
check("Danger text on card", "#b91c1c", "#ffffff", 4.5);

