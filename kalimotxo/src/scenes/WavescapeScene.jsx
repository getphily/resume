/**
 * WavescapeScene.jsx — Audio-reactive terrain mesh.
 * Renders a grid that displaces its Y-axis vertices based on audio data.
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAudioData } from '../engine/AudioProvider'

export default function WavescapeScene({ settings }) {
  const meshRef = useRef()
  const wireframeRef = useRef()
  const { getFrame, audioDataArray } = useAudioData()

  // Smoothed values
  const smoothed = useRef({ bass: 0, mid: 0, high: 0 })

  const {
    resolution = 64,
    height = 2.0,
    speed = 1.0,
    color1 = '#7C3AED',
    color2 = '#00E5FF',
    wireframe = true,
  } = settings || {}

  const col1 = useMemo(() => new THREE.Color(color1), [color1])
  const col2 = useMemo(() => new THREE.Color(color2), [color2])

  // Create the plane geometry
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(16, 16, resolution, resolution)
    // Rotate to lie flat on XZ plane
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [resolution])

  const wireGeo = useMemo(() => {
    return new THREE.EdgesGeometry(geometry)
  }, [geometry])

  useFrame((state, delta) => {
    const frame = getFrame()
    const s = smoothed.current
    const lerpSpeed = 8 * delta

    s.bass = THREE.MathUtils.lerp(s.bass, frame.bass, lerpSpeed)
    s.mid = THREE.MathUtils.lerp(s.mid, frame.mid, lerpSpeed)
    s.high = THREE.MathUtils.lerp(s.high, frame.high, lerpSpeed)

    if (!meshRef.current) return

    const time = state.clock.elapsedTime * speed
    const geo = meshRef.current.geometry
    const pos = geo.attributes.position.array
    const count = pos.length / 3

    // We have a 64x64 grid (or resolution x resolution).
    // Let's make waves that travel across the Z axis, and inject audio FFT data into the X axis.
    for (let i = 0; i < count; i++) {
      const ix = i * 3
      const x = pos[ix]
      const z = pos[ix + 2]

      // Determine FFT index based on X position (mapping -8..8 to 0..64)
      let normX = (x + 8) / 16
      // Mirror it so the middle is low frequencies and edges are high
      normX = Math.abs(normX - 0.5) * 2 // 0 at center, 1 at edges

      let audioVal = 0
      if (audioDataArray) {
        // Map normX to array index (0 to 128 out of 512 for better visual range)
        const dataIdx = Math.floor(normX * 128)
        if (dataIdx < audioDataArray.length) {
          audioVal = (audioDataArray[dataIdx] / 255.0) * height
        }
      }

      // Traveling wave on Z
      const wave = Math.sin(x * 1.5 + time * 2) * Math.cos(z * 1.5 + time) * 0.2
      
      // Combine base wave + audio spectrum displacement
      pos[ix + 1] = wave + audioVal * (1 - (z + 8) / 16) // fade out in the distance
    }
    
    geo.attributes.position.needsUpdate = true
    geo.computeVertexNormals()

    // Color shift
    if (meshRef.current.material) {
      meshRef.current.material.color.copy(col1)
      meshRef.current.material.emissive.copy(col1).multiplyScalar(s.bass)
    }

    if (wireframeRef.current) {
      const blendedColor = col1.clone().lerp(col2, s.mid)
      wireframeRef.current.material.color.copy(blendedColor)
    }
  })

  // Slightly angle the camera/scene
  return (
    <group position={[0, -2, -2]} rotation={[0.2, 0, 0]}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color={color1}
          emissive={color1}
          emissiveIntensity={0.2}
          roughness={0.8}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {wireframe && (
        <lineSegments ref={wireframeRef} geometry={wireGeo} position={[0, 0.01, 0]}>
          <lineBasicMaterial
            color={color2}
            transparent
            opacity={0.3}
            linewidth={1}
          />
        </lineSegments>
      )}
    </group>
  )
}
