'use client';

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import ChyronPreview from '@/components/ChyronPreview';
import type { ChyronConfig } from '@/types/chyron';

function ChyronEmbedContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [config, setConfig] = useState<ChyronConfig | null>(null);
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
        setConfig(data.config);
      }
      setLoading(false);
    };

    fetchConfig();

    // Real-time sync
    const channel = supabase
      .channel('schema-db-changes-chyron')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'widget_configs',
          filter: `id=eq.${id}`
        },
        (payload) => {
          setConfig(payload.new.config);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) return null;
  if (error) return <div style={{ color: 'red', fontFamily: 'monospace', padding: '20px' }}>{error}</div>;
  if (!config) return null;

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'flex-end',
    }}>
      <ChyronPreview config={config} scale={1} />
    </div>
  );
}

export default function ChyronEmbed() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChyronEmbedContent />
    </Suspense>
  );
}
