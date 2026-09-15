/**
 * EffectsPanel.jsx — Controls for the global post-processing layer.
 */

import styles from './SettingsPanel.module.css' // We can reuse the same layout styles

export default function EffectsPanel({ effects, onChange }) {
  const updateEffect = (key, value) => {
    onChange({ ...effects, [key]: value })
  }

  return (
    <div className={styles.panel}>
      <details className={styles.group} open>
        <summary className={styles.groupTitle}>Post-Processing</summary>
        <div className={styles.groupBody}>
          
          <div className={styles.field}>
            <label className={styles.label} htmlFor="effect-bloom">
              Bloom Glow
              <span className={styles.value}>{Number(effects.bloom).toFixed(1)}</span>
            </label>
            <input
              id="effect-bloom"
              type="range"
              className={styles.rangeInput}
              min="0" max="3" step="0.1"
              value={effects.bloom}
              onChange={(e) => updateEffect('bloom', parseFloat(e.target.value))}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="effect-chromatic">
              Chromatic Aberration
              <span className={styles.value}>{Number(effects.chromaticAberration).toFixed(3)}</span>
            </label>
            <input
              id="effect-chromatic"
              type="range"
              className={styles.rangeInput}
              min="0" max="0.02" step="0.001"
              value={effects.chromaticAberration}
              onChange={(e) => updateEffect('chromaticAberration', parseFloat(e.target.value))}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="effect-noise">
              Film Grain
              <span className={styles.value}>{Number(effects.noise).toFixed(2)}</span>
            </label>
            <input
              id="effect-noise"
              type="range"
              className={styles.rangeInput}
              min="0" max="0.5" step="0.01"
              value={effects.noise}
              onChange={(e) => updateEffect('noise', parseFloat(e.target.value))}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="effect-vignette">
              Vignette
              <span className={styles.value}>{Number(effects.vignette).toFixed(2)}</span>
            </label>
            <input
              id="effect-vignette"
              type="range"
              className={styles.rangeInput}
              min="0" max="1" step="0.05"
              value={effects.vignette}
              onChange={(e) => updateEffect('vignette', parseFloat(e.target.value))}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.toggleLabel} htmlFor="effect-scanlines">
              <span>CRT Scanlines</span>
              <button
                id="effect-scanlines"
                role="switch"
                aria-checked={effects.scanlines}
                className={`${styles.toggle} ${effects.scanlines ? styles.toggleOn : ''}`}
                onClick={() => updateEffect('scanlines', !effects.scanlines)}
              >
                <span className={styles.toggleThumb} />
              </button>
            </label>
          </div>

          <div className={styles.divider} />

          <div className={styles.field}>
            <label className={styles.toggleLabel} htmlFor="effect-perf">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontWeight: 600 }}>Performance Mode</span>
                <span style={{ fontSize: '10px', color: 'var(--clr-text-muted)' }}>Lowers res & disables effects for old devices</span>
              </div>
              <button
                id="effect-perf"
                role="switch"
                aria-checked={effects.performanceMode}
                className={`${styles.toggle} ${effects.performanceMode ? styles.toggleOn : ''}`}
                onClick={() => updateEffect('performanceMode', !effects.performanceMode)}
              >
                <span className={styles.toggleThumb} />
              </button>
            </label>
          </div>

        </div>
      </details>
    </div>
  )
}
