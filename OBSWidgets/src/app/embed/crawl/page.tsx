'use client';

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import ChyronPreview from '@/components/ChyronPreview';
import type { ChyronConfig } from '@/types/chyron';
import { DEFAULT_CHYRON_CONFIG } from '@/types/chyron';

const mergeConfig = (c: any): ChyronConfig => {
  const loadedOrder = c?.layerOrder || DEFAULT_CHYRON_CONFIG.layerOrder;
  const finalOrder = [...loadedOrder];
  ['title', 'subheader', 'crawl', 'logo', 'clock'].forEach(l => {
    if (!finalOrder.includes(l as any)) finalOrder.push(l as any);
  });

  return {
    ...DEFAULT_CHYRON_CONFIG,
    ...(c || {}),
    layout: { ...DEFAULT_CHYRON_CONFIG.layout, ...(c?.layout || {}) },
    title: { ...DEFAULT_CHYRON_CONFIG.title, ...(c?.title || {}) },
    subheader: { ...DEFAULT_CHYRON_CONFIG.subheader, ...(c?.subheader || {}) },
    logo: { ...DEFAULT_CHYRON_CONFIG.logo, ...(c?.logo || {}) },
    clock: { ...DEFAULT_CHYRON_CONFIG.clock, ...(c?.clock || {}) },
    crawl: { 
      ...DEFAULT_CHYRON_CONFIG.crawl, 
      ...(c?.crawl || {}),
      blocks: (Array.isArray(c?.crawl?.blocks) && c.crawl.blocks.length > 0)
        ? c.crawl.blocks
        : DEFAULT_CHYRON_CONFIG.crawl.blocks
    },
    layerOrder: finalOrder,
  };
};

function ChyronEmbedContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [config, setConfig] = useState<ChyronConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const handleVisibility = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

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
        setConfig(mergeConfig(data.config));
      }
      setLoading(false);
    };

    fetchConfig();

    // Real-time sync
    const channel = supabase
      .channel(`chyron-embed-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'widget_configs',
          filter: `id=eq.${id}`
        },
        (payload) => {
          if (payload.new?.config) {
            setConfig(mergeConfig(payload.new.config));
          }
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
      <ChyronPreview config={config} scale={1} isPaused={isPaused} />
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
