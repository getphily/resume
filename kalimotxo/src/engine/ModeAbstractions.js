/**
 * ModeAbstractions.js
 * Defines the presets for Easy mode and the macro mappings for Intermediate mode.
 */

export const EASY_PRESETS = {
  geometry: {
    Chill: { shape: 'torus', detail: 3, displacement: 0.2, rotationSpeedX: 0.1, rotationSpeedY: 0.2, rotationSpeedZ: 0.1, audioSpin: false, explodeOnBeat: false, material: 'glass', color1: '#00E5FF', color2: '#7C3AED', iridescence: 0.3, edgeGlow: 0.5 },
    Rave: { shape: 'icosahedron', detail: 2, displacement: 1.5, rotationSpeedX: 2.0, rotationSpeedY: 2.0, rotationSpeedZ: 0.5, audioSpin: true, explodeOnBeat: true, material: 'wireframe', color1: '#FF0055', color2: '#00FF00', iridescence: 0, edgeGlow: 2.5 },
    Trippy: { shape: 'torusKnot', detail: 5, displacement: 0.8, rotationSpeedX: 0.5, rotationSpeedY: 0.5, rotationSpeedZ: 0.5, audioSpin: true, explodeOnBeat: false, material: 'holographic', color1: '#FF00FF', color2: '#00FFFF', iridescence: 1.0, edgeGlow: 1.5 },
    Dark: { shape: 'dodecahedron', detail: 1, displacement: 0, rotationSpeedX: 0.1, rotationSpeedY: 0.1, rotationSpeedZ: 0.1, audioSpin: false, explodeOnBeat: true, material: 'emissive', color1: '#FF0000', color2: '#220000', iridescence: 0, edgeGlow: 3.0 },
  },
  particles: {
    Chill: { pattern: 'galaxy', particleCount: 5000, speed: 0.2, beatReactivity: 0.2, size: 0.05, color1: '#7C3AED', color2: '#00E5FF' },
    Rave: { pattern: 'chaos', particleCount: 15000, speed: 2.5, beatReactivity: 1.8, size: 0.15, color1: '#FF0055', color2: '#FFFF00' },
    Trippy: { pattern: 'sphere', particleCount: 10000, speed: 1.0, beatReactivity: 1.0, size: 0.08, color1: '#FF00FF', color2: '#00FFFF' },
    Dark: { pattern: 'galaxy', particleCount: 2000, speed: 0.1, beatReactivity: 0.5, size: 0.02, color1: '#FF0000', color2: '#110000' },
  },
  wavescape: {
    Chill: { resolution: 32, height: 0.5, speed: 0.2, color1: '#7C3AED', color2: '#00E5FF', wireframe: false },
    Rave: { resolution: 128, height: 3.0, speed: 2.0, color1: '#FF0055', color2: '#00FF00', wireframe: true },
    Trippy: { resolution: 64, height: 1.5, speed: 1.0, color1: '#FF00FF', color2: '#00FFFF', wireframe: true },
    Dark: { resolution: 64, height: 0.2, speed: 0.5, color1: '#111111', color2: '#FF0000', wireframe: true },
  },
  tunnel: {
    Chill: { speed: 0.5, warp: 0.2, radius: 3, color1: '#7C3AED', color2: '#00E5FF', wireframe: false },
    Rave: { speed: 4.0, warp: 3.0, radius: 2, color1: '#FF0055', color2: '#FFFF00', wireframe: true },
    Trippy: { speed: 2.0, warp: 5.0, radius: 4, color1: '#FF00FF', color2: '#00FFFF', wireframe: true },
    Dark: { speed: 1.0, warp: 0.1, radius: 5, color1: '#110000', color2: '#FF0000', wireframe: true },
  },
  nebula: {
    Chill: { density: 100, size: 6.0, speed: 0.1, color1: '#7C3AED', color2: '#00E5FF' },
    Rave: { density: 800, size: 3.0, speed: 2.0, color1: '#FF0055', color2: '#FFFF00' },
    Trippy: { density: 500, size: 8.0, speed: 0.5, color1: '#FF00FF', color2: '#00FFFF' },
    Dark: { density: 50, size: 2.0, speed: 0.2, color1: '#FF0000', color2: '#220000' },
  }
}

// Defines intermediate macros for each category
// Each macro has a name and an update function that takes a value (0 to 1) 
// and returns an object of advanced settings to merge.
export const INTERMEDIATE_MACROS = {
  geometry: [
    {
      name: 'Energy',
      update: (val) => ({
        rotationSpeedX: val * 5,
        rotationSpeedY: val * 5,
        displacement: val * 3,
        audioSpin: val > 0.3,
        explodeOnBeat: val > 0.7
      })
    },
    {
      name: 'Complexity',
      update: (val) => ({
        detail: Math.floor(val * 4) + 1, // 1 to 5
        edgeGlow: val * 3,
        iridescence: val
      })
    }
  ],
  particles: [
    {
      name: 'Energy',
      update: (val) => ({
        speed: val * 3,
        beatReactivity: val * 2
      })
    },
    {
      name: 'Density',
      update: (val) => ({
        particleCount: 1000 + val * 19000,
        size: 0.01 + val * 0.19
      })
    }
  ],
  wavescape: [
    {
      name: 'Energy',
      update: (val) => ({
        speed: val * 3,
        height: 0.1 + val * 4.9
      })
    },
    {
      name: 'Complexity',
      update: (val) => ({
        resolution: 32 + Math.floor(val * 12) * 8, // 32 to 128 step 8
        wireframe: val > 0.5
      })
    }
  ],
  tunnel: [
    {
      name: 'Energy',
      update: (val) => ({
        speed: val * 5,
        warp: val * 5
      })
    },
    {
      name: 'Space',
      update: (val) => ({
        radius: 1 + val * 4,
        wireframe: val > 0.5
      })
    }
  ],
  nebula: [
    {
      name: 'Energy',
      update: (val) => ({
        speed: val * 3,
        size: 1 + val * 9
      })
    },
    {
      name: 'Density',
      update: (val) => ({
        density: 50 + val * 950
      })
    }
  ]
}
