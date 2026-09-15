/**
 * ParticleScene.jsx — Audio-reactive particle system.
 * Uses a large PointCloud that swarms and reacts to frequency bands.
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAudioData } from '../engine/AudioProvider'

export default function ParticleScene({ settings }) {
  const pointsRef = useRef()
  const { getFrame } = useAudioData()

  // Smoothed values
  const smoothed = useRef({ bass: 0, mid: 0, high: 0, beat: 0 })

  const {
    particleCount = 10000,
    size = 0.05,
    speed = 1.0,
    color1 = '#00E5FF',
    color2 = '#FF0055',
    pattern = 'galaxy', // 'galaxy', 'sphere', 'chaos'
    beatReactivity = 1.0,
  } = settings || {}

  const col1 = useMemo(() => new THREE.Color(color1), [color1])
  const col2 = useMemo(() => new THREE.Color(color2), [color2])

  // Generate particle positions and base colors
  const { positions, colors, randoms } = useMemo(() => {
    const count = Math.min(Math.max(1000, particleCount), 50000)
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const rand = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      let x, y, z
      
      if (pattern === 'galaxy') {
        const radius = Math.random() * 8
        const angle = Math.random() * Math.PI * 2
        const armOffset = (radius * 2) % (Math.PI * 2)
        x = Math.cos(angle + armOffset) * radius
        z = Math.sin(angle + armOffset) * radius
        y = (Math.random() - 0.5) * (2 - radius * 0.2) // Thicker at center
      } else if (pattern === 'sphere') {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(Math.random() * 2 - 1)
        const radius = 3 + Math.random() * 2
        x = radius * Math.sin(phi) * Math.cos(theta)
        y = radius * Math.sin(phi) * Math.sin(theta)
        z = radius * Math.cos(phi)
      } else {
        // Chaos
        x = (Math.random() - 0.5) * 10
        y = (Math.random() - 0.5) * 10
        z = (Math.random() - 0.5) * 10
      }

      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z

      // Base color logic (mix col1 and col2 based on distance from center)
      const dist = Math.sqrt(x*x + y*y + z*z) / 8
      const mixed = col1.clone().lerp(col2, Math.min(1, dist))
      col[i * 3] = mixed.r
      col[i * 3 + 1] = mixed.g
      col[i * 3 + 2] = mixed.b

      rand[i] = Math.random()
    }

    return { positions: pos, colors: col, randoms: rand }
  }, [particleCount, pattern, col1, col2])

  useFrame((state, delta) => {
    const frame = getFrame()
    const s = smoothed.current
    const lerpSpeed = 8 * delta

    s.bass = THREE.MathUtils.lerp(s.bass, frame.bass, lerpSpeed)
    s.mid = THREE.MathUtils.lerp(s.mid, frame.mid, lerpSpeed)
    s.high = THREE.MathUtils.lerp(s.high, frame.high, lerpSpeed)
    s.beat = THREE.MathUtils.lerp(s.beat, frame.isBeat ? 1 : 0, lerpSpeed * 0.5)

    if (!pointsRef.current) return

    // Rotate entire system
    pointsRef.current.rotation.y += speed * delta * 0.2 * (1 + s.bass)
    pointsRef.current.rotation.z += speed * delta * 0.05

    const time = state.clock.elapsedTime * speed
    const geo = pointsRef.current.geometry
    const pos = geo.attributes.position.array
    const count = pos.length / 3

    // Explode factor
    const explode = s.beat * beatReactivity * 2

    for (let i = 0; i < count; i++) {
      const ix = i * 3
      const r = randoms[i]

      // We don't want to permanently move them, but vertex shaders are better for this.
      // Since this is JS, we'll just do a mild wave to avoid tanking FPS.
      // A small subset gets updated based on mid/high
      if (i % 3 === 0) {
        pos[ix + 1] += Math.sin(time * 3 + r * 10) * 0.01 * s.mid
      }
    }
    geo.attributes.position.needsUpdate = true

    // Pulse size
    pointsRef.current.material.size = size * (1 + s.bass * beatReactivity)
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
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
