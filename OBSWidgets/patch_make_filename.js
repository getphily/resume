const fs = require('fs');

let audioEditor = fs.readFileSync('src/components/podcast-tools/AudioEditor.tsx', 'utf8');
audioEditor = audioEditor.replace(\`a.download = makeFileName(fileBase);\`, \`a.download = \\\`\\\${makeFileName(fileBase)}.wav\\\`;\`);
audioEditor = audioEditor.replace(\`const name = makeFileName(fileBase);\`, \`const name = \\\`\\\${makeFileName(fileBase)}.wav\\\`;\`);
fs.writeFileSync('src/components/podcast-tools/AudioEditor.tsx', audioEditor);

let magicPolish = fs.readFileSync('src/components/podcast-tools/MagicPolishPanel.tsx', 'utf8');
magicPolish = magicPolish.replace(\`const name = makeFileName(fileBase, 'polished');\`, \`const name = \\\`\\\${makeFileName(fileBase, 'polished')}.wav\\\`;\`);
fs.writeFileSync('src/components/podcast-tools/MagicPolishPanel.tsx', magicPolish);

console.log('Fixed file names');
