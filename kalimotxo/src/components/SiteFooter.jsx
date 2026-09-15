import styles from './SiteFooter.module.css'

export default function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <p className={styles.copy}>
          &copy; {year} Kalimotxo. All rights reserved.
        </p>
        <p className={styles.tagline}>
          Made for the decks. Built for the vibe.
        </p>
      </div>
    </footer>
  )
}
