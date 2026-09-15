import styles from './Logo.module.css'

export default function Logo({ size = 'sm', className = '', showText = true }) {
  const containerClass = `${styles.logoWrapper} ${styles[`size-${size}`]} ${className}`

  return (
    <div className={containerClass} aria-label="Kalimotxo Logo">
      <div className={styles.plate} aria-hidden="true">
        {/* Screws */}
        <div className={`${styles.screw} ${styles.tl}`} />
        <div className={`${styles.screw} ${styles.tr}`} />
        <div className={`${styles.screw} ${styles.bl}`} />
        <div className={`${styles.screw} ${styles.br}`} />
        
        {/* Inner Grid Container */}
        <div className={styles.grid}>
          {/* Connectors */}
          <div className={`${styles.connectorH} ${styles.top}`} />
          <div className={`${styles.connectorH} ${styles.bottom}`} />
          <div className={`${styles.connectorV} ${styles.left}`} />
          <div className={`${styles.connectorV} ${styles.right}`} />

          {/* Top Left Pad */}
          <div className={styles.padOuter}>
            <div className={styles.padInner} />
          </div>
          
          {/* Top Right Pad (Active Blaze Orange) */}
          <div className={`${styles.padOuter} ${styles.activeOuter}`}>
            <div className={`${styles.padInner} ${styles.activeInner}`} />
          </div>
          
          {/* Bottom Left Pad */}
          <div className={styles.padOuter}>
            <div className={styles.padInner} />
          </div>
          
          {/* Bottom Right Pad */}
          <div className={styles.padOuter}>
            <div className={styles.padInner} />
          </div>
        </div>
      </div>

      {showText && (
        <div className={styles.logoCol}>
          <span className={styles.wordmark}>Kalimotxo</span>
          {size === 'lg' && <span className={styles.submark}>DJ Visualization App</span>}
        </div>
      )}
    </div>
  )
}
