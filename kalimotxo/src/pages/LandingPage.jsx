import { Link } from 'react-router-dom'
import { Monitor, Save, Maximize, Zap, Headphones, Radio } from 'lucide-react'
import Button from '../components/Button'
import styles from './LandingPage.module.css'

const FEATURES = [
  {
    icon: <Monitor size={24} aria-hidden="true" />,
    title: 'System Audio Capture',
    description:
      'Tap directly into your system audio — no interface or microphone required. Play from Traktor, Rekordbox, Serato, or any source.',
  },
  {
    icon: <Save size={24} aria-hidden="true" />,
    title: 'Save Your Presets',
    description:
      'Name, save, and instantly recall your custom visual configurations per account. Switch looks between sets with one click.',
  },
  {
    icon: <Maximize size={24} aria-hidden="true" />,
    title: 'Presentation & OBS Mode',
    description:
      'Go fullscreen for a projector, or add Kalimotxo as a browser source in OBS for seamless livestream overlays.',
  },
]

const HOW_IT_WORKS = [
  {
    number: '01',
    icon: <Zap size={20} aria-hidden="true" />,
    title: 'Create your account',
    description: 'Sign up free. No credit card, no friction.',
  },
  {
    number: '02',
    icon: <Headphones size={20} aria-hidden="true" />,
    title: 'Capture your audio',
    description: 'Click "Capture System Audio" and share the tab or screen playing your music.',
  },
  {
    number: '03',
    icon: <Radio size={20} aria-hidden="true" />,
    title: 'Tune and project',
    description: 'Dial in your colors and sensitivity. Hit Presentation Mode and light up the room.',
  },
]

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* ── Hero ───────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}>
            <span className={styles.badge}>Free to use</span>
          </div>

          <h1 id="hero-heading" className={styles.heroHeading}>
            Your music,{' '}
            <span className={styles.heroAccent}>visualized</span>{' '}
            live.
          </h1>

          <p className={styles.heroSub}>
            Kalimotxo (kali-mo-<em>choh</em>) is the DJ visualizer built for live sets and
            streams. Capture your system audio in real time and project stunning
            reactive visuals — no audio files, no plugins.
          </p>

          <div className={styles.heroCtas}>
            <Link to="/auth" className={styles.heroCta}>
              Start visualizing free
            </Link>
            <a href="#how-it-works" className={styles.heroCtaGhost}>
              See how it works
            </a>
          </div>

          {/* Live preview badge */}
          <p className={styles.heroNote}>
            <span className={styles.liveDot} aria-hidden="true" />
            Real-time audio. No uploads required.
          </p>
        </div>

        {/* Hero canvas mock */}
        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.canvasMock}>
            <CanvasPreview />
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────── */}
      <section className={styles.features} aria-labelledby="features-heading">
        <div className={styles.container}>
          <h2 id="features-heading" className={styles.sectionHeading}>
            Everything you need on the decks
          </h2>
          <p className={styles.sectionSub}>
            Designed around your live workflow — not a studio session.
          </p>

          <ul className={styles.featureGrid} role="list">
            {FEATURES.map((f) => (
              <li key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── How It Works ───────────────────────── */}
      <section id="how-it-works" className={styles.howItWorks} aria-labelledby="hiw-heading">
        <div className={styles.container}>
          <h2 id="hiw-heading" className={styles.sectionHeading}>
            Up and running in 3 steps
          </h2>

          <ol className={styles.steps} role="list">
            {HOW_IT_WORKS.map((step) => (
              <li key={step.number} className={styles.step}>
                <div className={styles.stepNumber} aria-hidden="true">{step.number}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────── */}
      <section className={styles.ctaSection} aria-labelledby="cta-heading">
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaGlow} aria-hidden="true" />
            <h2 id="cta-heading" className={styles.ctaHeading}>
              Ready to light up the room?
            </h2>
            <p className={styles.ctaSub}>
              Free forever for solo DJs. Just sign up and go.
            </p>
            <Link to="/auth" className={styles.ctaCyanBtn}>
              Create your free account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

/* Animated SVG canvas preview — pure CSS bars */
function CanvasPreview() {
  const bars = Array.from({ length: 40 }, (_, i) => i)
  return (
    <svg
      viewBox="0 0 400 180"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={styles.svgPreview}
    >
      {bars.map((i) => {
        const x = 5 + i * 9.5
        const maxH = 20 + Math.sin(i * 0.5) * 60 + Math.random() * 40
        const hue = 200 + (i / bars.length) * 160
        return (
          <rect
            key={i}
            x={x}
            y={180 - maxH}
            width={7}
            height={maxH}
            rx={2}
            fill={`hsl(${hue}, 90%, 60%)`}
            opacity={0.85}
            className={styles.svgBar}
            style={{
              animationDelay: `${(i * 0.05).toFixed(2)}s`,
              '--bar-h': `${maxH}px`,
            }}
          />
        )
      })}
    </svg>
  )
}
