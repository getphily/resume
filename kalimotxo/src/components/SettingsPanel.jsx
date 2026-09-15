/**
 * SettingsPanel.jsx — Dynamic controls for the active visualizer category.
 * Renders the correct set of controls based on which category is selected.
 */

import { useState, useEffect } from 'react'
import { Dices } from 'lucide-react'
import styles from './SettingsPanel.module.css'
import { EASY_PRESETS, INTERMEDIATE_MACROS } from '../engine/ModeAbstractions'

/* ── Geometry settings definition ── */
const GEOMETRY_SETTINGS = [
  {
    group: 'Shape',
    fields: [
      { key: 'shape', label: 'Shape', type: 'select', options: [
        { value: 'icosahedron', label: 'Icosahedron' },
        { value: 'torus', label: 'Torus' },
        { value: 'torusKnot', label: 'Torus Knot' },
        { value: 'octahedron', label: 'Octahedron' },
        { value: 'dodecahedron', label: 'Dodecahedron' },
        { value: 'tetrahedron', label: 'Tetrahedron' },
        { value: 'cylinder', label: 'Cylinder' },
        { value: 'cone', label: 'Cone' },
        { value: 'ring', label: 'Ring' },
      ]},
      { key: 'detail', label: 'Detail', type: 'range', min: 1, max: 5, step: 1 },
      { key: 'displacement', label: 'Vertex Displacement', type: 'range', min: 0, max: 3, step: 0.1 },
    ],
  },
  {
    group: 'Motion',
    fields: [
      { key: 'rotationSpeedX', label: 'Rotation X', type: 'range', min: 0, max: 5, step: 0.1 },
      { key: 'rotationSpeedY', label: 'Rotation Y', type: 'range', min: 0, max: 5, step: 0.1 },
      { key: 'rotationSpeedZ', label: 'Rotation Z', type: 'range', min: 0, max: 5, step: 0.1 },
      { key: 'audioSpin', label: 'Beat Spin', type: 'toggle' },
      { key: 'explodeOnBeat', label: 'Explode on Beat', type: 'toggle' },
    ],
  },
  {
    group: 'Material',
    fields: [
      { key: 'material', label: 'Surface', type: 'select', options: [
        { value: 'wireframe', label: 'Wireframe' },
        { value: 'glass', label: 'Glass' },
        { value: 'chrome', label: 'Chrome' },
        { value: 'holographic', label: 'Holographic' },
        { value: 'emissive', label: 'Emissive' },
      ]},
      { key: 'color1', label: 'Color 1', type: 'color' },
      { key: 'color2', label: 'Color 2', type: 'color' },
      { key: 'iridescence', label: 'Iridescence', type: 'range', min: 0, max: 1, step: 0.05 },
      { key: 'edgeGlow', label: 'Edge Glow', type: 'range', min: 0, max: 3, step: 0.1 },
    ],
  },
]

const PARTICLES_SETTINGS = [
  {
    group: 'Simulation',
    fields: [
      { key: 'pattern', label: 'Pattern', type: 'select', options: [
        { value: 'galaxy', label: 'Spiral Galaxy' },
        { value: 'sphere', label: 'Sphere' },
        { value: 'chaos', label: 'Chaos' },
      ]},
      { key: 'particleCount', label: 'Density', type: 'range', min: 1000, max: 20000, step: 1000 },
      { key: 'speed', label: 'Speed', type: 'range', min: 0, max: 3, step: 0.1 },
      { key: 'beatReactivity', label: 'Reactivity', type: 'range', min: 0, max: 2, step: 0.1 },
    ],
  },
  {
    group: 'Appearance',
    fields: [
      { key: 'size', label: 'Particle Size', type: 'range', min: 0.01, max: 0.2, step: 0.01 },
      { key: 'color1', label: 'Core Color', type: 'color' },
      { key: 'color2', label: 'Edge Color', type: 'color' },
    ],
  },
]

