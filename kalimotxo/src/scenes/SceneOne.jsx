import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAudioData } from '../engine/AudioProvider'
import { useVisualSettings } from '../engine/VisualSettingsContext'

export default function SceneOne() {
  const { getFrame } = useAudioData()
  const { settings } = useVisualSettings()
  
  const terrainRef = useRef()
  const solidRef = useRef()
  const sunRef = useRef()
  
  // A ref to keep track of the scroll offset
  const travelDistance = useRef(0)

  // Grid color from settings
  const color = useMemo(() => new THREE.Color(settings.gridColor), [settings.gridColor])
  
  // Orb color from settings
  const secondaryColor = useMemo(() => new THREE.Color(settings.orbColor), [settings.orbColor])

  // Generate a custom LineSegments geometry for a perfect square grid
  // This avoids the diagonal lines of PlaneGeometry wireframes and texture stretching
  const { geometry, positionArray, initialPositions, solidGeometry, solidPosArray, solidInitPos } = useMemo(() => {
    const size = 120
    const divisions = 60
    const step = size / divisions
    const halfSize = size / 2

    const vertices = []

    // Horizontal lines (along X)
    for (let i = 0; i <= divisions; i++) {
      const z = -halfSize + i * step
      for (let j = 0; j < divisions; j++) {
        const x1 = -halfSize + j * step
        const x2 = -halfSize + (j + 1) * step
        vertices.push(x1, 0, z, x2, 0, z)
      }
    }

    // Vertical lines (along Z)
    for (let i = 0; i <= divisions; i++) {
      const x = -halfSize + i * step
      for (let j = 0; j < divisions; j++) {
        const z1 = -halfSize + j * step
        const z2 = -halfSize + (j + 1) * step
        vertices.push(x, 0, z1, x, 0, z2)
      }
    }

    const posArray = new Float32Array(vertices)
    const initPos = new Float32Array(vertices)
    
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    
    // Generate solid plane geometry for occlusion
    const planeGeo = new THREE.PlaneGeometry(120, 120, 60, 60)
    planeGeo.rotateX(-Math.PI / 2)
    const solidPosArray = planeGeo.attributes.position.array
    const solidInitPos = new Float32Array(solidPosArray)
    
    return { 
      geometry: geo, positionArray: posArray, initialPositions: initPos,
      solidGeometry: planeGeo, solidPosArray, solidInitPos
    }
  }, [])

  useFrame((state, delta) => {
    const audio = getFrame()
    const sens = settings.sensitivity
    
    // Calculate speed based on volume (moves faster on the beat)
    const baseSpeed = settings.speed * 0.5
    const audioSpeedBonus = (audio.volume / 255) * settings.speed * 2
    const currentSpeed = baseSpeed + audioSpeedBonus
    
    // Advance our scrolling distance (units per second)
    travelDistance.current += currentSpeed * delta * 15
    
    // ── TERRAIN UPDATES ──
    if (terrainRef.current && solidRef.current) {
      const geo = terrainRef.current.geometry
      const posArray = geo.attributes.position.array
      const initPos = initialPositions
      
      const solidGeo = solidRef.current.geometry
      const currentSolidPosArray = solidGeo.attributes.position.array
      
      const spectrum = audio.spectrum
      const spectrumLen = spectrum.length
      
      const step = 2 // size (120) / divisions (60)
      const zOffset = travelDistance.current % step

      // Helper to compute terrain height perfectly for any X and Z
      const calcHeight = (x, z) => {
        const distFromCenter = Math.abs(x)
        
        const scrollZ = z - travelDistance.current
        
        let height = Math.sin(x * 0.2 + scrollZ * 0.1) * 2
        height += Math.cos(x * 0.1 - scrollZ * 0.15) * 3
        
        const freqIndex = Math.floor(Math.abs(x * 2 + scrollZ)) % spectrumLen
        const freqValue = (spectrum[freqIndex] / 255) || 0
        
        // The road is flat near the camera, and fills in with hills in the distance.
        // roadFadeDistance controls how far back the road goes (0 to 120).
        // Front is z=60, Back is z=-60.
        const fadeEnd = 60 - settings.roadFadeDistance;
        const fadeStart = fadeEnd + 40; // Fade occurs over 40 units
        
        // z goes from 60 (near) to -60 (far horizon).
        const roadStrength = THREE.MathUtils.clamp((z - fadeEnd) / (fadeStart - fadeEnd), 0, 1)
        
        const scaleWithRoad = Math.min(Math.max(distFromCenter - 5, 0) * 0.3, 15)
        const scaleWithoutRoad = 15 // uniform hills everywhere
        
        const mountainScale = THREE.MathUtils.lerp(scaleWithoutRoad, scaleWithRoad, roadStrength)
        
        const zDepth = 25 - z 
        const flatFade = THREE.MathUtils.clamp((zDepth - settings.flatEdgeDistance) / 15, 0, 1)
        
        return Math.max(0, (height + (freqValue * 15 * sens)) * (mountainScale / 10) * flatFade)
      }

      // Update Wireframe Lines
      for (let i = 0; i < posArray.length; i += 3) {
        const x = initPos[i]
        const z = initPos[i + 2] + zOffset
        posArray[i + 2] = z
        posArray[i + 1] = calcHeight(x, z)
      }
      geo.attributes.position.needsUpdate = true
      
      // Update Solid Plane Occluder
      for (let i = 0; i < currentSolidPosArray.length; i += 3) {
        const x = solidInitPos[i]
        const z = solidInitPos[i + 2] + zOffset
        currentSolidPosArray[i + 2] = z
        currentSolidPosArray[i + 1] = calcHeight(x, z)
      }
      solidGeo.attributes.position.needsUpdate = true
    }
    
    // ── SUN UPDATES ──
    if (sunRef.current) {
      // Pulse the sun on the beat or bass
      const bass = (audio.bass / 255) * sens
      const targetScale = 1 + bass * 0.2
      sunRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.1)
      
      // Flash intensity
      const targetEmissive = 1 + bass + (audio.isBeat ? 1 : 0)
      sunRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
        sunRef.current.material.emissiveIntensity,
        targetEmissive,
        0.1
      )
    }
  })

  return (
    <group>
      {/* Distant Sun */}
      <mesh ref={sunRef} position={[0, 8, -50]}>
        <circleGeometry args={[15, 64]} />
        <meshBasicMaterial color={secondaryColor} fog={false} />
      </mesh>
      
      {/* Sun Glow/Emissive shell for Bloom */}
      <mesh position={[0, 8, -50.1]}>
        <circleGeometry args={[16, 64]} />
        <meshStandardMaterial 
          color={secondaryColor} 
          emissive={secondaryColor}
          emissiveIntensity={2}
          transparent
          opacity={0.5}
          fog={false}
        />
      </mesh>

      {/* Custom LineSegments Terrain */}
      <lineSegments ref={terrainRef} position={[0, -5, 0]}>
        <primitive object={geometry} attach="geometry" />
        <lineBasicMaterial 
          color={color}
          transparent={true}
          opacity={0.8}
        />
      </lineSegments>
      {/* Solid occlusion terrain to hide the sun behind mountains */}
      <mesh ref={solidRef} position={[0, -5, 0]}>
        <primitive object={solidGeometry} attach="geometry" />
        <meshBasicMaterial 
          color={settings.gridFillColor} 
          polygonOffset={true}
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>
      
      {/* Base Ground plane to catch anything below everything */}
      <mesh position={[0, -5.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshBasicMaterial color={settings.backgroundColor} />
      </mesh>
    </group>
  )
}
