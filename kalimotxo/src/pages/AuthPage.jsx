import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import FormField from '../components/FormField'
import Button from '../components/Button'
import styles from './AuthPage.module.css'

export default function AuthPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const isLogin = tab === 'login'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/workspace')
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccessMsg(
          'Account created! Check your email to confirm, then log in. ' +
          '(Tip: if you turned off email confirmation in Supabase, you can log in now.)'
        )
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const switchTab = (newTab) => {
    setTab(newTab)
    setError(null)
    setSuccessMsg(null)
  }

  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.card}>
        {/* Wordmark */}
        <div className={styles.cardHeader}>
          <span className={styles.wordmark} aria-label="Kalimotxo">
            <span className={styles.wordmarkK} aria-hidden="true">K</span>
            <span aria-hidden="true">alimotxo</span>
          </span>
          <p className={styles.cardTagline}>Your live visualizer</p>
        </div>

        {/* Tab switcher */}
        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Sign in or create an account"
        >
          <button
            role="tab"
            id="tab-login"
            aria-selected={isLogin}
            aria-controls="tabpanel-auth"
            className={`${styles.tab} ${isLogin ? styles.tabActive : ''}`}
            onClick={() => switchTab('login')}
          >
            Log in
          </button>
          <button
            role="tab"
            id="tab-signup"
            aria-selected={!isLogin}
            aria-controls="tabpanel-auth"
            className={`${styles.tab} ${!isLogin ? styles.tabActive : ''}`}
            onClick={() => switchTab('signup')}
          >
            Sign up
          </button>
        </div>

        {/* Form panel */}
        <div
          id="tabpanel-auth"
          role="tabpanel"
          aria-labelledby={isLogin ? 'tab-login' : 'tab-signup'}
          className={styles.panel}
        >
          <form
            onSubmit={handleSubmit}
            className={styles.form}
            noValidate
            aria-label={isLogin ? 'Log in to Kalimotxo' : 'Create a Kalimotxo account'}
          >
            <FormField
              label="Email address"
              type="email"
              autoComplete={isLogin ? 'username' : 'email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />

            <FormField
              label="Password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={isLogin ? 'Your password' : 'Choose a strong password'}
              hint={!isLogin ? 'Use at least 8 characters.' : undefined}
            />

            {/* Error message */}
            {error && (
              <div role="alert" className={styles.errorMsg}>
                {error}
              </div>
            )}

            {/* Success message */}
            {successMsg && (
              <div role="status" className={styles.successMsg}>
                {successMsg}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              disabled={loading}
              aria-busy={loading}
            >
              {loading
                ? 'Please wait…'
                : isLogin
                ? 'Log in to workspace'
                : 'Create free account'}
            </Button>
          </form>
        </div>

        <p className={styles.footerNote}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            className={styles.switchLink}
            onClick={() => switchTab(isLogin ? 'signup' : 'login')}
          >
            {isLogin ? 'Sign up free' : 'Log in'}
          </button>
        </p>
      </div>
    </main>
  )
}
