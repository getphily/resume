import React from 'react';
import styles from './Fader.module.css';

export default function Fader({ label, min, max, step, value, onChange, readout, warning }) {
  return (
    <div className={styles.faderContainer}>
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        {readout !== undefined && <span className={styles.readout}>{readout}</span>}
      </div>
      {warning && <div className={styles.warning}>{warning}</div>}
      <div className={styles.trackWrapper}>
        {/* Upper Hash Marks */}
        <div className={styles.ticksTop}></div>
        <input 
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className={styles.rangeInput}
        />
        {/* Lower Hash Marks */}
        <div className={styles.ticksBottom}></div>
      </div>
    </div>
  );
}
