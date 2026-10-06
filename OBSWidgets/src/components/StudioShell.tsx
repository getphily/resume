import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ArrowLeft, Save, Copy, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StudioShellProps {
  title: string;
  icon: React.ReactNode;
  widgetName: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  isSaving: boolean;
  onCopyUrl?: () => void;
  copySuccess?: boolean;
  hasId?: boolean;
  settingsPanel: React.ReactNode;
  previewCanvas: React.ReactNode;
  backUrl?: string;
}

export function StudioShell({
  title,
  icon,
  widgetName,
  onNameChange,
  onSave,
  isSaving,
  onCopyUrl,
  copySuccess,
  hasId,
  settingsPanel,
  previewCanvas,
  backUrl = '/dashboard',
}: StudioShellProps) {
  const router = useRouter();

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full lg:h-[calc(100vh-72px)] w-full overflow-hidden bg-background text-foreground">
        
        {/* Sub-Header Toolbar */}
        <header className="h-16 shrink-0 border-b border-border bg-card px-4 flex items-center justify-between gap-4 z-10 shadow-xs">
          
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3 shrink-0 w-1/3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push(backUrl)}
              className="text-muted-foreground hover:text-foreground h-9 w-9"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="hidden sm:flex items-center gap-2 border-l border-border pl-3">
              <div className="text-primary">{icon}</div>
              <h1 className="text-sm font-bold tracking-tight m-0">{title}</h1>
            </div>
          </div>

          {/* Center: Widget Name Input */}
          <div className="flex-1 flex justify-center max-w-sm w-full shrink-0">
            <Input 
              value={widgetName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Unnamed Widget"
              className="h-9 text-center font-semibold text-sm border-transparent hover:border-border focus:border-primary bg-transparent focus:bg-background transition-colors"
              aria-label="Widget Name"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-2 shrink-0 w-1/3">
            {hasId && onCopyUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={copySuccess ? "default" : "outline"} 
                    size="sm" 
                    onClick={onCopyUrl}
                    className={cn("h-9 gap-1.5 transition-all", copySuccess && "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600")}
                  >
                    {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copySuccess ? 'Copied URL' : 'Copy URL'}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy OBS Browser Source URL</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Button 
              onClick={onSave} 
              disabled={isSaving}
              size="sm"
              className="h-9 gap-1.5 font-bold"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
            </Button>
          </div>
        </header>

        {/* Main Workspace Split */}
        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row relative">
          
          {/* Left Settings Panel */}
          <aside className="w-full lg:w-[350px] xl:w-[400px] shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-card overflow-y-auto flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            <div className="p-4 flex flex-col gap-6">
              {settingsPanel}
            </div>
          </aside>

          {/* Right Canvas Area */}
          <main className="flex-1 bg-muted/30 overflow-y-auto p-4 lg:p-8 flex items-center justify-center relative min-h-[50vh]">
            <div className="w-full max-w-[1920px] aspect-video relative flex items-center justify-center">
              {previewCanvas}
            </div>
          </main>

        </div>
      </div>
    </TooltipProvider>
  );
}
