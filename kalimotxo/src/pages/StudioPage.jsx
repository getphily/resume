import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { AudioProvider, useAudioData } from '../engine/AudioProvider'
import { VisualSettingsProvider, useVisualSettings } from '../engine/VisualSettingsContext'
import VisualizerCanvas from '../engine/VisualizerCanvas'
import AudioMeter from '../components/AudioMeter'
import Button from '../components/Button'
import HardwarePanel from '../components/hardware/HardwarePanel'
import Fader from '../components/hardware/Fader'
import PerformancePads from '../components/hardware/PerformancePads'
import PresetManager from '../components/hardware/PresetManager'
import { Settings, LogOut, Maximize, Minimize } from 'lucide-react'
import styles from './StudioPage.module.css'

function StudioContent() {
  const navigate = useNavigate()
  const { isListening, stop, setSmoothing } = useAudioData()
  const { settings, updateSetting } = useVisualSettings()
  const [user, setUser] = useState(null)
  
  const previewRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (isListening) {
      setSmoothing(settings.smoothing / 100)
    }
  }, [isListening, settings.smoothing, setSmoothing])

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await previewRef.current?.requestFullscreen().catch(err => console.error(err))
    } else {
      await document.exitFullscreen()
    }
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/auth'); return }
      setUser(user)
    }
    init()
    
    return () => stop()
  }, [navigate, stop])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  return (
    <div className={styles.studioPage}>
      {/* ── Sidebar Control Panel ── */}
      <aside className={styles.sidePanel}>
        <div className={styles.panelHeader}>
          <h2>Studio</h2>
          <Button variant="ghost" size="sm" onClick={handleLogout} title="Log out">
            <LogOut size={16} />
          </Button>
        </div>

        <div className={styles.panelBody}>
          <AudioMeter />
          
          <hr style={{ borderColor: 'var(--clr-border)', margin: '16px 0', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />
          
          <HardwarePanel title="Color Selection">
            <PerformancePads 
              label="Grid Color"
              options={[
                { label: 'Neon Pink', value: '#FF007F' },
                { label: 'Cyan', value: '#00FFFF' },
                { label: 'Gold', value: '#FFD700' },
                { label: 'Amber', value: '#FF5900' },
                { label: 'Blue Violet', value: '#8A2BE2' }
              ]}
              value={settings.gridColor}
              onChange={(val) => updateSetting('gridColor', val)}
            />
            
            <PerformancePads 
              label="Orb Color"
              options={[
                { label: 'Sunset Orange', value: '#FF8C00' },
                { label: 'Magenta', value: '#d926ff' },
                { label: 'Neon Teal', value: '#00FFCC' },
                { label: 'Laser Pink', value: '#FF1493' },
                { label: 'Cyber Violet', value: '#7B2CBF' }
              ]}
              value={settings.orbColor}
              onChange={(val) => updateSetting('orbColor', val)}
            />

            <PerformancePads 
              label="Grid Fill"
              options={[
                { label: 'Pitch Black', value: '#050505' },
                { label: 'Deep Purple', value: '#1A0033' },
                { label: 'Deep Blue', value: '#001A33' },
                { label: 'Midnight Teal', value: '#001A1A' },
                { label: 'Dark Indigo', value: '#0D0221' }
              ]}
              value={settings.gridFillColor}
              onChange={(val) => updateSetting('gridFillColor', val)}
            />
          </HardwarePanel>

          <HardwarePanel title="Reactivity">
            <Fader 
              label="Sensitivity"
              min="0.1" max="3" step="0.1"
              value={settings.sensitivity}
              onChange={(e) => updateSetting('sensitivity', parseFloat(e.target.value))}
              readout={settings.sensitivity.toFixed(1)}
            />
            <Fader 
              label="Speed"
              min="0" max="3" step="0.1"
              value={settings.speed}
              onChange={(e) => updateSetting('speed', parseFloat(e.target.value))}
              readout={settings.speed.toFixed(1)}
            />
            <Fader 
              label="Bloom"
              min="0" max="5" step="0.1"
              value={settings.bloomIntensity}
              onChange={(e) => updateSetting('bloomIntensity', parseFloat(e.target.value))}
              readout={settings.bloomIntensity.toFixed(1)}
              warning="*Resource Intensive"
            />
          </HardwarePanel>

          <HardwarePanel title="Terrain">
            <Fader 
              label="Horizon Flatness"
              min="0" max="60" step="1"
              value={settings.flatEdgeDistance}
              onChange={(e) => updateSetting('flatEdgeDistance', parseInt(e.target.value, 10))}
              readout={settings.flatEdgeDistance}
            />
            <Fader 
              label="Road Length"
              min="90" max="200" step="1"
              value={settings.roadFadeDistance}
              onChange={(e) => updateSetting('roadFadeDistance', parseInt(e.target.value, 10))}
              readout={settings.roadFadeDistance}
              warning="*Resource Intensive"
            />
            <Fader 
              label="Visibility Distance"
              min="10" max="50" step="5"
              value={settings.visibility}
              onChange={(e) => updateSetting('visibility', parseInt(e.target.value, 10))}
              readout={settings.visibility}
            />
          </HardwarePanel>

          <HardwarePanel title="System">
            <Fader 
              label="Audio Smoothing"
              min="70" max="99" step="1"
              value={settings.smoothing}
              onChange={(e) => updateSetting('smoothing', parseInt(e.target.value, 10))}
              readout={settings.smoothing}
            />
          </HardwarePanel>
          
          <PresetManager userId={user?.id} />
        </div>
      </aside>

      {/* ── Main Dashboard Area ── */}
      <main className={styles.mainContent}>
        
        {/* 16:9 Preview Window */}
        <div className={styles.previewContainer} ref={previewRef}>
          <button 
            className={styles.fullscreenBtn} 
            onClick={toggleFullscreen} 
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
          
          {!isListening ? (
            <div style={{ color: 'var(--clr-text-muted)', textAlign: 'center', margin: 'auto' }}>
              <p style={{ fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>// PREVIEW OFFLINE //</p>
              <p>Start Audio Capture to begin.</p>
            </div>
          ) : (
            <div style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <VisualizerCanvas />
            </div>
          )}
        </div>

        {/* Modular Control Panels */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {/* Audio controls or other panels */}
        </div>
      </main>
    </div>
  )
}

export default function StudioPage() {
  return (
    <AudioProvider>
      <VisualSettingsProvider>
        <StudioContent />
      </VisualSettingsProvider>
    </AudioProvider>
  )
}
