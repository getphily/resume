import { useEffect, useRef, useState, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette, Scanline } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

import { AudioProvider, useAudioData } from '../engine/AudioProvider'
import GeometryScene from '../scenes/GeometryScene'
import ParticleScene from '../scenes/ParticleScene'
import WavescapeScene from '../scenes/WavescapeScene'
import TunnelScene from '../scenes/TunnelScene'
import NebulaScene from '../scenes/NebulaScene'
import CategoryPicker from '../components/CategoryPicker'
import AutoVJController from '../engine/AutoVJController'
import SettingsPanel from '../components/SettingsPanel'
import EffectsPanel from '../components/EffectsPanel'
import AudioMeter from '../components/AudioMeter'
import Button from '../components/Button'

import { Play, Square, Mic, Settings, LogOut, ChevronDown, Monitor, Trash2, Save, Maximize, Minimize, Menu } from 'lucide-react'
import styles from './WorkspacePage.module.css'

// ── Default Presets ──
const DEFAULT_SCENE_SETTINGS = {
  geometry: {
    shape: 'icosahedron',
    detail: 2,
    displacement: 1.5,
    rotationSpeedX: 0.3,
    rotationSpeedY: 0.5,
    rotationSpeedZ: 0.1,
    audioSpin: true,
    material: 'wireframe',
    color1: '#7C3AED',
    color2: '#00E5FF',
    iridescence: 0.5,
    explodeOnBeat: false,
    background: 'void',
  },
  particles: {
    pattern: 'galaxy',
    particleCount: 10000,
    speed: 1.0,
    beatReactivity: 1.0,
    size: 0.05,
    color1: '#00E5FF',
    color2: '#FF0055',
  },
  wavescape: {
    resolution: 64,
    height: 2.0,
    speed: 1.0,
    color1: '#7C3AED',
    color2: '#00E5FF',
    wireframe: true,
  },
  tunnel: {
    speed: 2.0,
    segments: 64,
    radius: 2,
    color1: '#00E5FF',
    color2: '#7C3AED',
    wireframe: true,
    warp: 1.0,
  },
  nebula: {
    density: 300,
    size: 4.0,
    speed: 1.0,
    color1: '#7C3AED',
    color2: '#FF0055',
  }
}

const DEFAULT_EFFECTS = {
  bloom: 0.5,
  chromaticAberration: 0.002,
  noise: 0.1,
  scanlines: false,
  vignette: 0.3,
  performanceMode: false,
}