const WAVESCAPE_SETTINGS = [
  {
    group: 'Terrain',
    fields: [
      { key: 'resolution', label: 'Grid Resolution', type: 'range', min: 32, max: 128, step: 8 },
      { key: 'height', label: 'Displacement', type: 'range', min: 0.1, max: 5, step: 0.1 },
      { key: 'speed', label: 'Wave Speed', type: 'range', min: 0, max: 3, step: 0.1 },
    ],
  },
  {
    group: 'Appearance',
    fields: [
      { key: 'color1', label: 'Surface Color', type: 'color' },
      { key: 'color2', label: 'Grid Color', type: 'color' },
      { key: 'wireframe', label: 'Show Grid', type: 'toggle' },
    ],
  },
]

const TUNNEL_SETTINGS = [
  {
    group: 'Path',
    fields: [
      { key: 'speed', label: 'Flight Speed', type: 'range', min: 0, max: 5, step: 0.1 },
      { key: 'warp', label: 'Warp', type: 'range', min: 0, max: 5, step: 0.1 },
      { key: 'radius', label: 'Tunnel Radius', type: 'range', min: 1, max: 5, step: 0.1 },
    ],
  },
  {
    group: 'Appearance',
    fields: [
      { key: 'color1', label: 'Primary Color', type: 'color' },
      { key: 'color2', label: 'Secondary Color', type: 'color' },
      { key: 'wireframe', label: 'Wireframe', type: 'toggle' },
    ],
  },
]

const NEBULA_SETTINGS = [
  {
    group: 'Cloud',
    fields: [
      { key: 'density', label: 'Gas Density', type: 'range', min: 50, max: 1000, step: 50 },
      { key: 'size', label: 'Cloud Size', type: 'range', min: 1, max: 10, step: 0.1 },
      { key: 'speed', label: 'Swirl Speed', type: 'range', min: 0, max: 3, step: 0.1 },
    ],
  },
  {
    group: 'Appearance',
    fields: [
      { key: 'color1', label: 'Core Color', type: 'color' },
      { key: 'color2', label: 'Dust Color', type: 'color' },
    ],
  },
]

const SETTINGS_MAP = {
  geometry: GEOMETRY_SETTINGS,
  particles: PARTICLES_SETTINGS,
  wavescape: WAVESCAPE_SETTINGS,
  tunnel: TUNNEL_SETTINGS,
  nebula: NEBULA_SETTINGS,
}

