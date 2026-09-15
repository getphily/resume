import { createContext, useContext, useState } from 'react'

const VisualSettingsContext = createContext(null)

export function useVisualSettings() {
  const ctx = useContext(VisualSettingsContext)
  if (!ctx) throw new Error('useVisualSettings must be used inside <VisualSettingsProvider>')
  return ctx
}

export function VisualSettingsProvider({ children }) {
  const [settings, setSettings] = useState({
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
  })

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const applyPreset = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  return (
    <VisualSettingsContext.Provider value={{ settings, updateSetting, applyPreset }}>
      {children}
    </VisualSettingsContext.Provider>
  )
}
