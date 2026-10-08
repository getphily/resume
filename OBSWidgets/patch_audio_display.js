const fs = require('fs');
let code = fs.readFileSync('src/components/podcast-tools/AudioEditor.tsx', 'utf8');

const containerToReplace = `      {(!hasAudio || view === 'waveform' || view === 'split') && (
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

const containerReplacement = `      <div className={\`relative \${(hasAudio && view === 'transcript') ? 'hidden' : 'block'}\`}>
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
      
      {!hasAudio && isRecording && (
        <div className="mt-2 w-full flex items-center justify-center gap-2 text-center text-sm font-semibold text-foreground animate-pulse">
           <span className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
             <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
           </span>
           Recording… {formatTime(recordSeconds).replace(/\\.\\d$/, '')}
        </div>
      )}`;

code = code.replace(containerToReplace, containerReplacement);
fs.writeFileSync('src/components/podcast-tools/AudioEditor.tsx', code);
