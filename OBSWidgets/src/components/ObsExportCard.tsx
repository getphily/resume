'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ObsExportCardProps {
  url: string;
  dimensions?: string;
  allowTransparency?: boolean;
  notes?: string[];
  title?: string;
  className?: string;
}

export function ObsExportCard({
  url,
  dimensions = '1920 × 1080',
  allowTransparency = true,
  notes,
  title = 'EXPORT TO OBS',
  className = '',
}: ObsExportCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('OBS Browser Source URL copied to clipboard!', {
        position: 'top-center',
        duration: 2500,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy URL to clipboard');
    }
  };

  return (
    <Card className={`border-border bg-card shadow-sm ${className}`}>
      <CardHeader className="pb-3 pt-5 px-5 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
          {title}
        </CardTitle>
        <Badge variant="secondary" className="text-sm font-semibold text-primary bg-primary/10">
          Browser Source
        </Badge>
      </CardHeader>

      <CardContent className="px-5 pb-5 flex flex-col gap-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Copy this URL and paste it into a new <strong className="text-foreground">Browser Source</strong> in OBS Studio. Any changes made here sync in real-time without restarting OBS!
        </p>

        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
          <li>
            Set Dimensions to <strong className="text-foreground">{dimensions}</strong> (or your canvas size)
          </li>
          {allowTransparency && (
            <li>
              Ensure <strong className="text-foreground">&quot;Allow transparency&quot;</strong> is checked in OBS
            </li>
          )}
          {notes?.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>

        <div className="p-3 bg-muted/50 border border-border rounded-lg flex flex-col gap-2">
          <span className="text-sm font-bold tracking-wider uppercase text-muted-foreground">
            Your Unique Widget URL:
          </span>
          <div className="flex items-center gap-2">
            <Input aria-label="Widget URL"
              readOnly
              value={url}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="font-mono text-sm bg-background h-9 selection:bg-primary/20"
            />
            <Button
              size="sm"
              onClick={handleCopy}
              className={`h-11 px-4 gap-1.5 font-medium shrink-0 transition-colors ${
                copied
                  ? 'bg-success hover:bg-success/90 text-white'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
