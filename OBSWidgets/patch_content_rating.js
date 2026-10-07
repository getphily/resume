const fs = require('fs');
let content = fs.readFileSync('src/app/(app)/podcast-tools/page.tsx', 'utf8');

const oldRating = `<div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pt-0.5">Content Rating</span>
                  <div className="flex gap-2">`;

const newRating = `<div className="flex flex-col gap-1">
                  <FieldLabel text="Content Rating" />
                  <div className="flex gap-2">`;

content = content.replace(oldRating, newRating);
fs.writeFileSync('src/app/(app)/podcast-tools/page.tsx', content);
