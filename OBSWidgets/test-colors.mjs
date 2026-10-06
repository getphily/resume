import { ratio } from './tests/support/contrast.mjs';

function check(name, fg, bg, target) {
  const r = ratio(fg, bg);
  console.log(`${name}: ${fg} on ${bg} = ${r.toFixed(2)} (${r >= target ? 'PASS' : 'FAIL'})`);
}

console.log("--- DARK THEME (bg: #0f172a, card: #1e293b) ---");
check("Input border on card", "#7b8ba3", "#1e293b", 3.0);
check("Input border on page", "#7b8ba3", "#0f172a", 3.0);
check("Accent text on card", "#a5b4fc", "#1e293b", 4.5);
check("Button bg on page", "#4f46e5", "#0f172a", 3.0);
check("Button text on bg", "#ffffff", "#4f46e5", 4.5);
check("Success on card", "#22c55e", "#1e293b", 4.5); // let's check
check("Warning on card", "#f59e0b", "#1e293b", 4.5);
check("Danger on card", "#ef4444", "#1e293b", 4.5);
check("Muted text on card", "#94a3b8", "#1e293b", 4.5);

console.log("\n--- ANTD LIGHT (bg: #f0f2f5, card: #ffffff) ---");
check("Muted on card", "#595959", "#ffffff", 4.5);
check("Input border", "#8c8c8c", "#ffffff", 3.0);
check("Primary button", "#0958d9", "#ffffff", 3.0);
check("Primary button text", "#ffffff", "#0958d9", 4.5);

console.log("\n--- ANTD DARK (bg: #000000, card: #141414) ---");
check("Muted on card", "#a6a6a6", "#141414", 4.5);
check("Input border", "#8c8c8c", "#141414", 3.0);
check("Primary bg", "#1668dc", "#141414", 3.0);
check("Primary button text", "#ffffff", "#1668dc", 4.5);
check("Accent text", "#69b1ff", "#141414", 4.5);

