const fs = require('fs');

let code = fs.readFileSync('src/components/podcast-tools/AudioEditor.tsx', 'utf8');

const originalSaveToGoogleDrive = `  const saveToGoogleDrive = async () => {
    if (!current || driveProgress !== null) return;
    setDriveProgress(0);
    try {
      const file = await saveToDrive(encodeWav(current), makeFileName(fileBase), f => setDriveProgress(Math.round(f * 100)));
      toastDriveSaved(file);
    } catch (err) {
      toastDriveError(err);
    } finally {
      setDriveProgress(null);
    }
  };`;

const updatedSaveToGoogleDrive = `  const saveToGoogleDrive = async () => {
    if (!current || driveProgress !== null) return;
    setDriveProgress(0);
    try {
      const wavName = \`\${makeFileName(fileBase)}.wav\`;
      const file = await saveToDrive(encodeWav(current), wavName, f => setDriveProgress(Math.round(f * 90))); // 0-90% for WAV
      
      // Also upload transcript if it exists
      if (transcript && transcript.words.length > 0) {
        const txt = exportText(transcript, kept);
        const txtBlob = new Blob([txt], { type: 'text/plain' });
        await saveToDrive(txtBlob, \`\${makeFileName(fileBase)}.txt\`);
        setDriveProgress(100);
      }
      
      toastDriveSaved(file);
    } catch (err) {
      toastDriveError(err);
    } finally {
      setDriveProgress(null);
    }
  };`;

code = code.replace(originalSaveToGoogleDrive, updatedSaveToGoogleDrive);
fs.writeFileSync('src/components/podcast-tools/AudioEditor.tsx', code);
console.log('Patched saveToGoogleDrive');
