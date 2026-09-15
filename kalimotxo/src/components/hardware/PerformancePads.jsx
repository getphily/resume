import React from 'react';
import styles from './PerformancePads.module.css';

export default function PerformancePads({ label, options, value, onChange }) {
  return (
    <div className={styles.container}>
      <span className={styles.label}>{label}</span>
      <div className={styles.padsGrid}>
        {options.map((opt, i) => {
          const isActive = value === opt.value;
          return (
            <button
              key={i}
              className={`${styles.pad} ${isActive ? styles.active : ''}`}
              style={{
                '--pad-color': opt.color || opt.value
              }}
              onClick={() => onChange(opt.value)}
              title={opt.label}
            >
              <div className={styles.padInner}></div>
            </button>
          )
        })}
      </div>
    </div>
  );
}
