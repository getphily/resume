'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import { ClockPreview } from '../../(app)/clock/page';

function ClockEmbedContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
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
        setConfig(data.config);
      }
      setLoading(false);
    };

    fetchConfig();

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
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ClockPreview config={config} time={time} />
    </div>
  );
}

import { Suspense } from 'react';

export default function ClockEmbed() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClockEmbedContent />
    </Suspense>
  );
}