// Separate the actual content from the provider wrapper so we can use the context
function WorkspaceContent() {
  const navigate = useNavigate()
  const { isListening, stop } = useAudioData()
  
  const containerRef = useRef(null)
  
  const [user, setUser] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [autoVJ, setAutoVJ] = useState(false)
  
  // State
  const [category, setCategory] = useState('geometry')
  const [sceneSettings, setSceneSettings] = useState(DEFAULT_SCENE_SETTINGS)
  const [effects, setEffects] = useState(DEFAULT_EFFECTS)
  
  // Presets
  const [visualName, setVisualName] = useState('')
  const [savedVisuals, setSavedVisuals] = useState([])
  const [statusMsg, setStatusMsg] = useState(null)

  // Auth & Load
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/auth'); return }
      setUser(user)
      loadPresets(user.id)
    }
    init()

    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => {
      stop()
      document.removeEventListener('fullscreenchange', onFsChange)
    }
  }, [navigate, stop])

  useEffect(() => {
    if (!statusMsg) return
    const t = setTimeout(() => setStatusMsg(null), 4000)
    return () => clearTimeout(t)
  }, [statusMsg])

  // ── Database ──
  const loadPresets = async (userId) => {
    const { data, error } = await supabase
      .from('kalimotxo_visuals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) setSavedVisuals(data)
    if (error) console.error('Error loading presets:', error)
  }

  const handleSave = async () => {
    if (!user) return
    const name = visualName.trim() || 'Untitled'
    
    // Package it all into our v2 schema
    const presetData = {
      version: 2,
      category,
      scene: sceneSettings[category],
      effects
    }

    const { error } = await supabase
      .from('kalimotxo_visuals')
      .insert([{ user_id: user.id, name, settings: presetData }])
      
    if (error) {
      setStatusMsg({ type: 'error', text: 'Save failed.' })
    } else {
      setStatusMsg({ type: 'success', text: `"${name}" saved!` })
      setVisualName('')
      loadPresets(user.id)
    }
  }

  const handleLoadPreset = (preset) => {
    if (preset.version === 2) {
      setCategory(preset.category)
      setSceneSettings(s => ({ ...s, [preset.category]: preset.scene }))
      if (preset.effects) setEffects(preset.effects)
      setStatusMsg({ type: 'success', text: 'Preset loaded!' })
    } else {
      // Legacy preset support - map to Geometry category gracefully
      setCategory('geometry')
      
      const legacySettings = {
        shape: preset.shape === 'cube' ? 'dodecahedron' : preset.shape || 'icosahedron',
        detail: preset.complexity ? Math.ceil(preset.complexity * 5) : 3,
        displacement: preset.audioReactivity ? preset.audioReactivity * 2 : 0.5,
        rotationSpeedX: preset.speed || 1.0,
        rotationSpeedY: preset.speed || 1.0,
        rotationSpeedZ: preset.speed ? preset.speed / 2 : 0.5,
        audioSpin: !!preset.audioReactivity,
        explodeOnBeat: !!preset.audioReactivity,
        material: preset.wireframe ? 'wireframe' : 'glass',
        color1: preset.primaryColor || preset.color1 || '#7C3AED',
        color2: preset.secondaryColor || preset.color2 || '#00E5FF',
        iridescence: 0.5,
        edgeGlow: 1.0
      }
      
      setSceneSettings(s => ({ ...s, geometry: legacySettings }))
      setStatusMsg({ type: 'success', text: 'Legacy preset upgraded and loaded!' })
    }
  }

  const handleDeletePreset = async (id) => {
    const { error } = await supabase.from('kalimotxo_visuals').delete().eq('id', id)
    if (!error) loadPresets(user.id)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const activeSettings = sceneSettings[category]
  const updateActiveSettings = (newSet) => {
    setSceneSettings(s => ({ ...s, [category]: newSet }))
  }

  const renderScene = () => {
    switch (category) {
      case 'geometry':
        return <GeometryScene settings={activeSettings} />
      case 'particles':
        return <ParticleScene settings={activeSettings} />
      case 'wavescape':
        return <WavescapeScene settings={activeSettings} />
      case 'tunnel':
        return <TunnelScene settings={activeSettings} />
      case 'nebula':
        return <NebulaScene settings={activeSettings} />
      default:
        return <GeometryScene settings={activeSettings} />
    }
  }

  return (
    <div ref={containerRef} className={styles.workspace} data-fullscreen={isFullscreen}>
      
      {/* ── Sidebar ── */}
      {!isFullscreen && (
        <aside className={`${styles.sidebar} ${!isSidebarOpen ? styles.sidebarClosed : ''}`}>
          
          {/* Header */}
          <div className={styles.sidebarHeader} style={{ justifyContent: isSidebarOpen ? 'space-between' : 'center', flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isSidebarOpen ? '16px' : '0' }}>
              {isSidebarOpen && (
                <button 
                  onClick={() => setAutoVJ(!autoVJ)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    padding: '8px 12px', borderRadius: '8px',
                    border: '1px solid', borderColor: autoVJ ? 'var(--clr-cyan)' : 'var(--clr-border)',
                    background: autoVJ ? 'rgba(0, 229, 255, 0.1)' : 'var(--clr-surface-2)',
                    color: autoVJ ? 'var(--clr-cyan)' : 'var(--clr-text-primary)',
                    fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>✨</span> AI Vibe {autoVJ ? 'ON' : 'OFF'}
                </button>
              )}
              <button
                className={`${styles.sidebarToggle} ${styles.desktopOnly}`}
                onClick={() => setIsSidebarOpen(o => !o)}
                aria-label={isSidebarOpen ? 'Collapse' : 'Expand'}
              >
                <ChevronDown
                  size={16}
                  style={{ transform: isSidebarOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 250ms' }}
                />
              </button>
              <button
                className={`${styles.sidebarToggle} ${styles.mobileOnly}`}
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <ChevronDown
                  size={16}
                  style={{ transform: 'rotate(90deg)' }}
                />
              </button>
            </div>
            
            {isSidebarOpen && (
              <div style={{ opacity: autoVJ ? 0.3 : 1, pointerEvents: autoVJ ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
                <CategoryPicker active={category} onChange={setCategory} />
              </div>
            )}
          </div>

          {/* Body */}
          {isSidebarOpen && (
            <div className={styles.sidebarBody}>
              
              <div style={{ opacity: autoVJ ? 0.3 : 1, pointerEvents: autoVJ ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
                <SettingsPanel 
                  category={category} 
                  settings={activeSettings} 
                  onChange={updateActiveSettings} 
                />
              </div>
              
              <div className={styles.divider} />
              
              <EffectsPanel 
                effects={effects} 
                onChange={setEffects} 
              />

              <div className={styles.divider} />

              <AudioMeter />

              <div className={styles.divider} />

              {/* Presets & Fullscreen */}
              <section className={styles.section}>
                <h2 className={styles.sectionLabel}>Presentation</h2>
                <Button variant="secondary" fullWidth onClick={toggleFullscreen}>
                  <Maximize size={16} /> Fullscreen / OBS mode
                </Button>
              </section>
              
              <div className={styles.divider} />

              <section className={styles.section}>
                <h2 className={styles.sectionLabel}>Presets</h2>
                <div className={styles.saveRow}>
                  <input
                    type="text"
                    value={visualName}
                    onChange={(e) => setVisualName(e.target.value)}
                    placeholder="Name this visual…"
                    className={styles.presetInput}
                    maxLength={50}
                  />
                  <Button variant="primary" size="sm" onClick={handleSave} title="Save">
                    <Save size={16} />
                  </Button>
                </div>

                {statusMsg && (
                  <div className={`${styles.statusMsg} ${styles[`status-${statusMsg.type}`]}`}>
                    {statusMsg.text}
                  </div>
                )}

                {savedVisuals.length > 0 ? (
                  <ul className={styles.presetList}>
                    {savedVisuals.map((v) => (
                      <li key={v.id} className={styles.presetItem}>
                        <button className={styles.presetLoad} onClick={() => handleLoadPreset(v.settings)}>
                          {v.name}
                        </button>
                        <button className={styles.presetDelete} onClick={() => handleDeletePreset(v.id)}>
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.emptyPresets}>No saved presets yet.</p>
                )}
              </section>

            </div>
          )}

          {/* Footer */}
          {isSidebarOpen && (
            <div className={styles.sidebarFooter}>
              <Button variant="ghost" size="sm" fullWidth onClick={handleLogout}>Log out</Button>
            </div>
          )}
        </aside>
      )}

      {/* ── 3D Canvas Area ── */}
      <main className={styles.canvasArea}>
        
        {/* Floating Toolbar (Fullscreen & Mobile Menu) */}
        {!isFullscreen && (
          <div className={styles.floatingToolbar}>
            <button className={`${styles.iconButton} ${styles.mobileOnly}`} onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <button className={styles.iconButton} onClick={toggleFullscreen} aria-label="Enter fullscreen">
              <Maximize size={20} />
            </button>
          </div>
        )}

        {autoVJ && isListening && (
          <AutoVJController 
            setCategory={setCategory}
            setSceneSettings={setSceneSettings}
            setEffects={setEffects}
          />
        )}

        {/* R3F Canvas */}
        <Canvas
          gl={{ antialias: false, powerPreference: "high-performance" }}
          dpr={effects.performanceMode ? [0.5, 1] : [1, 2]} // clamp pixel ratio for performance
          camera={{ position: [0, 0, 5], fov: 45 }}
        >
          <color attach="background" args={[activeSettings?.background === 'void' ? '#05050A' : '#111']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          <Suspense fallback={null}>
            {renderScene()}
            
            {/* Post-Processing */}
            {!effects.performanceMode && (
              <EffectComposer disableNormalPass>
                {effects.bloom > 0 && (
                  <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={effects.bloom} />
                )}
                {effects.noise > 0 && (
                  <Noise opacity={effects.noise} blendFunction={BlendFunction.OVERLAY} />
                )}
                {effects.vignette > 0 && (
                  <Vignette eskil={false} offset={0.1} darkness={effects.vignette} />
                )}
                {effects.chromaticAberration > 0 && (
                  <ChromaticAberration
                    blendFunction={BlendFunction.NORMAL}
                    offset={new THREE.Vector2(effects.chromaticAberration, effects.chromaticAberration)}
                  />
                )}
                {effects.scanlines && (
                  <Scanline blendFunction={BlendFunction.OVERLAY} density={1.2} />
                )}
              </EffectComposer>
            )}
          </Suspense>
        </Canvas>

        {/* Idle Overlay */}
        {!isListening && (
          <div className={styles.idleOverlay}>
            <div className={styles.idleContent}>
              <div className={styles.idleIcon}><Monitor size={32} /></div>
              <p className={styles.idleTitle}>No audio signal</p>
              <p className={styles.idleHint}>Click "Capture" in the audio panel to begin.</p>
            </div>
          </div>
        )}

        {isFullscreen && (
          <button className={styles.exitFullscreen} onClick={toggleFullscreen}>
            <Minimize size={20} />
          </button>
        )}
      </main>
    </div>
  )
}

export default function WorkspacePage() {
  return (
    <AudioProvider>
      <WorkspaceContent />
    </AudioProvider>
  )
}
