/**
 * GeometryScene.jsx — Audio-reactive sacred geometry visualizer.
 *
 * Renders a 3D geometric form that pulses, rotates, and glows
 * based on real-time audio analysis.
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useAudioData } from '../engine/AudioProvider'

/** Map shape name → Three.js geometry constructor args */
const SHAPES = {
  icosahedron:   (d) => new THREE.IcosahedronGeometry(1.8, d),
  torus:         (d) => new THREE.TorusGeometry(1.5, 0.6, 16 * d, 48 * d),
  torusKnot:     (d) => new THREE.TorusKnotGeometry(1.3, 0.4, 64 * d, 8 * d),
  octahedron:    (d) => new THREE.OctahedronGeometry(2, d),
  dodecahedron:  (d) => new THREE.DodecahedronGeometry(1.8, d),
  tetrahedron:   (d) => new THREE.TetrahedronGeometry(2, d),
  cylinder:      (d) => new THREE.CylinderGeometry(1.5, 1.5, 3, 16 * d, d * 2, true),
  cone:          (d) => new THREE.ConeGeometry(1.8, 3, 16 * d, d * 2, true),
  ring:          (d) => new THREE.RingGeometry(0.8, 2, 32 * d, d),
}

export default function GeometryScene({ settings }) {
  const meshRef       = useRef()
  const wireframeRef  = useRef()
  const glowRef       = useRef()
  const { getFrame }  = useAudioData()

  // Smoothed values (lerped each frame for smooth visuals)
  const smoothed = useRef({ bass: 0, mid: 0, high: 0, volume: 0, beat: 0 })

  const {
    shape = 'icosahedron',
    detail = 2,
    displacement = 1.5,
    rotationSpeedX = 0.3,
    rotationSpeedY = 0.5,
    rotationSpeedZ = 0.1,
    audioSpin = true,
    material = 'wireframe',
    color1 = '#7C3AED',
    color2 = '#00E5FF',
    iridescence = 0.5,
    explodeOnBeat = false,
    edgeGlow = 1.5,
    background = 'void',
  } = settings || {}

  // Create geometry (memoised on shape + detail)
  const geometry = useMemo(() => {
    const builder = SHAPES[shape] || SHAPES.icosahedron
    const clampedDetail = Math.max(1, Math.min(6, Math.round(detail)))
    return builder(clampedDetail)
  }, [shape, detail])

  // Create the wireframe geometry
  const wireGeo = useMemo(() => {
    return new THREE.EdgesGeometry(geometry, 15)
  }, [geometry])

  // Shared color objects
  const col1 = useMemo(() => new THREE.Color(color1), [color1])
  const col2 = useMemo(() => new THREE.Color(color2), [color2])

  // ── Per-frame animation ────────────────────────────
  useFrame((state, delta) => {
    const frame = getFrame()
    const s = smoothed.current
    const lerpSpeed = 8 * delta

    // Smooth audio values
    s.bass   = THREE.MathUtils.lerp(s.bass,   frame.bass,   lerpSpeed)
    s.mid    = THREE.MathUtils.lerp(s.mid,    frame.mid,    lerpSpeed)
    s.high   = THREE.MathUtils.lerp(s.high,   frame.high,   lerpSpeed)
    s.volume = THREE.MathUtils.lerp(s.volume, frame.volume, lerpSpeed)
    s.beat   = THREE.MathUtils.lerp(s.beat,   frame.isBeat ? 1 : 0, lerpSpeed * 0.6)

    if (!meshRef.current) return

    // ── Rotation ──
    const spinBoost = audioSpin && frame.isBeat ? 3 : 1
    meshRef.current.rotation.x += rotationSpeedX * delta * spinBoost
    meshRef.current.rotation.y += rotationSpeedY * delta * spinBoost
    meshRef.current.rotation.z += rotationSpeedZ * delta * spinBoost

    // ── Scale (breathing with bass) ──
    const breathe = 1 + s.bass * displacement * 0.3
    meshRef.current.scale.setScalar(breathe)

    // ── Vertex displacement ──
    const geo = meshRef.current.geometry
    if (geo && geo.attributes.position && geo._originalPositions) {
      const positions = geo.attributes.position.array
      const originals = geo._originalPositions
      const count     = positions.length

      for (let i = 0; i < count; i += 3) {
        const ox = originals[i]
        const oy = originals[i + 1]
        const oz = originals[i + 2]
        const len = Math.sqrt(ox * ox + oy * oy + oz * oz)
        if (len === 0) continue

        // Direction normal
        const nx = ox / len
        const ny = oy / len
        const nz = oz / len

        // Displacement based on vertex position + time for wave effect
        const wave = Math.sin(state.clock.elapsedTime * 2 + len * 4) * 0.5 + 0.5
        const disp = s.bass * displacement * 0.15 * wave
        const explode = explodeOnBeat ? s.beat * 0.4 : 0

        positions[i]     = ox + nx * (disp + explode)
        positions[i + 1] = oy + ny * (disp + explode)
        positions[i + 2] = oz + nz * (disp + explode)
      }
      geo.attributes.position.needsUpdate = true
      geo.computeVertexNormals()
    }

    // ── Wireframe edge glow ──
    if (wireframeRef.current) {
      wireframeRef.current.rotation.copy(meshRef.current.rotation)
      wireframeRef.current.scale.copy(meshRef.current.scale)
      const edgeBrightness = 0.3 + s.high * edgeGlow
      wireframeRef.current.material.opacity = Math.min(1, edgeBrightness)

      // Color shift: blend between color1 and color2 based on mid energy
      const blendedColor = col1.clone().lerp(col2, s.mid)
      wireframeRef.current.material.color.copy(blendedColor)
    }

    // ── Inner glow sphere ──
    if (glowRef.current) {
      const glowScale = breathe * 0.92
      glowRef.current.scale.setScalar(glowScale)
      glowRef.current.rotation.copy(meshRef.current.rotation)
      glowRef.current.material.emissiveIntensity = 0.5 + s.volume * 2
    }
  })

  // ── Store original positions once geometry is attached ──
  const onGeometryAttach = (geo) => {
    if (geo && !geo._originalPositions) {
      geo._originalPositions = new Float32Array(geo.attributes.position.array)
    }
  }

  const isWireframeMat = material === 'wireframe'

  return (
    <group>
      {/* ── Main mesh ── */}
      <mesh ref={meshRef}>
        <primitive object={geometry.clone()} attach="geometry" ref={onGeometryAttach} />
        {isWireframeMat ? (
          <meshStandardMaterial
            color={color1}
            wireframe
            transparent
            opacity={0.4}
            emissive={color1}
            emissiveIntensity={0.3}
          />
        ) : material === 'glass' ? (
          <MeshTransmissionMaterial
            color={color1}
            thickness={0.5}
            roughness={0.1}
            transmission={0.95}
            ior={1.5}
            chromaticAberration={0.06}
            anisotropy={0.3}
            distortion={0.2}
            temporalDistortion={0.1}
          />
        ) : material === 'chrome' ? (
          <meshStandardMaterial
            color={color1}
            metalness={1}
            roughness={0.05}
            envMapIntensity={2}
          />
        ) : material === 'holographic' ? (
          <meshPhysicalMaterial
            color={color1}
            metalness={0.8}
            roughness={0.15}
            iridescence={iridescence}
            iridescenceIOR={1.3}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive={color2}
            emissiveIntensity={0.2}
          />
        ) : (
          /* emissive */
          <meshStandardMaterial
            color={color1}
            emissive={color1}
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        )}
      </mesh>

      {/* ── Wireframe overlay (edge glow) ── */}
      <lineSegments ref={wireframeRef}>
        <primitive object={wireGeo} attach="geometry" />
        <lineBasicMaterial
          color={color2}
          transparent
          opacity={0.6}
          toneMapped={false}
          linewidth={1}
        />
      </lineSegments>

      {/* ── Inner glow sphere ── */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial
          color={color1}
          emissive={color1}
          emissiveIntensity={0.5}
          transparent
          opacity={0.08}
          toneMapped={false}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}
