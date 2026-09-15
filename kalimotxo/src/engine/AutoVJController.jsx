/**
 * AutoVJController.jsx
 * 
 * An invisible component that listens to the audio frame data and automatically
 * changes the active scene, settings, and effects based on the energy/vibe of the music.
 */

import { useEffect, useRef } from 'react'
import { useAudioData } from '../engine/AudioProvider'

const CATEGORIES = ['geometry', 'particles', 'wavescape', 'tunnel', 'nebula']

// Helper to pick a random item from array
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

// Helper for random hex color
const randColor = () => `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`

// Helper to generate a somewhat cohesive palette
const generatePalette = (energy) => {
  // If energy is high, pick brighter, saturated colors. If low, darker/cooler.
  const hue1 = Math.floor(Math.random() * 360)
  const hue2 = (hue1 + 180 + (Math.random() * 60 - 30)) % 360 // Complementary-ish
  const s = energy > 0.6 ? 100 : 70
  const l = energy > 0.6 ? 60 : 40
  
  return {
    color1: `hsl(${hue1}, ${s}%, ${l}%)`,
    color2: `hsl(${hue2}, ${s}%, ${l}%)`,
  }
}

export default function AutoVJController({ setCategory, setSceneSettings, setEffects }) {
  const { getFrame } = useAudioData()
  const lastSwitchTime = useRef(0)
  const energyHistory = useRef([])

  useEffect(() => {
    let reqId;
    
    const loop = (timestamp) => {
      const frame = getFrame()
      
      // Calculate overall energy (average of bass, mid, high)
      const energy = (frame.bass + frame.mid + frame.high) / 3
      
      // Keep a rolling history of energy (approx 60 frames = 1 second)
      energyHistory.current.push(energy)
      if (energyHistory.current.length > 60) {
        energyHistory.current.shift()
      }
      
      const avgEnergy = energyHistory.current.reduce((a, b) => a + b, 0) / energyHistory.current.length
      
      // VJ Logic: Decide when to switch scenes
      // We switch if:
      // 1. It's been at least 8 seconds since the last switch AND we hit a huge beat
      // 2. OR it's been 20 seconds anyway
      
      const timeSinceSwitch = timestamp - lastSwitchTime.current
      const isHugeBeat = frame.isBeat && frame.bass > 0.8 && avgEnergy > 0.4
      
      if ((timeSinceSwitch > 8000 && isHugeBeat) || timeSinceSwitch > 20000) {
        lastSwitchTime.current = timestamp
        
        // --- DO THE SWITCH ---
        const newCat = pickRandom(CATEGORIES)
        const palette = generatePalette(avgEnergy)
        
        // Generate random settings for the new category based on energy
        let newSettings = {
          color1: palette.color1,
          color2: palette.color2,
        }
        
        if (newCat === 'geometry') {
          newSettings.shape = pickRandom(['icosahedron', 'torus', 'octahedron', 'tetrahedron', 'dodecahedron'])
          newSettings.material = pickRandom(['wireframe', 'glass', 'holographic', 'emissive'])
          newSettings.detail = Math.floor(Math.random() * 3) + 1
          newSettings.audioSpin = true
          newSettings.explodeOnBeat = avgEnergy > 0.6
          newSettings.rotationSpeedX = Math.random() * 2
          newSettings.rotationSpeedY = Math.random() * 2
        } else if (newCat === 'particles') {
          newSettings.pattern = pickRandom(['galaxy', 'sphere', 'chaos'])
          newSettings.particleCount = avgEnergy > 0.6 ? 20000 : 8000
          newSettings.speed = 0.5 + avgEnergy * 2
        } else if (newCat === 'wavescape') {
          newSettings.speed = 0.5 + avgEnergy
          newSettings.height = 1 + avgEnergy * 3
          newSettings.wireframe = Math.random() > 0.5
        } else if (newCat === 'tunnel') {
          newSettings.speed = 1 + avgEnergy * 4
          newSettings.warp = Math.random() * 3
        } else if (newCat === 'nebula') {
          newSettings.density = avgEnergy > 0.5 ? 800 : 300
          newSettings.speed = 0.5 + avgEnergy
        }
        
        // Generate new global effects
        const newEffects = {
          bloom: 0.5 + avgEnergy * 2,
          chromaticAberration: isHugeBeat ? 0.05 : 0.01,
          noise: Math.random() * 0.3,
          scanlines: Math.random() > 0.7,
          vignette: 0.2 + Math.random() * 0.4,
        }
        
        // Apply changes
        setCategory(newCat)
        setSceneSettings(prev => ({
          ...prev,
          [newCat]: { ...prev[newCat], ...newSettings }
        }))
        setEffects(newEffects)
      }
      
      reqId = requestAnimationFrame(loop)
    }
    
    reqId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(reqId)
  }, [getFrame, setCategory, setSceneSettings, setEffects])

  return null
}
