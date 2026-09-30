'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { MarqueePreview } from '../../../marquee/page';

export default function MarqueeEmbed() {
  const params = useParams();
  const id = params.id as string;
  
  const [config, setConfig] = useState<any>(null);

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
      .channel(`public:widget_configs:marquee_id=eq.${id}`)
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

  if (!config) return null;

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <style>{`body { margin: 0; padding: 0; background: transparent; overflow: hidden; }`}</style>
      <MarqueePreview config={config} scale={1} />
    </div>
  );
}
