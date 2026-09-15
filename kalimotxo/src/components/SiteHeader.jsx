import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Button from './Button'
import Logo from './Logo'
import styles from './SiteHeader.module.css'

export default function SiteHeader({ session }) {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.wordmarkLink} aria-label="Kalimotxo — Go to homepage">
          <Logo size="sm" />
        </Link>

        {/* Nav */}
        <nav className={styles.nav} aria-label="Primary navigation">
          {session ? (
            <ul className={styles.navList} role="list">
              <li>
                <Link
                  to="/workspace"
                  className={styles.hardwareBtn}
                  aria-current={location.pathname === '/workspace' ? 'page' : undefined}
                >
                  Workspace
                </Link>
              </li>
              <li>
                <button
                  className={styles.hardwareBtn}
                  onClick={handleLogout}
                  aria-label="Log out of Kalimotxo"
                >
                  Log out
                </button>
              </li>
            </ul>
          ) : (
            <ul className={styles.navList} role="list">
              {!isLanding && (
                <li>
                  <Link to="/" className={styles.hardwareBtn}>Home</Link>
                </li>
              )}
              <li>
                {/* Use Link for SPA navigation — no page reload */}
                <Link to="/auth" className={styles.ctaBtn}>
                  Get started
                </Link>
              </li>
            </ul>
          )}
        </nav>
      </div>
    </header>
  )
}
