'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AudioLines, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioEditor } from '@/components/podcast-tools/AudioEditor';

/** Same key the "Your Podcast" page writes, so exports are named after the show. */
const SHOW_METADATA_KEY = 'podcast_show_metadata';

export default function RecordingStudioPage() {
  const [showTitle, setShowTitle] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SHOW_METADATA_KEY);
      if (saved) setShowTitle(JSON.parse(saved)?.title);
    } catch {
      /* corrupt metadata just means generic file names */
    }
  }, []);

  return (
    <div className="w-full min-h-full bg-background overflow-y-auto p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <AudioLines className="w-8 h-8 text-primary shrink-0" aria-hidden="true" />
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Recording Studio</h1>
              <p className="text-sm text-muted-foreground">
                Record or upload an episode, cut it down, then Magic Polish it before export.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="min-h-11 sm:min-h-9 w-fit gap-1.5">
            <Link href="/podcast-tools">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Your Podcast
            </Link>
          </Button>
        </div>

        <AudioEditor showTitle={showTitle} />
      </div>
    </div>
  );
}
