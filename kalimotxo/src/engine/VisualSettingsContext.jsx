import { createContext, useContext, useState } from 'react'

const VisualSettingsContext = createContext(null)

export const DEFAULT_SYNTHWAVE = {
  gridColor: '#00FFFF',
  orbColor: '#FF8C00',
  gridFillColor: '#001A33',
  backgroundColor: '#050505',
  bloomIntensity: 2.5,
  sensitivity: 1.0,
  speed: 1.0,
  smoothing: 90,
  flatEdgeDistance: 15,
  roadFadeDistance: 120,
  visibility: 35,
}

export const DEFAULT_COSMICORB = {
  sensitivity: 1.0,
  smoothing: 90,
  blobReactivity: 1.0,
  orbSize: 1.0,
  fieldLineColor1: '#00FF88',
  fieldLineColor2: '#AAFF00',
  fieldLineColor3: '#00FFFF',
}

const DEFAULT_ROOT = {
  activeScene: 'synthwave',
  synthwave: { ...DEFAULT_SYNTHWAVE },
  cosmicorb: { ...DEFAULT_COSMICORB },
}

export function useVisualSettings() {
  const ctx = useContext(VisualSettingsContext)
  if (!ctx) throw new Error('useVisualSettings must be used inside <VisualSettingsProvider>')
  return ctx
}

export function VisualSettingsProvider({ children }) {
  const [root, setRoot] = useState(DEFAULT_ROOT)

  // Update a key within the currently active scene's settings
  const updateSetting = (key, value) => {
    setRoot(prev => ({
      ...prev,
      [prev.activeScene]: { ...prev[prev.activeScene], [key]: value },
    }))
  }

  // Update a key that belongs to a specific named scene
  const updateSceneSetting = (scene, key, value) => {
    setRoot(prev => ({
      ...prev,
      [scene]: { ...prev[scene], [key]: value },
    }))
  }

  // Switch the active scene
  const setActiveScene = (scene) => {
    setRoot(prev => ({ ...prev, activeScene: scene }))
  }

  // Apply a full preset (entire root snapshot from Supabase)
  const applyPreset = (snapshot) => {
    setRoot(prev => ({ ...prev, ...snapshot }))
  }

  // Convenience: the active scene's settings object
  const activeSettings = root[root.activeScene]

  return (
    <VisualSettingsContext.Provider
      value={{ root, activeSettings, updateSetting, updateSceneSetting, setActiveScene, applyPreset }}
    >
      {children}
    </VisualSettingsContext.Provider>
  )
}
