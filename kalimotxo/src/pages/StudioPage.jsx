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
  const { root, updateSetting, updateSceneSetting, setActiveScene } = useVisualSettings()
  const sw = root.synthwave ?? {}
  const orb = root.cosmicorb ?? {}
  const [user, setUser] = useState(null)
  
  const previewRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (isListening) {
      // Use smoothing from the active scene
      const smoothing = root.activeScene === 'synthwave' ? sw.smoothing : orb.smoothing
      setSmoothing(smoothing / 100)
    }
  }, [isListening, sw.smoothing, orb.smoothing, root.activeScene, setSmoothing])

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

          <HardwarePanel title="Visual Scene">
            <PerformancePads
              label="Scene Select"
              options={[
                { label: 'Synthwave', value: 'synthwave' },
                { label: 'Cosmic Orb', value: 'cosmicorb' },
              ]}
              value={root.activeScene}
              onChange={(val) => setActiveScene(val)}
            />
          </HardwarePanel>

          <hr style={{ borderColor: 'var(--clr-border)', margin: '16px 0', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />

          {/* ── SYNTHWAVE SETTINGS ── */}
          {root.activeScene === 'synthwave' && (<>
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
                value={sw.gridColor}
                onChange={(val) => updateSceneSetting('synthwave', 'gridColor', val)}
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
                value={sw.orbColor}
                onChange={(val) => updateSceneSetting('synthwave', 'orbColor', val)}
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
                value={sw.gridFillColor}
                onChange={(val) => updateSceneSetting('synthwave', 'gridFillColor', val)}
              />
            </HardwarePanel>

            <HardwarePanel title="Reactivity">
              <Fader 
                label="Sensitivity"
                min="0.1" max="3" step="0.1"
                value={sw.sensitivity}
                onChange={(e) => updateSceneSetting('synthwave', 'sensitivity', parseFloat(e.target.value))}
                readout={sw.sensitivity.toFixed(1)}
              />
              <Fader 
                label="Speed"
                min="0" max="3" step="0.1"
                value={sw.speed}
                onChange={(e) => updateSceneSetting('synthwave', 'speed', parseFloat(e.target.value))}
                readout={sw.speed.toFixed(1)}
              />
              <Fader 
                label="Bloom"
                min="0" max="5" step="0.1"
                value={sw.bloomIntensity}
                onChange={(e) => updateSceneSetting('synthwave', 'bloomIntensity', parseFloat(e.target.value))}
                readout={sw.bloomIntensity.toFixed(1)}
                warning="*Resource Intensive"
              />
            </HardwarePanel>

            <HardwarePanel title="Terrain">
              <Fader 
                label="Horizon Flatness"
                min="0" max="60" step="1"
                value={sw.flatEdgeDistance}
                onChange={(e) => updateSceneSetting('synthwave', 'flatEdgeDistance', parseInt(e.target.value, 10))}
                readout={sw.flatEdgeDistance}
              />
              <Fader 
                label="Road Length"
                min="90" max="200" step="1"
                value={sw.roadFadeDistance}
                onChange={(e) => updateSceneSetting('synthwave', 'roadFadeDistance', parseInt(e.target.value, 10))}
                readout={sw.roadFadeDistance}
                warning="*Resource Intensive"
              />
              <Fader 
                label="Visibility Distance"
                min="10" max="50" step="5"
                value={sw.visibility}
                onChange={(e) => updateSceneSetting('synthwave', 'visibility', parseInt(e.target.value, 10))}
                readout={sw.visibility}
              />
            </HardwarePanel>

            <HardwarePanel title="System">
              <Fader 
                label="Audio Smoothing"
                min="70" max="99" step="1"
                value={sw.smoothing}
                onChange={(e) => updateSceneSetting('synthwave', 'smoothing', parseInt(e.target.value, 10))}
                readout={sw.smoothing}
              />
            </HardwarePanel>
          </>)}

          {/* ── COSMIC ORB SETTINGS ── */}
          {root.activeScene === 'cosmicorb' && (<>
            <HardwarePanel title="Field Lines">
              <PerformancePads
                label="Primary (Green)"
                options={[
                  { label: 'Neon Green', value: '#00FF88' },
                  { label: 'Lime', value: '#AAFF00' },
                  { label: 'Cyan', value: '#00FFFF' },
                  { label: 'Magenta', value: '#FF00FF' },
                  { label: 'Amber', value: '#FF8C00' },
                ]}
                value={orb.fieldLineColor1}
                onChange={(val) => updateSceneSetting('cosmicorb', 'fieldLineColor1', val)}
              />
              <PerformancePads
                label="Secondary (Lime)"
                options={[
                  { label: 'Lime', value: '#AAFF00' },
                  { label: 'Neon Green', value: '#00FF88' },
                  { label: 'Yellow', value: '#FFE500' },
                  { label: 'Hot Pink', value: '#FF007F' },
                  { label: 'Electric Blue', value: '#0055FF' },
                ]}
                value={orb.fieldLineColor2}
                onChange={(val) => updateSceneSetting('cosmicorb', 'fieldLineColor2', val)}
              />
              <PerformancePads
                label="Tertiary (Cyan)"
                options={[
                  { label: 'Cyan', value: '#00FFFF' },
                  { label: 'Teal', value: '#00FFCC' },
                  { label: 'White', value: '#FFFFFF' },
                  { label: 'Violet', value: '#AA00FF' },
                  { label: 'Coral', value: '#FF4444' },
                ]}
                value={orb.fieldLineColor3}
                onChange={(val) => updateSceneSetting('cosmicorb', 'fieldLineColor3', val)}
              />
            </HardwarePanel>

            <HardwarePanel title="Reactivity">
              <Fader
                label="Sensitivity"
                min="0.1" max="3" step="0.1"
                value={orb.sensitivity}
                onChange={(e) => updateSceneSetting('cosmicorb', 'sensitivity', parseFloat(e.target.value))}
                readout={orb.sensitivity.toFixed(1)}
              />
              <Fader
                label="Blob Reactivity"
                min="0" max="3" step="0.1"
                value={orb.blobReactivity}
                onChange={(e) => updateSceneSetting('cosmicorb', 'blobReactivity', parseFloat(e.target.value))}
                readout={orb.blobReactivity.toFixed(1)}
              />
            </HardwarePanel>

            <HardwarePanel title="Orb">
              <Fader
                label="Orb Size"
                min="0.4" max="2.0" step="0.05"
                value={orb.orbSize}
                onChange={(e) => updateSceneSetting('cosmicorb', 'orbSize', parseFloat(e.target.value))}
                readout={orb.orbSize.toFixed(2)}
              />
            </HardwarePanel>

            <HardwarePanel title="System">
              <Fader 
                label="Audio Smoothing"
                min="70" max="99" step="1"
                value={orb.smoothing}
                onChange={(e) => updateSceneSetting('cosmicorb', 'smoothing', parseInt(e.target.value, 10))}
                readout={orb.smoothing}
              />
            </HardwarePanel>
          </>)}
          
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