export default function SettingsPanel({ category, settings, onChange }) {
  const [mode, setMode] = useState('advanced') // 'easy', 'intermediate', 'advanced'
  const [macroState, setMacroState] = useState({})
  
  const groups = SETTINGS_MAP[category]
  if (!groups) return null

  // Reset macros on category change
  useEffect(() => {
    setMacroState({})
  }, [category])

  const updateSetting = (key, value) => {
    onChange({ ...settings, [key]: value })
  }

  const handleRandomize = () => {
    const randomized = { ...settings }
    groups.forEach((group) => {
      group.fields.forEach((field) => {
        if (field.type === 'range') {
          const val = field.min + Math.random() * (field.max - field.min)
          // respect step
          const stepMult = 1 / field.step
          randomized[field.key] = Math.round(val * stepMult) / stepMult
        } else if (field.type === 'select') {
          const opt = field.options[Math.floor(Math.random() * field.options.length)]
          randomized[field.key] = opt.value
        } else if (field.type === 'color') {
          const hex = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
          randomized[field.key] = `#${hex}`
        } else if (field.type === 'toggle') {
          randomized[field.key] = Math.random() > 0.5
        }
      })
    })
    onChange(randomized)
  }

  return (
    <div className={styles.panel}>
      
      <div className={styles.panelHeader}>
        <div className={styles.modeSelector} role="group" aria-label="Settings complexity mode">
          {['easy', 'intermediate', 'advanced'].map(m => (
            <button
              key={m}
              className={styles.modeBtn}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              title={`${m.charAt(0).toUpperCase() + m.slice(1)} Mode`}
            >
              {m === 'advanced' ? 'Adv' : m === 'intermediate' ? 'Int' : 'Easy'}
            </button>
          ))}
        </div>
        
        <button 
          className={styles.shuffleBtn} 
          onClick={handleRandomize}
          title="Randomize settings"
          aria-label="Randomize all settings in current category"
        >
          <Dices size={14} />
        </button>
      </div>

      {mode === 'advanced' && groups.map((group) => (
        <details key={group.group} className={styles.group} open>
          <summary className={styles.groupTitle}>{group.group}</summary>
          <div className={styles.groupBody}>
            {group.fields.map((field) => (
              <div key={field.key} className={styles.field}>

                {field.type === 'range' && (
                  <>
                    <label className={styles.label} htmlFor={`setting-${field.key}`}>
                      {field.label}
                      <span className={styles.value}>
                        {Number(settings[field.key] ?? field.min).toFixed(
                          field.step < 1 ? 1 : 0
                        )}
                      </span>
                    </label>
                    <input
                      id={`setting-${field.key}`}
                      type="range"
                      className={styles.rangeInput}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={settings[field.key] ?? field.min}
                      onChange={(e) => updateSetting(field.key, parseFloat(e.target.value))}
                    />
                  </>
                )}

                {field.type === 'select' && (
                  <>
                    <label className={styles.label} htmlFor={`setting-${field.key}`}>
                      {field.label}
                    </label>
                    <select
                      id={`setting-${field.key}`}
                      className={styles.selectInput}
                      value={settings[field.key] ?? field.options[0]?.value}
                      onChange={(e) => updateSetting(field.key, e.target.value)}
                    >
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </>
                )}

                {field.type === 'color' && (
                  <>
                    <label className={styles.label} htmlFor={`setting-${field.key}`}>
                      {field.label}
                    </label>
                    <div className={styles.colorRow}>
                      <input
                        id={`setting-${field.key}`}
                        type="color"
                        className={styles.colorInput}
                        value={settings[field.key] ?? '#7C3AED'}
                        onChange={(e) => updateSetting(field.key, e.target.value)}
                      />
                      <span className={styles.colorHex}>
                        {(settings[field.key] ?? '#7C3AED').toUpperCase()}
                      </span>
                    </div>
                  </>
                )}

                {field.type === 'toggle' && (
                  <label className={styles.toggleLabel} htmlFor={`setting-${field.key}`}>
                    <span>{field.label}</span>
                    <button
                      id={`setting-${field.key}`}
                      role="switch"
                      aria-checked={!!settings[field.key]}
                      className={`${styles.toggle} ${settings[field.key] ? styles.toggleOn : ''}`}
                      onClick={() => updateSetting(field.key, !settings[field.key])}
                    >
                      <span className={styles.toggleThumb} />
                    </button>
                  </label>
                )}

              </div>
            ))}
          </div>
        </details>
      ))}
      
      {mode === 'intermediate' && (
        <div className={styles.group}>
          <div className={styles.groupBody}>
            {INTERMEDIATE_MACROS[category]?.map((macro) => (
              <div key={macro.name} className={styles.field}>
                <label className={styles.label} htmlFor={`macro-${macro.name}`}>
                  {macro.name}
                </label>
                <input
                  id={`macro-${macro.name}`}
                  type="range"
                  className={styles.rangeInput}
                  min={0}
                  max={1}
                  step={0.01}
                  value={macroState[macro.name] ?? 0.5}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    setMacroState(prev => ({ ...prev, [macro.name]: val }))
                    const newSettings = macro.update(val)
                    onChange({ ...settings, ...newSettings })
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === 'easy' && (
        <div className={styles.group}>
          <div className={styles.groupBody} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {Object.keys(EASY_PRESETS[category] || {}).map((presetName) => (
              <button
                key={presetName}
                style={{
                  padding: '12px 8px',
                  borderRadius: '8px',
                  border: '1px solid var(--clr-border)',
                  background: 'var(--clr-surface-2)',
                  color: 'var(--clr-text-primary)',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onClick={() => {
                  const preset = EASY_PRESETS[category][presetName]
                  onChange({ ...settings, ...preset })
                }}
              >
                {presetName}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
