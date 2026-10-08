const fs = require('fs');

let code = fs.readFileSync('src/components/podcast-tools/AudioEditor.tsx', 'utf8');

const importStatement = `import { exportText, exportSrt, exportVtt } from '@/lib/audioEditor/exportTranscript';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText } from 'lucide-react';
`;

code = code.replace(
  `import { TranscribeCard } from '@/components/podcast-tools/TranscribeCard';`,
  `${importStatement}\import { TranscribeCard } from '@/components/podcast-tools/TranscribeCard';`
);

const exportFunctions = `  const downloadTranscript = (format: 'txt' | 'srt' | 'vtt') => {
    if (!transcript) return;
    let content = '';
    if (format === 'txt') content = exportText(transcript, kept);
    if (format === 'srt') content = exportSrt(transcript, kept);
    if (format === 'vtt') content = exportVtt(transcript, kept);
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`\${makeFileName(fileBase)}.\${format}\`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadWav = () => {`;

code = code.replace(
  `  const downloadWav = () => {`,
  exportFunctions
);

const exportButtons = `              <Button className={touchBtn} onClick={downloadWav} disabled={isBusy}>
                <Download className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Download WAV
              </Button>
              {transcript && transcript.words.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className={touchBtn} disabled={isBusy}>
                      <FileText className="w-4 h-4 mr-1.5" aria-hidden="true" />
                      Transcript
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => downloadTranscript('txt')}>Download as .txt</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => downloadTranscript('srt')}>Download as .srt</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => downloadTranscript('vtt')}>Download as .vtt</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>`;

code = code.replace(
  `              <Button className={touchBtn} onClick={downloadWav} disabled={isBusy}>
                <Download className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Download WAV
              </Button>
            </div>
          </div>`,
  exportButtons
);

fs.writeFileSync('src/components/podcast-tools/AudioEditor.tsx', code);
console.log('Successfully patched AudioEditor.tsx with transcript exports');
