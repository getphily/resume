import React from 'react';
import styles from './HardwarePanel.module.css';

export default function HardwarePanel({ title, children }) {
  return (
    <div className={styles.panel}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
