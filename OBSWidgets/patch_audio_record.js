const fs = require('fs');

let code = fs.readFileSync('src/components/podcast-tools/AudioEditor.tsx', 'utf8');

// 1. Imports
code = code.replace(
  \`import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';\`,
  \`import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';\`
);

code = code.replace(
  \`import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';\`,
  \`import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';\`
);

// 2. State & Refs
const stateToReplace = \`  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);\`;

const stateReplacement = \`  const recordRef = useRef<InstanceType<typeof RecordPlugin> | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('default');

  const loadDevices = useCallback(async () => {
    try {
      if (devices.length === 0 || !devices[0]?.label) {
        // Request permission to get labels
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      }
      const allDevs = await navigator.mediaDevices.enumerateDevices();
      setDevices(allDevs.filter(d => d.kind === 'audioinput'));
    } catch (e) {
      console.warn('Microphone permission denied or not available.', e);
    }
  }, [devices]);

  useEffect(() => {
    // Attempt to load devices silently (might not have labels yet)
    navigator.mediaDevices?.enumerateDevices().then(devs => {
      setDevices(devs.filter(d => d.kind === 'audioinput'));
    }).catch(() => {});
  }, []);\`;

code = code.replace(stateToReplace, stateReplacement);

// 3. WS Initialization
const wsInitToReplace = \`    const regions = ws.registerPlugin(RegionsPlugin.create());
    regions.enableDragSelection({ color: 'color-mix(in srgb, var(--primary) 25%, transparent)' });

    const syncRegionCount = () => setRegionCount(regions.getRegions().length);
    regions.on('region-created', syncRegionCount);
    regions.on('region-removed', syncRegionCount);\`;

const wsInitReplacement = \`    const regions = ws.registerPlugin(RegionsPlugin.create());
    regions.enableDragSelection({ color: 'color-mix(in srgb, var(--primary) 25%, transparent)' });

    const record = ws.registerPlugin(RecordPlugin.create({
      scrollingWaveform: true,
      renderRecordedAudio: false
    }));

    const syncRegionCount = () => setRegionCount(regions.getRegions().length);
    regions.on('region-created', syncRegionCount);
    regions.on('region-removed', syncRegionCount);

    record.on('record-progress', (duration) => {
      setRecordSeconds(duration / 1000);
    });
    record.on('record-end', (blob) => {
      setIsRecording(false);
      if (blob.size === 0) {
        toast.error('Nothing was recorded.', { position: 'top-center' });
        return;
      }
      void loadBlobAsAudio(blob, 'the recording');
    });\`;

code = code.replace(wsInitToReplace, wsInitReplacement);

const wsDestroyToReplace = \`    return () => {
      ws.destroy();
      wavesurferRef.current = null;
      regionsRef.current = null;
    };\`;

const wsDestroyReplacement = \`    recordRef.current = record;
    return () => {
      ws.destroy();
      wavesurferRef.current = null;
      regionsRef.current = null;
      recordRef.current = null;
    };\`;

code = code.replace(wsDestroyToReplace, wsDestroyReplacement);

// 4. Clean up old timer useEffect
const oldTimerUseEffect = \`  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);\`;

code = code.replace(oldTimerUseEffect, \`\`);

// 5. Replace start/stop recording functions
const recordFnsToReplace = \`  const startRecording = async () => {
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      toast.error("Recording isn't supported in this browser. You can still upload a file.", { position: 'top-center' });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        chunksRef.current = [];
        if (blob.size === 0) {
          toast.error('Nothing was recorded.', { position: 'top-center' });
          return;
        }
        void loadBlobAsAudio(blob, 'the recording');
      };

      wavesurferRef.current?.pause();
      recorder.start();
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000);
      setIsRecording(true);
    } catch (err) {
      console.error('[AudioEditor] mic error', err);
      toast.error('Microphone access was denied or is unavailable.', { position: 'top-center' });
    }
  };

  const stopRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    recordTimerRef.current = null;
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };\`;

const recordFnsReplacement = \`  const startRecording = async () => {
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
  };

  const stopRecording = () => {
    recordRef.current?.stopRecording();
  };\`;

code = code.replace(recordFnsToReplace, recordFnsReplacement);

// 6. UI Header Changes
const uploadRecordButtons = \`          <Button
            variant="outline"
            className={touchBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={isRecording || isBusy}
          >
            <Upload className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Upload Audio
          </Button>
          {!isRecording ? (
            <Button
              className={\\\`\${touchBtn} bg-red-500 hover:bg-red-600 active:bg-red-700 text-white\\\`}
              onClick={startRecording}
              disabled={isBusy}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white mr-2" aria-hidden="true" />
              Record
            </Button>
          ) : (
            <Button
              className={\\\`\${touchBtn} bg-zinc-800 hover:bg-zinc-900 active:bg-black text-white\\\`}
              onClick={stopRecording}
            >
              <Square className="w-4 h-4 mr-1.5 fill-white" aria-hidden="true" />
              Stop · {formatTime(recordSeconds).replace(/\\.\\d$/, '')}
            </Button>
          )}\`;

const uploadRecordButtonsReplacement = \`          <Button
            variant="outline"
            className={touchBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={isRecording || isBusy}
          >
            <Upload className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Upload
          </Button>
          
          <div className="flex items-center gap-2">
            {!isRecording && (
              <Select value={selectedDevice} onValueChange={setSelectedDevice} onOpenChange={(open) => { if (open) loadDevices(); }}>
                <SelectTrigger className={\\\`\${touchBtn} w-40 max-w-full\\\`}>
                  <SelectValue placeholder="Select Mic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Mic</SelectItem>
                  {devices.map(d => (
                    <SelectItem key={d.deviceId} value={d.deviceId}>{d.label || 'Unknown Device'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!isRecording ? (
              <Button
                className={\\\`\${touchBtn} bg-red-500 hover:bg-red-600 active:bg-red-700 text-white\\\`}
                onClick={startRecording}
                disabled={isBusy}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white mr-1.5" aria-hidden="true" />
                Record
              </Button>
            ) : (
              <Button
                className={\\\`\${touchBtn} bg-zinc-800 hover:bg-zinc-900 active:bg-black text-white\\\`}
                onClick={stopRecording}
              >
                <Square className="w-4 h-4 mr-1.5 fill-white" aria-hidden="true" />
                Stop · {formatTime(recordSeconds).replace(/\\.\\d$/, '')}
              </Button>
            )}
          </div>\`;

code = code.replace(uploadRecordButtons, uploadRecordButtonsReplacement);

// 7. Make the container always visible when recording or hasAudio
// Wait, currently: {hasAudio && (view === 'waveform' || view === 'split') && (...container...)}
// If !hasAudio, the container isn't rendered! We MUST render it for the RecordPlugin.

const waveformContainerToReplace = \`      {hasAudio && (view === 'waveform' || view === 'split') && (
        <div className="relative">
          <div
            ref={containerRef}
            className={\\\`w-full bg-muted/20 border border-border rounded-lg overflow-hidden \${view === 'split' ? 'min-h-[96px] h-[96px]' : 'min-h-[128px]'}\\\`}
            aria-label="Audio waveform"
            style={{
              // Add a bit of style if it's split to keep it smaller
            }}
          />
          {isBusy && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg" role="status" aria-label="Rendering waveform">
              <Loader2 className="w-5 h-5 animate-spin text-primary" aria-hidden="true" />
            </div>
          )}
        </div>
      )}
      
      {!hasAudio && (
        <div className="w-full min-h-[128px] bg-muted/20 border border-border rounded-lg overflow-hidden flex flex-col items-center justify-center gap-1 text-center px-4 pointer-events-none relative">
          {isRecording ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <span className="text-sm font-semibold text-foreground">Recording… {formatTime(recordSeconds).replace(/\\.\\d$/, '')}</span>
            </>
          ) : isBusy ? (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Processing audio…
            </span>
          ) : (
            <>
              <span className="text-sm font-semibold text-foreground">No audio yet</span>
              <span className="text-xs text-muted-foreground">Record from your microphone or upload an MP3 / WAV / M4A file.</span>
            </>
          )}
        </div>
      )}\`;

const waveformContainerReplacement = \`      {(!hasAudio || view === 'waveform' || view === 'split') && (
        <div className="relative">
          <div
            ref={containerRef}
            className={\\\`w-full bg-muted/20 border border-border rounded-lg overflow-hidden \${(view === 'split' && hasAudio) ? 'min-h-[96px] h-[96px]' : 'min-h-[128px]'}\\\`}
            aria-label="Audio waveform"
          />
          {(!hasAudio && !isRecording) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center px-4 pointer-events-none bg-muted/20">
              {isBusy ? (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Processing audio…
                </span>
              ) : (
                <>
                  <span className="text-sm font-semibold text-foreground">No audio yet</span>
                  <span className="text-xs text-muted-foreground">Select a mic and record, or upload an audio file.</span>
                </>
              )}
            </div>
          )}
          {isBusy && hasAudio && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg" role="status" aria-label="Rendering waveform">
              <Loader2 className="w-5 h-5 animate-spin text-primary" aria-hidden="true" />
            </div>
          )}
        </div>
      )}\`;

code = code.replace(waveformContainerToReplace, waveformContainerReplacement);

fs.writeFileSync('src/components/podcast-tools/AudioEditor.tsx', code);
console.log('Successfully patched AudioEditor.tsx for RecordPlugin and Mic Selector');
