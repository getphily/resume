import { AudioProvider, useAudioData } from '../engine/AudioProvider'
import { VisualSettingsProvider } from '../engine/VisualSettingsContext'
import VisualizerCanvas from '../engine/VisualizerCanvas'
import Button from '../components/Button'

function LiveCanvas() {
  const { isListening, start } = useAudioData()

  // Fullscreen blank canvas shell
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', color: 'var(--clr-text-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {!isListening ? (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>Ready for Audio</h2>
          <Button onClick={start}>Start Audio Capture</Button>
        </div>
      ) : (
        <div style={{ width: '100%', height: '100%' }}>
          <VisualizerCanvas />
        </div>
      )}
    </div>
  )
}

export default function LivePage() {
  return (
    <AudioProvider>
      <VisualSettingsProvider>
        <LiveCanvas />
      </VisualSettingsProvider>
    </AudioProvider>
  )
}
