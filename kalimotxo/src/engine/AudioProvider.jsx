/**
 * AudioProvider.jsx — React context that manages audio capture and
 * provides multi-band analysis data to the entire component tree.
 *
 * Usage:
 *   <AudioProvider>
 *     <YourComponent />
 *   </AudioProvider>
 *
 *   // Inside any child:
 *   const audio = useAudioData()
 *   // audio.bass, audio.mid, audio.high, audio.volume,
 *   // audio.isBeat, audio.isKick, audio.spectrum,
 *   // audio.isListening, audio.start(), audio.stop()
 */

import { createContext, useContext, useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { analyseBands, createBeatDetector } from './audioAnalyser'

// ── Context ──────────────────────────────────────────
const AudioContext_ = createContext(null)

export function useAudioData() {
  const ctx = useContext(AudioContext_)
  if (!ctx) throw new Error('useAudioData must be used inside <AudioProvider>')
  return ctx
}

// ── Default (silent) audio frame ─────────────────────
const SILENT = Object.freeze({
  bass: 0, mid: 0, high: 0, volume: 0,
  isBeat: false, isKick: false,
  spectrum: new Uint8Array(0),
})

// ── Provider ─────────────────────────────────────────
export function AudioProvider({ children }) {
  const [isListening, setIsListening] = useState(false)
  const [error, setError]           = useState(null)

  // Mutable refs for the audio pipeline (never trigger re-renders)
  const audioCtxRef  = useRef(null)
  const analyserRef  = useRef(null)
  const sourceRef    = useRef(null)
  const dataRef      = useRef(null)   // Uint8Array for frequency data
  const frameRef     = useRef(SILENT) // Latest analysis result
  const beatRef      = useRef(createBeatDetector())

  // ── Start capture ──────────────────────────────────
  const start = useCallback(async () => {
    try {
      setError(null)

      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true,
      })

      // We only need audio — kill the video tracks immediately
      stream.getVideoTracks().forEach((t) => t.stop())

      if (stream.getAudioTracks().length === 0) {
        setError('No audio track found. Make sure "Share tab audio" is checked.')
        return
      }

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.82

      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)

      audioCtxRef.current = audioCtx
      analyserRef.current = analyser
      sourceRef.current   = source
      dataRef.current     = new Uint8Array(analyser.frequencyBinCount)
      beatRef.current     = createBeatDetector()

      // Listen for when the user ends screen-share from browser UI
      stream.getAudioTracks()[0].addEventListener('ended', () => {
        stop()
      })

      setIsListening(true)
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
        setError(`Audio error: ${err.message}`)
      }
    }
  }, [])

  // ── Stop capture ───────────────────────────────────
  const stop = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.mediaStream?.getTracks().forEach((t) => t.stop())
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close()
    }
    audioCtxRef.current = null
    analyserRef.current = null
    sourceRef.current   = null
    dataRef.current     = null
    frameRef.current    = SILENT
    setIsListening(false)
  }, [])

  // ── Cleanup on unmount ─────────────────────────────
  useEffect(() => {
    return () => stop()
  }, [stop])

  /**
   * Called from inside a useFrame / rAF loop to get the latest analysis.
   * This is intentionally NOT reactive — it reads raw refs for performance.
   */
  const getFrame = useCallback(() => {
    const analyser = analyserRef.current
    const data     = dataRef.current
    if (!analyser || !data) return frameRef.current

    analyser.getByteFrequencyData(data)
    const bands = analyseBands(data, analyser.frequencyBinCount)
    const beats = beatRef.current.detect(bands.bass, bands.volume)

    frameRef.current = {
      bass:      bands.bass,
      mid:       bands.mid,
      high:      bands.high,
      volume:    bands.volume,
      spectrum:  bands.spectrum,
      isBeat:    beats.isBeat,
      isKick:    beats.isKick,
    }

    return frameRef.current
  }, [])

  // ── Context value ──
  const contextValue = useMemo(() => ({
    isListening, 
    error,
    start, 
    stop, 
    getFrame,
    frameRef,
  }), [isListening, error, start, stop, getFrame])

  return (
    <AudioContext_.Provider value={contextValue}>
      {children}
    </AudioContext_.Provider>
  )
}
