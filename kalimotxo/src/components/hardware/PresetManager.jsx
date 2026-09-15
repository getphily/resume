import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { useVisualSettings } from '../../engine/VisualSettingsContext'
import HardwarePanel from './HardwarePanel'
import Button from '../Button'
import styles from './PresetManager.module.css'

export default function PresetManager({ userId }) {
  const { root, applyPreset } = useVisualSettings()
  const [presets, setPresets] = useState([])
  const [newPresetName, setNewPresetName] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchPresets = async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('kalimotxo_visuals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      
    if (data && !error) {
      setPresets(data)
    }
  }

  useEffect(() => {
    fetchPresets()
  }, [userId])

  const handleSavePreset = async () => {
    if (!newPresetName.trim() || !userId) return
    setLoading(true)
    
    // Create payload from entire root (both scene namespaces)
    const currentSettings = root
    const presetName = newPresetName.trim()
    
    const existing = presets.find(p => p.name.toLowerCase() === presetName.toLowerCase())
    
    if (existing) {
      // Overwrite existing
      const { error } = await supabase
        .from('kalimotxo_visuals')
        .update({ settings: currentSettings })
        .eq('id', existing.id)
        
      if (!error) {
        setNewPresetName('')
        await fetchPresets()
      }
    } else {
      // Create new
      const { error } = await supabase
        .from('kalimotxo_visuals')
        .insert([{ user_id: userId, name: presetName, settings: currentSettings }])
        
      if (!error) {
        setNewPresetName('')
        await fetchPresets()
      }
    }
    setLoading(false)
  }

  const handleUpdatePreset = async (id) => {
    if (!userId) return
    const currentSettings = root
    const { error } = await supabase
      .from('kalimotxo_visuals')
      .update({ settings: currentSettings })
      .eq('id', id)
      
    if (!error) {
      await fetchPresets()
    }
  }

  const handleDelete = async (id) => {
    await supabase.from('kalimotxo_visuals').delete().eq('id', id)
    await fetchPresets()
  }

  return (
    <HardwarePanel title="Presets">
      <div className={styles.saveSection}>
        <input 
          type="text" 
          placeholder="New preset name..." 
          value={newPresetName}
          onChange={(e) => setNewPresetName(e.target.value)}
          className={styles.input}
        />
        <button 
          className={styles.samplerButton} 
          onClick={handleSavePreset} 
          disabled={!newPresetName.trim() || loading}
        >
          Save
        </button>
      </div>

      <div className={styles.presetList}>
        {presets.map(preset => (
          <div key={preset.id} className={styles.presetItem}>
            <button 
              className={styles.presetLoadBtn}
              onClick={() => applyPreset(preset.settings)}
            >
              {preset.name}
            </button>
            <button 
              className={styles.presetUpdateBtn}
              onClick={() => handleUpdatePreset(preset.id)}
              title="Overwrite with current settings"
            >
              ⟳
            </button>
            <button 
              className={styles.presetDeleteBtn}
              onClick={() => handleDelete(preset.id)}
              title="Delete Preset"
            >
              ✕
            </button>
          </div>
        ))}
        {presets.length === 0 && (
          <div className={styles.emptyState}>No presets saved yet.</div>
        )}
      </div>
    </HardwarePanel>
  )
}
