'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { TimerConfig, DEFAULT_TIMER_CONFIG } from '@/types/timer';
import { TimerPreview } from '@/components/TimerPreview';
import { playTimerAlarm } from '@/lib/sound';

function TimerEmbedContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [config, setConfig] = useState<TimerConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // For the actual embed, we will run the timer
  const [actualState, setActualState] = useState<'STOPPED' | 'RUNNING' | 'PAUSED' | 'EXPIRED'>('RUNNING');
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      const { data } = await supabase.from('widget_configs').select('config').eq('id', id).single();
      if (data && data.config) {
        const c = data.config as TimerConfig;
        setConfig(c);
        setTimeLeft(c.durationSeconds);
      } else {
        setConfig(DEFAULT_TIMER_CONFIG);
        setTimeLeft(DEFAULT_TIMER_CONFIG.durationSeconds);
      }
      setLoading(false);
    };

    fetchConfig();

    const channel = supabase.channel(`timer_config_${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'widget_configs', filter: `id=eq.${id}` }, (payload) => {
        if (payload.new && payload.new.config) {
          const c = payload.new.config as TimerConfig;
          setConfig(c);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  useEffect(() => {
    if (!config) return;
    
    if (actualState === 'RUNNING') {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setActualState('EXPIRED');
            
            // Play alarm
            if (config.sound.enabled) {
              playTimerAlarm(config.sound.type, config.sound.volume);
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [config, actualState]);

  if (loading) return null; // Transparent while loading
  if (!config) return <div style={{ color: 'white', padding: '20px' }}>Invalid Timer ID</div>;

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <TimerPreview config={config} previewState={actualState} previewTimeLeft={timeLeft} />
    </div>
  );
}

export default function TimerEmbed() {
  return (
    <Suspense fallback={null}>
      <TimerEmbedContent />
    </Suspense>
  );
}
