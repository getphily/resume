/**
 * NebulaScene.jsx — Audio-reactive abstract volumetric clouds.
 * Renders large, soft, overlapping particles to simulate gas clouds.
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAudioData } from '../engine/AudioProvider'

// Create a soft radial gradient texture for the particles
const createSoftParticleTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.5)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  
  const tex = new THREE.CanvasTexture(canvas)
  return tex
}

export default function NebulaScene({ settings }) {
  const pointsRef = useRef()
  const { getFrame } = useAudioData()
  const smoothed = useRef({ bass: 0, mid: 0, high: 0 })

  const {
    density = 300,
    size = 4.0,
    speed = 1.0,
    color1 = '#7C3AED',
    color2 = '#FF0055',
  } = settings || {}

  const col1 = useMemo(() => new THREE.Color(color1), [color1])
  const col2 = useMemo(() => new THREE.Color(color2), [color2])
  
  const texture = useMemo(() => createSoftParticleTexture(), [])

  // Generate particle positions
  const { positions, colors, randoms } = useMemo(() => {
    const count = Math.min(Math.max(50, density), 1000)
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const rand = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Clustered near the center, fading out
      const radius = Math.pow(Math.random(), 2) * 15
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z

      // Blend color1 and color2 based on position
      const mixed = col1.clone().lerp(col2, Math.random())
      col[i * 3] = mixed.r
      col[i * 3 + 1] = mixed.g
      col[i * 3 + 2] = mixed.b

      rand[i] = Math.random()
    }

    return { positions: pos, colors: col, randoms: rand }
  }, [density, col1, col2])

  useFrame((state, delta) => {
    const frame = getFrame()
    const s = smoothed.current
    const lerpSpeed = 8 * delta

    s.bass = THREE.MathUtils.lerp(s.bass, frame.bass, lerpSpeed)
    s.mid = THREE.MathUtils.lerp(s.mid, frame.mid, lerpSpeed)
    s.high = THREE.MathUtils.lerp(s.high, frame.high, lerpSpeed)

    if (!pointsRef.current) return

    pointsRef.current.rotation.y += speed * delta * 0.1
    pointsRef.current.rotation.z += speed * delta * 0.05

    // Pulse size and opacity
    const material = pointsRef.current.material
    material.size = size * (1 + s.bass * 1.5)
    material.opacity = Math.min(1.0, 0.4 + s.mid * 0.5)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        map={texture}
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  )
}
