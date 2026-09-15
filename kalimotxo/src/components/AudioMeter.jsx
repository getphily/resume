/**
 * AudioMeter.jsx — Live visual feedback of bass, mid, and high energies.
 */

import React, { useRef, useEffect } from 'react'
import { useAudioData } from '../engine/AudioProvider'
import styles from './AudioMeter.module.css'
import { Mic, Activity } from 'lucide-react'

export default function AudioMeter() {
  const { isListening, start, stop, getFrame } = useAudioData()
  
  const bassRef = useRef(null)
  const midRef = useRef(null)
  const highRef = useRef(null)
  const beatRef = useRef(null)
  const reqRef = useRef(null)

  useEffect(() => {
    const loop = () => {
      if (isListening) {
        const frame = getFrame()
        
        if (bassRef.current) bassRef.current.style.transform = `scaleX(${frame.bass})`
        if (midRef.current)  midRef.current.style.transform  = `scaleX(${frame.mid})`
        if (highRef.current) highRef.current.style.transform = `scaleX(${frame.high})`
        
        if (beatRef.current) {
          if (frame.isBeat) {
            beatRef.current.classList.add(styles.beatActive)
          } else {
            beatRef.current.classList.remove(styles.beatActive)
          }
        }
      } else {
        if (bassRef.current) bassRef.current.style.transform = `scaleX(0)`
        if (midRef.current)  midRef.current.style.transform  = `scaleX(0)`
        if (highRef.current) highRef.current.style.transform = `scaleX(0)`
        if (beatRef.current) beatRef.current.classList.remove(styles.beatActive)
      }
      reqRef.current = requestAnimationFrame(loop)
    }

    reqRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(reqRef.current)
  }, [isListening, getFrame])

  return (
    <div className={styles.container}>
      <button 
        className={`${styles.capturePad} ${isListening ? styles.captureActive : ''}`} 
        onClick={isListening ? stop : start}
      >
        <Mic size={18} className={styles.micIcon} />
        {isListening ? 'STOP AUDIO CAPTURE' : 'AUDIO CAPTURE'}
      </button>

      <div className={styles.header}>
        <div className={styles.title}>
          <Activity size={14} className={styles.icon} />
          <span>Audio Input</span>
        </div>
        
        {isListening && (
          <div className={styles.statusGroup}>
            <div ref={beatRef} className={styles.beatIndicator} title="Beat Detected" />
          </div>
        )}
      </div>

      <div className={styles.meters}>
        <div className={styles.meterRow}>
          <span className={styles.meterLabel}>Bass</span>
          <div className={styles.meterTrack}>
            <div ref={bassRef} className={`${styles.meterFill} ${styles.fillBass}`} />
          </div>
        </div>
        
        <div className={styles.meterRow}>
          <span className={styles.meterLabel}>Mid</span>
          <div className={styles.meterTrack}>
            <div ref={midRef} className={`${styles.meterFill} ${styles.fillMid}`} />
          </div>
        </div>
        
        <div className={styles.meterRow}>
          <span className={styles.meterLabel}>High</span>
          <div className={styles.meterTrack}>
            <div ref={highRef} className={`${styles.meterFill} ${styles.fillHigh}`} />
          </div>
        </div>
      </div>
    </div>
  )
}
