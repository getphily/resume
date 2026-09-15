/**
 * TunnelScene.jsx — Audio-reactive infinite tunnel.
 * Gives the illusion of flying through a wireframe or solid tunnel.
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAudioData } from '../engine/AudioProvider'

export default function TunnelScene({ settings }) {
  const meshRef = useRef()
  const { getFrame } = useAudioData()

  // Smoothed values
  const smoothed = useRef({ bass: 0, mid: 0, high: 0 })

  const {
    speed = 2.0,
    segments = 64,
    radius = 2,
    color1 = '#00E5FF',
    color2 = '#7C3AED',
    wireframe = true,
    warp = 1.0,
  } = settings || {}

  const col1 = useMemo(() => new THREE.Color(color1), [color1])
  const col2 = useMemo(() => new THREE.Color(color2), [color2])

  // Create the tube geometry (a very large torus)
  const { geometry, material } = useMemo(() => {
    // 30 radius (very large so it looks mostly straight with a slight curve)
    // 'radius' is the tube thickness (e.g. 2)
    const geo = new THREE.TorusGeometry(30, radius, 16, segments * 2)
    // Rotate the geometry so it lies in the XZ plane. Its axis of symmetry becomes the Y axis.
    geo.rotateX(Math.PI / 2)
    
    const mat = new THREE.MeshStandardMaterial({
      color: col1,
      emissive: col1,
      emissiveIntensity: 0.2,
      wireframe: wireframe,
      side: THREE.BackSide, // We are inside it!
    })

    return { geometry: geo, material: mat }
  }, [segments, radius, wireframe, col1])

  useFrame((state, delta) => {
    const frame = getFrame()
    const s = smoothed.current
    const lerpSpeed = 8 * delta

    s.bass = THREE.MathUtils.lerp(s.bass, frame.bass, lerpSpeed)
    s.mid = THREE.MathUtils.lerp(s.mid, frame.mid, lerpSpeed)
    s.high = THREE.MathUtils.lerp(s.high, frame.high, lerpSpeed)

    if (!meshRef.current) return

    // Fly through the tunnel by rotating the huge torus around its center (Y axis)
    // Speed is affected by bass
    meshRef.current.rotation.y -= speed * delta * 0.2 * (1 + s.bass * 2)

    // Pulse the tube radius slightly based on bass
    const scale = 1 + s.bass * 0.1
    meshRef.current.scale.set(scale, scale, scale)

    // Blend color
    const blended = col1.clone().lerp(col2, s.high)
    material.color.copy(blended)
    material.emissive.copy(blended).multiplyScalar(0.2 + s.bass * 0.5)
  })

  // We place the torus center at x = -30, z = 5.
  // The camera is at (0, 0, 5).
  // The rightmost edge of the torus is at x = -30 + 30 = 0.
  // So the camera is perfectly inside the tube.
  return (
    <group>
      <fog attach="fog" args={['#05050A', 5, 25]} />
      <mesh ref={meshRef} position={[-30, 0, 5]} geometry={geometry} material={material} />
    </group>
  )
}
