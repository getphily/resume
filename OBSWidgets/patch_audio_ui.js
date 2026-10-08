const fs = require('fs');
let code = fs.readFileSync('src/components/podcast-tools/AudioEditor.tsx', 'utf8');

const uploadRecordButtons = `          <Button
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
              className={\`\${touchBtn} bg-red-500 hover:bg-red-600 active:bg-red-700 text-white\`}
              onClick={startRecording}
              disabled={isBusy}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white mr-2" aria-hidden="true" />
              Record
            </Button>
          ) : (
            <Button
              className={\`\${touchBtn} bg-zinc-800 hover:bg-zinc-900 active:bg-black text-white\`}
              onClick={stopRecording}
            >
              <Square className="w-4 h-4 mr-1.5 fill-white" aria-hidden="true" />
              Stop · {formatTime(recordSeconds).replace(/\\.\\d$/, '')}
            </Button>
          )}`;

const uploadRecordButtonsReplacement = `          <Button
            variant="outline"
            className={touchBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={isRecording || isBusy}
          >
            <Upload className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Upload Audio
          </Button>
          <div className="flex items-center gap-2">
            {!isRecording && (
              <Select value={selectedDevice} onValueChange={setSelectedDevice} onOpenChange={(open) => { if (open) loadDevices(); }}>
                <SelectTrigger className={\`\${touchBtn} w-40 max-w-full\`}>
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
                className={\`\${touchBtn} bg-red-500 hover:bg-red-600 active:bg-red-700 text-white\`}
                onClick={startRecording}
                disabled={isBusy}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white mr-1.5" aria-hidden="true" />
                Record
              </Button>
            ) : (
              <Button
                className={\`\${touchBtn} bg-zinc-800 hover:bg-zinc-900 active:bg-black text-white\`}
                onClick={stopRecording}
              >
                <Square className="w-4 h-4 mr-1.5 fill-white" aria-hidden="true" />
                Stop · {formatTime(recordSeconds).replace(/\\.\\d$/, '')}
              </Button>
            )}
          </div>`;

code = code.replace(uploadRecordButtons, uploadRecordButtonsReplacement);

const waveformContainerToReplace = `      {hasAudio && (view === 'waveform' || view === 'split') && (
        <div className="relative">
          <div
            ref={containerRef}
            className={\`w-full bg-muted/20 border border-border rounded-lg overflow-hidden \${view === 'split' ? 'min-h-[96px] h-[96px]' : 'min-h-[128px]'}\`}
            aria-label="Audio waveform"
            style={{
              // ...
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
      )}`;

const waveformContainerReplacement = `      {(!hasAudio || view === 'waveform' || view === 'split') && (
        <div className="relative">
          <div
            ref={containerRef}
            className={\`w-full bg-muted/20 border border-border rounded-lg overflow-hidden \${(view === 'split' && hasAudio) ? 'min-h-[96px] h-[96px]' : 'min-h-[128px]'}\`}
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
      )}
      
      {!hasAudio && isRecording && (
        <div className="mt-2 w-full flex items-center justify-center gap-2 text-center text-sm font-semibold text-foreground animate-pulse">
           <span className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
             <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
           </span>
           Recording… {formatTime(recordSeconds).replace(/\\.\\d$/, '')}
        </div>
      )}`;

code = code.replace(waveformContainerToReplace, waveformContainerReplacement);

fs.writeFileSync('src/components/podcast-tools/AudioEditor.tsx', code);
