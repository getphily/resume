const fs = require('fs');
let content = fs.readFileSync('src/app/(app)/podcast-tools/page.tsx', 'utf8');

const oldLang = `                  <EditableField 
                    value={data.language}
                    onSave={(v) => updateData({ language: v })}
                    className="font-semibold text-xs text-foreground px-2 py-1 rounded-md"
                    placeholder="e.g. English"
                    status={!!data.language ? 'complete' : 'incomplete'}
                  />`;

const newLang = `                  <EditableField 
                    value={data.language}
                    onSave={(v) => updateData({ language: v })}
                    className="font-semibold text-xs text-foreground px-2 py-1 !mx-0 rounded-md"
                    placeholder="e.g. English"
                    status={!!data.language ? 'complete' : 'incomplete'}
                  />`;

content = content.replace(oldLang, newLang);
fs.writeFileSync('src/app/(app)/podcast-tools/page.tsx', content);
