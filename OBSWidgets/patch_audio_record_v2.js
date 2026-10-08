const fs = require('fs');
let code = fs.readFileSync('src/components/podcast-tools/AudioEditor.tsx', 'utf8');

code = code.replace(
  "import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';",
  "import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';\nimport RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';"
);

code = code.replace(
  "import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';",
  "import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';\nimport { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';"
);

const stateToReplace = `  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);`;

const stateReplacement = `  const recordRef = useRef<InstanceType<typeof RecordPlugin> | null>(null);
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
  }, []);`;

code = code.replace(stateToReplace, stateReplacement);

const wsInitToReplace = `    const regions = ws.registerPlugin(RegionsPlugin.create());
    regions.enableDragSelection({ color: 'color-mix(in srgb, var(--primary) 25%, transparent)' });

    const syncRegionCount = () => setRegionCount(regions.getRegions().length);
    regions.on('region-created', syncRegionCount);
    regions.on('region-removed', syncRegionCount);`;

const wsInitReplacement = `    const regions = ws.registerPlugin(RegionsPlugin.create());
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
    });`;

code = code.replace(wsInitToReplace, wsInitReplacement);

const wsDestroyToReplace = `    return () => {
      ws.destroy();
      wavesurferRef.current = null;
      regionsRef.current = null;
    };`;

const wsDestroyReplacement = `    recordRef.current = record;
    return () => {
      ws.destroy();
      wavesurferRef.current = null;
      regionsRef.current = null;
      recordRef.current = null;
    };`;

code = code.replace(wsDestroyToReplace, wsDestroyReplacement);

const oldTimerUseEffect = `  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);`;

code = code.replace(oldTimerUseEffect, ``);

const recordFnsToReplace = `  const startRecording = async () => {
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
  };`;

const recordFnsReplacement = `  const startRecording = async () => {
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
  };`;

code = code.replace(recordFnsToReplace, recordFnsReplacement);

fs.writeFileSync('src/components/podcast-tools/AudioEditor.tsx', code);
