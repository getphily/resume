/**
 * CategoryPicker.jsx — Horizontal icon tabs for the 5 visualizer categories.
 */

import { Hexagon, Sparkles, Mountain, Circle, Cloud } from 'lucide-react'
import styles from './CategoryPicker.module.css'

const CATEGORIES = [
  { id: 'geometry', label: 'Geometry',  icon: Hexagon,   enabled: true },
  { id: 'particles', label: 'Particles', icon: Sparkles,  enabled: true },
  { id: 'wavescape', label: 'Wavescape', icon: Mountain,  enabled: true },
  { id: 'tunnel',    label: 'Tunnel',    icon: Circle,    enabled: true },
  { id: 'nebula',    label: 'Nebula',    icon: Cloud,     enabled: true },
]

export default function CategoryPicker({ active, onChange }) {
  return (
    <div className={styles.picker} role="tablist" aria-label="Visualizer category">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          role="tab"
          aria-selected={active === cat.id}
          aria-disabled={!cat.enabled}
          disabled={!cat.enabled}
          className={`${styles.tab} ${active === cat.id ? styles.tabActive : ''}`}
          onClick={() => cat.enabled && onChange(cat.id)}
          title={cat.enabled ? cat.label : `${cat.label} (coming soon)`}
        >
          <cat.icon size={18} aria-hidden="true" />
          <span className={styles.tabLabel}>{cat.label}</span>
        </button>
      ))}
    </div>
  )
}
