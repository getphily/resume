import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Maximize, Minimize, Save, Play, Square, Monitor } from 'lucide-react'

export default function VisualizerWorkspace() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  
  // Audio state
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const reqFrameRef = useRef(null)
  const [isListening, setIsListening] = useState(false)
  
  // Preset state
  const [visualName, setVisualName] = useState('My Visual')
  const [settings, setSettings] = useState({ color: '#4CAF50', sensitivity: 1.0 })
  const [savedVisuals, setSavedVisuals] = useState([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    // Get user and load presets
    const fetchUserAndPresets = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        loadPresets(user.id)
      }
    }
    fetchUserAndPresets()

    // Fullscreen change listener
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    
    return () => {
      stopListening()
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [])

  const loadPresets = async (userId) => {
    const { data, error } = await supabase
      .from('kalimotxo_visuals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) setSavedVisuals(data)
    if (error) console.error("Error loading presets:", error)
  }

  const handleSavePreset = async () => {
    if (!user) return
    const { error } = await supabase
      .from('kalimotxo_visuals')
      .insert([
        { user_id: user.id, name: visualName, settings: settings }
      ])
    if (!error) {
      alert('Visual saved successfully!')
      loadPresets(user.id)
    } else {
      console.error("Error saving preset:", error)
      alert("Failed to save visual. Ensure you ran the SQL setup in Supabase!")
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const startSystemAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true })
      
      // Stop the video track because we only want audio
      stream.getVideoTracks().forEach(track => track.stop());

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 512
      
      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)
      
      audioContextRef.current = audioCtx
      analyserRef.current = analyser
      sourceRef.current = source
      
      setIsListening(true)
      draw()
    } catch (err) {
      console.error("Error accessing system audio", err)
      alert("System audio access is required. Make sure to check 'Share tab audio' or 'Share system audio' in the prompt!")
    }
  }

  const stopListening = () => {
    if (reqFrameRef.current) cancelAnimationFrame(reqFrameRef.current)
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
    }
    if (sourceRef.current) sourceRef.current.mediaStream.getTracks().forEach(t => t.stop())
    
    setIsListening(false)
  }

  // Ref to access current settings inside the drawing loop without restarting it
  const settingsRef = useRef(settings)
  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas || !analyserRef.current) return
    
    const ctx = canvas.getContext('2d')
    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    reqFrameRef.current = requestAnimationFrame(draw)
    
    analyser.getByteFrequencyData(dataArray)
    
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    const barWidth = (canvas.width / bufferLength) * 2.5
    let barHeight
    let x = 0
    
    // Parse hex color from settings to rgb for gradient mixing
    const hex = settingsRef.current.color.replace('#', '')
    const baseR = parseInt(hex.substring(0, 2), 16) || 0
    const baseG = parseInt(hex.substring(2, 4), 16) || 255
    const baseB = parseInt(hex.substring(4, 6), 16) || 0
    
    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] * settingsRef.current.sensitivity
      
      const r = Math.min(255, baseR + (barHeight / 2))
      const g = Math.min(255, baseG + (i / bufferLength) * 50)
      const b = Math.min(255, baseB + (barHeight / 4))
      
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
      
      x += barWidth + 1
    }
  }

  return (
    <div ref={containerRef} style={{ backgroundColor: '#000', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      
      {/* Hide Header & Sidebar if Fullscreen */}
      {!isFullscreen && (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#111', borderBottom: '1px solid #333' }}>
          <h2 style={{ margin: 0 }}>Kalimotxo Visualizer</h2>
          <div>
            <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: 'transparent', color: '#ccc', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer' }}>Log Out</button>
          </div>
        </header>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Sidebar Controls */}
        {!isFullscreen && (
          <aside style={{ width: '300px', backgroundColor: '#1a1a1a', padding: '20px', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3>Controls</h3>
                {!isListening ? (
                  <button onClick={startSystemAudio} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                      <Monitor size={18} /> Capture System Audio
                  </button>
                ) : (
                  <button onClick={stopListening} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                      <Square size={18} /> Stop Audio
                  </button>
                )}
                
                <button onClick={toggleFullscreen} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer' }}>
                <Maximize size={18} /> Presentation Mode (OBS)
                </button>
            </div>

            <div style={{ height: '1px', backgroundColor: '#333' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3>Visual Settings</h3>
                <label>
                    Base Color:
                    <input 
                        type="color" 
                        value={settings.color} 
                        onChange={(e) => setSettings({...settings, color: e.target.value})}
                        style={{ marginLeft: '10px', verticalAlign: 'middle' }}
                    />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    Sensitivity ({settings.sensitivity}):
                    <input 
                        type="range" 
                        min="0.1" max="3" step="0.1" 
                        value={settings.sensitivity}
                        onChange={(e) => setSettings({...settings, sensitivity: parseFloat(e.target.value)})}
                    />
                </label>
            </div>

            <div style={{ height: '1px', backgroundColor: '#333' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3>Save Preset</h3>
                <input 
                    type="text" 
                    value={visualName} 
                    onChange={(e) => setVisualName(e.target.value)} 
                    placeholder="Visual Name"
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#222', color: 'white' }}
                />
                <button onClick={handleSavePreset} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    <Save size={18} /> Save to Account
                </button>
            </div>

            {savedVisuals.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                    <h4>My Saved Visuals</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {savedVisuals.map(v => (
                            <li key={v.id}>
                                <button 
                                    onClick={() => { setVisualName(v.name); setSettings(v.settings); }}
                                    style={{ width: '100%', textAlign: 'left', padding: '8px', backgroundColor: '#222', color: '#ddd', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    {v.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
          </aside>
        )}

        {/* Main Canvas Area */}
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isFullscreen ? '0' : '20px', backgroundColor: '#000', position: 'relative' }}>
          <canvas 
            ref={canvasRef} 
            width={1920} 
            height={1080} 
            style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                backgroundColor: '#050505', 
                borderRadius: isFullscreen ? '0' : '8px', 
                boxShadow: isFullscreen ? 'none' : '0 4px 20px rgba(0,0,0,0.5)' 
            }}
          />
          
          {/* Overlay exit button if fullscreen (helpful if they don't know ESC) */}
          {isFullscreen && (
              <button onClick={toggleFullscreen} style={{ position: 'absolute', top: '20px', right: '20px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer', zIndex: 10 }}>
                  <Minimize size={20} />
              </button>
          )}
        </main>
      </div>
    </div>
  )
}
