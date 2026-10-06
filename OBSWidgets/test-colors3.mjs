import { ratio } from './tests/support/contrast.mjs';
function check(name, fg, bg) {
  const r = ratio(fg, bg);
  console.log(`${name}: ${fg} on ${bg} = ${r.toFixed(2)}`);
}
check("indigo-600 bg on page", "#4f46e5", "#0f172a");
check("indigo-500 bg on page", "#6366f1", "#0f172a");
check("indigo-500 text on bg", "#ffffff", "#6366f1");

check("test color", "#5452e6", "#0f172a");
check("test color text", "#ffffff", "#5452e6");

check("test color 2", "#5a5ce8", "#0f172a");
check("test color 2 text", "#ffffff", "#5a5ce8");
check("test color 2 on card", "#5a5ce8", "#1e293b");

