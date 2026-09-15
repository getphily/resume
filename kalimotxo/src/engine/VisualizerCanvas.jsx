import { useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useVisualSettings } from './VisualSettingsContext'
import SceneOne from '../scenes/SceneOne'
import SceneTwo from '../scenes/SceneTwo'
import * as THREE from 'three'

function SynthwaveCanvas() {
  const { root } = useVisualSettings()
  const sw = root.synthwave
  return (
    <Canvas
      camera={{ position: [0, 2, 30], fov: 60 }}
      gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ background: sw.backgroundColor, width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <fog attach="fog" args={[sw.backgroundColor, sw.visibility, sw.visibility + 60]} />
      <SceneOne />
      <EffectComposer disableNormalPass>
        <Bloom
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          intensity={sw.bloomIntensity * 2}
          mipmapBlur={true}
        />
      </EffectComposer>
    </Canvas>
  )
}

function CosmicOrbCanvas() {
  const containerRef = useRef(null)
  const [dims, setDims] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDims({ w: Math.round(entry.contentRect.width), h: Math.round(entry.contentRect.height) })
      }
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#020008' }}>
      {dims.w > 0 && dims.h > 0 && (
        <SceneTwo width={dims.w} height={dims.h} />
      )}
    </div>
  )
}

export default function VisualizerCanvas() {
  const { root } = useVisualSettings()

  if (root.activeScene === 'cosmicorb') {
    return <CosmicOrbCanvas />
  }

  return <SynthwaveCanvas />
}
