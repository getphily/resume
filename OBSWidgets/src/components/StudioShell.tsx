import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ArrowLeft, Save, Copy, Check, Loader2, SlidersHorizontal, X } from 'lucide-react';
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
        <header className="h-14 sm:h-16 shrink-0 border-b border-border bg-card px-2 sm:px-4 flex items-center justify-between gap-2 z-10 shadow-xs">
          
          {/* Left: Back & Title */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push(backUrl)}
              className="text-muted-foreground hover:text-foreground h-9 w-9 shrink-0"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="hidden md:flex items-center gap-2 border-l border-border pl-3">
              <div className="text-primary">{icon}</div>
              <h1 className="text-sm   m-0 truncate max-w-[150px]">{title}</h1>
            </div>
          </div>

          {/* Center: Widget Name Input */}
          <div className="flex-1 flex justify-center w-full min-w-0 px-2">
            <Input 
              value={widgetName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Unnamed Widget"
              className="h-8 sm:h-9 w-full max-w-[180px] sm:max-w-sm text-center font-semibold text-xs sm:text-sm border-transparent hover:border-border focus:border-primary bg-transparent focus:bg-background transition-colors px-2 truncate"
              aria-label="Widget Name"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
            {hasId && onCopyUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={copySuccess ? "default" : "outline"} 
                    size="sm" 
                    onClick={onCopyUrl}
                    className={cn("h-8 sm:h-9 px-2 sm:px-3 gap-1.5 transition-all shrink-0", copySuccess && "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600")}
                  >
                    {copySuccess ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
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
              className="h-8 sm:h-9 px-3 gap-1.5 font-bold shrink-0"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
            </Button>
          </div>
        </header>

        {/* Main Workspace Split */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
          
          {/* Canvas Area (Top on mobile, Right on desktop) */}
          <main className="w-full lg:flex-1 bg-muted/30 p-4 lg:p-8 flex items-center justify-center relative order-1 lg:order-2 shrink-0 min-h-[30vh] lg:min-h-0">
            <div className="w-full max-w-[1920px] aspect-video relative flex items-center justify-center">
              {previewCanvas}
            </div>
          </main>

          {/* Settings Panel (Bottom on mobile, Left on desktop) */}
          <aside className="w-full lg:w-[350px] xl:w-[400px] shrink-0 border-t lg:border-t-0 lg:border-r border-border bg-card overflow-y-auto flex flex-col z-40 order-2 lg:order-1 flex-1 lg:flex-none">
            <div className="p-4 flex flex-col gap-6 pb-24 lg:pb-4">
              {settingsPanel}
            </div>
          </aside>
        </div>
      </div>
    </TooltipProvider>
  );
}
