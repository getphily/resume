import { useRef, useEffect } from 'react'
import { useAudioData } from '../engine/AudioProvider'
import { useVisualSettings } from '../engine/VisualSettingsContext'

// ── Helpers ──────────────────────────────────────────────────────────────────

// Smooth blob radius using sin harmonics
function blobRadius(angle, baseR, harmonics) {
  let r = baseR
  for (const h of harmonics) {
    r += h.amp * Math.sin(h.freq * angle + h.phase)
  }
  return r
}

// Draw a closed organic blob shape with glow
function drawBlob(ctx, cx, cy, baseR, harmonics, fillColor, alpha, glowColor) {
  const steps = 200
  ctx.beginPath()
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2
    const r = blobRadius(angle, baseR, harmonics)
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()

  // Glow pass
  ctx.save()
  ctx.filter = 'blur(32px)'
  ctx.globalAlpha = alpha * 0.5
  ctx.fillStyle = glowColor
  ctx.fill()
  ctx.restore()

  // Solid fill
  ctx.globalAlpha = alpha
  ctx.fillStyle = fillColor
  ctx.fill()
  ctx.globalAlpha = 1
}

// Draw a field line (smooth quadratic curve)
function drawFieldLine(ctx, pts, color, alpha, width, blur) {
  if (pts.length < 2) return
  ctx.save()
  if (blur > 0) ctx.filter = `blur(${blur}px)`
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.globalAlpha = alpha
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2
    const my = (pts[i].y + pts[i + 1].y) / 2
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my)
  }
  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
  ctx.stroke()
  ctx.restore()
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SceneTwo({ width, height }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const timeRef = useRef(0)
  const starsRef = useRef(null)
  const fieldLinesRef = useRef(null)

  const { getFrame } = useAudioData()
  const { root } = useVisualSettings()

  // Always-current settings ref — read inside rAF loop each frame
  const settingsRef = useRef(root.cosmicorb)
  settingsRef.current = root.cosmicorb

  // Init static starfield once
  useEffect(() => {
    const count = 320
    starsRef.current = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.3,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.6 + 0.2,
    }))
  }, [])

  // Init field line structural data (shape only — color comes from settings each frame)
  useEffect(() => {
    fieldLinesRef.current = [
      { sa: -0.5, sw: 2.8, amp: 0.28, phase: 0,   offsetY: (Math.random() - 0.5) * 0.15 },
      { sa:  0.2, sw: 3.1, amp: 0.22, phase: 1.2, offsetY: (Math.random() - 0.5) * 0.15 },
      { sa:  1.5, sw: 2.6, amp: 0.32, phase: 2.4, offsetY: (Math.random() - 0.5) * 0.15 },
      { sa:  2.2, sw: 2.9, amp: 0.18, phase: 0.8, offsetY: (Math.random() - 0.5) * 0.15 },
      { sa: -1.0, sw: 3.4, amp: 0.25, phase: 3.1, offsetY: (Math.random() - 0.5) * 0.15 },
      { sa:  3.5, sw: 2.5, amp: 0.20, phase: 1.7, offsetY: (Math.random() - 0.5) * 0.15 },
    ]
  }, [])

  // Main rAF render loop — runs once, reads settingsRef each frame
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const render = () => {
      // ── Read fresh settings every frame via ref ──────────────────────────
      const s = settingsRef.current ?? {}
      const sens       = s.sensitivity    ?? 1.0
      const blobMult   = s.blobReactivity ?? 1.0
      const orbScale   = s.orbSize        ?? 1.0
      const flColor1   = s.fieldLineColor1 ?? '#00FF88'
      const flColor2   = s.fieldLineColor2 ?? '#AAFF00'
      const flColor3   = s.fieldLineColor3 ?? '#00FFFF'

      // ── Audio — NOTE: AudioProvider uses mid/high (not mids/highs) ───────
      const audio = getFrame()
      const bass  = Math.min((audio.bass   / 255) * sens, 1)
      const mid   = Math.min((audio.mid    / 255) * sens, 1)
      const high  = Math.min((audio.high   / 255) * sens, 1)
      const vol   = Math.min((audio.volume / 255) * sens, 1)
      const isBeat = audio.isBeat

      timeRef.current += 0.016
      const t = timeRef.current

      const W = canvas.width
      const H = canvas.height
      const cx = W / 2
      const cy = H / 2
      const minDim = Math.min(W, H)

      // ── 1. Background ─────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H)
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.85)
      bgGrad.addColorStop(0,   'rgba(10,4,22,1)')
      bgGrad.addColorStop(0.5, 'rgba(6,2,16,1)')
      bgGrad.addColorStop(1,   'rgba(2,0,8,1)')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, W, H)

      // ── 2. Starfield ──────────────────────────────────────────────────────
      if (starsRef.current) {
        for (const star of starsRef.current) {
          const tw = 0.5 + 0.5 * Math.sin(t * star.speed + star.twinkle)
          const brightness = Math.min(0.4 + 0.6 * tw + vol * 0.4, 1)
          ctx.beginPath()
          ctx.arc(star.x * W, star.y * H, star.r * (1 + vol * 0.5), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${brightness})`
          ctx.fill()
        }
      }

      // ── 3. Organic Blobs ──────────────────────────────────────────────────
      const orbR = minDim * 0.18 * orbScale

      // Red / crimson — bass
      const redBase = minDim * (0.24 + bass * 0.12 * blobMult)
      drawBlob(ctx, cx - minDim * 0.10, cy + minDim * 0.04, redBase, [
        { freq: 3, amp: redBase * 0.18 * (1 + bass * 0.8 * blobMult), phase: t * 0.7 },
        { freq: 5, amp: redBase * 0.09 * (1 + bass * 0.4 * blobMult), phase: t * -0.5 },
        { freq: 7, amp: redBase * 0.05,                                 phase: t * 1.1  },
      ], `rgba(200,20,40,${0.65 + bass * 0.25})`, 0.8, '#ff1040')

      // Blue / cyan — mid
      const blueBase = minDim * (0.20 + mid * 0.10 * blobMult)
      drawBlob(ctx, cx + minDim * 0.12, cy + minDim * 0.02, blueBase, [
        { freq: 3, amp: blueBase * 0.16 * (1 + mid * 0.7 * blobMult), phase: t * -0.8 + 1 },
        { freq: 5, amp: blueBase * 0.08,                                phase: t * 0.6 + 2  },
        { freq: 7, amp: blueBase * 0.04,                                phase: t * -1.2     },
      ], `rgba(0,100,240,${0.60 + mid * 0.3})`, 0.8, '#0088ff')

      // Magenta / pink — high
      const pinkBase = minDim * (0.18 + high * 0.09 * blobMult)
      drawBlob(ctx, cx + minDim * 0.02, cy + minDim * 0.14, pinkBase, [
        { freq: 4, amp: pinkBase * 0.20 * (1 + high * 0.9 * blobMult), phase: t * 0.9 + 3 },
        { freq: 6, amp: pinkBase * 0.10,                                 phase: t * -0.7 + 1 },
      ], `rgba(220,0,200,${0.55 + high * 0.3})`, 0.75, '#ff00cc')

      // Purple / ambient — vol (atmosphere only)
      const purpleBase = minDim * (0.16 + vol * 0.06 * blobMult)
      drawBlob(ctx, cx - minDim * 0.04, cy - minDim * 0.12, purpleBase, [
        { freq: 3, amp: purpleBase * 0.14, phase: t * 0.4 + 2 },
        { freq: 5, amp: purpleBase * 0.07, phase: t * -0.3     },
      ], `rgba(100,0,200,${0.35 + vol * 0.15})`, 0.5, '#6600cc')

      // ── 4. Radial Sunburst Rays ───────────────────────────────────────────
      const numRays  = 72
      const rayInner = orbR * 1.05
      const rayOuter = minDim * (0.52 + bass * 0.12)
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      for (let i = 0; i < numRays; i++) {
        const angle   = (i / numRays) * Math.PI * 2
        const flicker = 0.6 + 0.4 * Math.sin(t * 2.5 + i * 0.37) + vol * 0.4
        const len     = rayOuter * flicker
        const x1 = cx + Math.cos(angle) * rayInner
        const y1 = cy + Math.sin(angle) * rayInner
        const x2 = cx + Math.cos(angle) * len
        const y2 = cy + Math.sin(angle) * len

        const grad = ctx.createLinearGradient(x1, y1, x2, y2)
        grad.addColorStop(0, `rgba(255,255,255,${0.35 * flicker})`)
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.strokeStyle = grad
        ctx.lineWidth   = i % 6 === 0 ? 2.5 : 0.8
        ctx.globalAlpha = 0.55 + vol * 0.3
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
      ctx.restore()

      // ── 5. Orbital Field Lines ────────────────────────────────────────────
      if (fieldLinesRef.current) {
        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        const R = minDim * (0.42 + vol * 0.08)

        // Colors cycle across 3 settings-driven colors (pairs: line+glow)
        const lineColors = [flColor1, flColor2, flColor3, flColor1, flColor2, flColor3]

        for (let li = 0; li < fieldLinesRef.current.length; li++) {
          const line  = fieldLinesRef.current[li]
          const color = lineColors[li % lineColors.length]
          const pts   = []
          for (let i = 0; i <= 60; i++) {
            const angle = line.sa + (i / 60) * line.sw
            const warp  = 1 + line.amp * Math.sin(angle * 2 + t * 0.4 + line.phase) + mid * 0.15
            pts.push({
              x: cx + Math.cos(angle) * R * warp,
              y: cy + Math.sin(angle) * R * warp + line.offsetY * H,
            })
          }
          drawFieldLine(ctx, pts, color, 0.75 + vol * 0.2, 1.8, 0) // crisp
          drawFieldLine(ctx, pts, color, 0.25 + vol * 0.1, 5,   4) // glow
        }
        ctx.restore()
      }

      // ── 6. Central Dark Orb ───────────────────────────────────────────────
      const pulseR = orbR * (1 + (isBeat ? 0.08 : 0) + bass * 0.06)

      // Chromatic rim glow (alternating cyan / magenta)
      for (let i = 3; i >= 0; i--) {
        const rimR     = pulseR + i * (minDim * 0.018)
        const rimAlpha = (0.35 - i * 0.07) * (1 + vol * 0.5)
        const hue      = i % 2 === 0
          ? `rgba(0,240,255,${rimAlpha})`
          : `rgba(255,0,200,${rimAlpha})`
        ctx.save()
        ctx.filter    = `blur(${i * 3 + 2}px)`
        ctx.beginPath()
        ctx.arc(cx, cy, rimR, 0, Math.PI * 2)
        ctx.strokeStyle = hue
        ctx.lineWidth   = 3 + i * 2
        ctx.stroke()
        ctx.restore()
      }

      // Hard chrome ring
      const ringGrad = ctx.createLinearGradient(cx - pulseR, cy, cx + pulseR, cy)
      ringGrad.addColorStop(0,    'rgba(0,240,255,0.9)')
      ringGrad.addColorStop(0.45, 'rgba(255,255,255,0.6)')
      ringGrad.addColorStop(0.55, 'rgba(255,255,255,0.6)')
      ringGrad.addColorStop(1,    'rgba(200,0,255,0.9)')
      ctx.beginPath()
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2)
      ctx.strokeStyle = ringGrad
      ctx.lineWidth   = 2.5
      ctx.stroke()

      // Dark interior fill
      const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR)
      orbGrad.addColorStop(0,   'rgba(6,4,18,1)')
      orbGrad.addColorStop(0.7, 'rgba(4,2,12,1)')
      orbGrad.addColorStop(1,   'rgba(2,0,8,1)')
      ctx.beginPath()
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2)
      ctx.fillStyle = orbGrad
      ctx.fill()

      // Inner starfield (clipped to orb)
      if (starsRef.current) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, pulseR - 2, 0, Math.PI * 2)
        ctx.clip()
        for (let i = 0; i < 80; i++) {
          const star = starsRef.current[i]
          const sx   = cx + (star.x - 0.5) * pulseR * 1.8
          const sy   = cy + (star.y - 0.5) * pulseR * 1.8
          if (Math.hypot(sx - cx, sy - cy) > pulseR - 3) continue
          const brightness = 0.3 + 0.7 * Math.sin(t * star.speed * 1.5 + star.twinkle)
          ctx.beginPath()
          ctx.arc(sx, sy, star.r * 0.8, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(180,210,255,${brightness * 0.7})`
          ctx.fill()
        }
        ctx.restore()
      }

      // Specular highlight
      const specR = pulseR * 0.08
      const specX = cx - pulseR * 0.3
      const specY = cy - pulseR * 0.35
      const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR)
      specGrad.addColorStop(0, 'rgba(255,255,255,0.7)')
      specGrad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.beginPath()
      ctx.arc(specX, specY, specR, 0, Math.PI * 2)
      ctx.fillStyle = specGrad
      ctx.fill()

      animRef.current = requestAnimationFrame(render)
    }

    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [getFrame]) // getFrame is stable (empty useCallback), runs once

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
