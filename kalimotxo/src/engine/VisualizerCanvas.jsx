import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useVisualSettings } from './VisualSettingsContext'
import SceneOne from '../scenes/SceneOne'
import * as THREE from 'three'

export default function VisualizerCanvas() {
  const { settings } = useVisualSettings()

  return (
    <Canvas
      camera={{ position: [0, 2, 30], fov: 60 }}
      gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping }}
      style={{
        background: settings.backgroundColor,
        width: '100%',
        height: '100%'
      }}
    >
      {/* Basic Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {/* Fog to hide the grid edge */}
      <fog attach="fog" args={[settings.backgroundColor, settings.visibility, settings.visibility + 60]} />

      {/* The Active Audio-Reactive Scene */}
      <SceneOne />

      {/* Global Post-Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.1} 
          luminanceSmoothing={0.9} 
          intensity={settings.bloomIntensity * 2} // Boost baseline intensity
          mipmapBlur={true}
        />
      </EffectComposer>
    </Canvas>
  )
}
