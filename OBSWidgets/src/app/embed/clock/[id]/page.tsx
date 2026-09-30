'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { ClockPreview } from '../../../clock/page';

export default function ClockEmbed() {
  const params = useParams();
  const id = params.id as string;
  
  const [config, setConfig] = useState<any>(null);
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // 1. Initial Fetch
    const fetchConfig = async () => {
      const { data } = await supabase
        .from('widget_configs')
        .select('config')
        .eq('id', id)
        .single();
      
      if (data) setConfig(data.config);
    };
    fetchConfig();

    // 2. Setup Supabase Realtime Subscription
    const channel = supabase
      .channel(`public:widget_configs:id=eq.${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'widget_configs',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('Realtime update received!', payload);
          setConfig(payload.new.config);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!config) return null;

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <style>{`body { margin: 0; padding: 0; background: transparent; overflow: hidden; }`}</style>
      <ClockPreview config={config} time={time} scale={1} />
    </div>
  );
}
