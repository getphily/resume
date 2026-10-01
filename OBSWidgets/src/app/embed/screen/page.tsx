'use client';

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import { ScreenPreview } from '@/components/ScreenPreview';
import { ScreenConfig } from '@/types/screen';

function ScreenEmbedContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const pageId = searchParams.get('page');
  const [config, setConfig] = useState<ScreenConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('No ID provided');
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      const { data, error } = await supabase
        .from('widget_configs')
        .select('config')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        setError('Widget not found');
      } else {
        setConfig(data.config as ScreenConfig);
      }
      setLoading(false);
    };

    fetchConfig();

    // Realtime subscription for instant updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'widget_configs',
          filter: `id=eq.${id}`
        },
        (payload) => {
          setConfig(payload.new.config as ScreenConfig);
        }
      )
      .subscribe();

    // Polling fallback every 30s in case realtime misses an update (e.g. timer start)
    const pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from('widget_configs')
        .select('config')
        .eq('id', id)
        .single();
      if (data) {
        setConfig(data.config as ScreenConfig);
      }
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [id]);

  if (loading) return null;
  if (error) return <div style={{ color: 'red', fontFamily: 'monospace', padding: '20px' }}>{error}</div>;
  if (!config) return null;

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', margin: 0, padding: 0 }}>
      <ScreenPreview config={config} activePageId={pageId || undefined} />
    </div>
  );
}

export default function ScreenEmbed() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScreenEmbedContent />
    </Suspense>
  );
}
