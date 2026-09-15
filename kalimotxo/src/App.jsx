import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

import SiteHeader    from './components/SiteHeader'
import SiteFooter    from './components/SiteFooter'

import LandingPage   from './pages/LandingPage'
import AuthPage      from './pages/AuthPage'
import StudioPage    from './pages/StudioPage'
import LivePage      from './pages/LivePage'

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
        <p className="loadingText">Loading your studio…</p>
      </div>
    )
  }

  // ── Routes ──────────────────────────────────────
  return (
    <BrowserRouter basename="/kalimotxo">
      <Routes>

        {/* ── Landing — public ── */}
        <Route
          path="/"
          element={
            session
              ? <Navigate to="/studio" replace />
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
              ? <Navigate to="/studio" replace />
              : <>
                  <SiteHeader session={session} />
                  <AuthPage />
                </>
          }
        />

        {/* ── Studio — protected ── */}
        <Route
          path="/studio"
          element={
            session
              ? <>
                  <SiteHeader session={session} />
                  <StudioPage />
                </>
              : <Navigate to="/auth" replace />
          }
        />

        {/* ── Live Canvas — protected ── */}
        <Route
          path="/live"
          element={
            session
              ? <LivePage />
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
