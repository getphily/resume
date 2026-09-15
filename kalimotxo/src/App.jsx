import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

import SkipLink      from './components/SkipLink'
import SiteHeader    from './components/SiteHeader'
import SiteFooter    from './components/SiteFooter'

import LandingPage   from './pages/LandingPage'
import AuthPage      from './pages/AuthPage'
import WorkspacePage from './pages/WorkspacePage'

import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Loading screen ──────────────────────────────
  if (loading) {
    return (
      <div className="loading">
        <div className="loadingSpinner" role="status" aria-label="Loading Kalimotxo" />
        <p className="loadingWordmark">
          <span>K</span>alimotxo
        </p>
        <p className="loadingText">Loading your workspace…</p>
      </div>
    )
  }

  // ── Routes ──────────────────────────────────────
  return (
    <BrowserRouter basename="/kalimotxo">
      <SkipLink />
      <Routes>

        {/* ── Landing — public ── */}
        <Route
          path="/"
          element={
            session
              ? <Navigate to="/workspace" replace />
              : <>
                  <SiteHeader session={session} />
                  <main id="main-content">
                    <LandingPage />
                  </main>
                  <SiteFooter />
                </>
          }
        />

        {/* ── Auth — public, redirects if already logged in ── */}
        <Route
          path="/auth"
          element={
            session
              ? <Navigate to="/workspace" replace />
              : <>
                  <SiteHeader session={session} />
                  <AuthPage />
                </>
          }
        />

        {/* ── Workspace — protected ── */}
        <Route
          path="/workspace"
          element={
            session
              ? <>
                  <SiteHeader session={session} />
                  <WorkspacePage />
                </>
              : <Navigate to="/auth" replace />
          }
        />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
