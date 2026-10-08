const fs = require('fs');
let code = fs.readFileSync('src/components/podcast-tools/AudioEditor.tsx', 'utf8');

const selectOld = \`                <SelectContent>
                  <SelectItem value="default">Default Mic</SelectItem>
                  {devices.map(d => (
                    <SelectItem key={d.deviceId} value={d.deviceId}>{d.label || 'Unknown Device'}</SelectItem>
                  ))}
                </SelectContent>\`;

const selectNew = \`                <SelectContent>
                  <SelectItem value="default">System Default</SelectItem>
                  {devices.filter(d => d.deviceId !== 'default').map(d => (
                    <SelectItem key={d.deviceId} value={d.deviceId}>{d.label || 'Unknown Device'}</SelectItem>
                  ))}
                </SelectContent>\`;

code = code.replace(selectOld, selectNew);

const startOld = \`  const startRecording = async () => {
    if (!recordRef.current) return;
    try {
      await loadDevices(); // ensure permissions
      wavesurferRef.current?.pause();
      setIsRecording(true);
      setRecordSeconds(0);
      await recordRef.current.startRecording(
        selectedDevice && selectedDevice !== 'default' ? { deviceId: selectedDevice } : undefined
      );
    } catch (err) {
      setIsRecording(false);
      console.error('[AudioEditor] mic error', err);
      toast.error('Microphone access was denied or is unavailable.', { position: 'top-center' });
    }
  };\`;

const startNew = \`  const startRecording = async () => {
    if (!recordRef.current) return;
    try {
      await loadDevices(); // ensure permissions
      wavesurferRef.current?.pause();
      setIsRecording(true);
      setRecordSeconds(0);
      if (typeof (recordRef.current as any).stopMic === 'function') {
         (recordRef.current as any).stopMic();
      }
      await recordRef.current.startRecording(
        selectedDevice && selectedDevice !== 'default' ? { deviceId: { exact: selectedDevice } } : undefined
      );
    } catch (err) {
      setIsRecording(false);
      console.error('[AudioEditor] mic error', err);
      toast.error('Microphone access was denied or is unavailable.', { position: 'top-center' });
    }
  };\`;

code = code.replace(startOld, startNew);
fs.writeFileSync('src/components/podcast-tools/AudioEditor.tsx', code);
console.log('Patched');
