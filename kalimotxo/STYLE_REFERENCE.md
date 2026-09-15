# Kalimotxo — Frontend Style Reference

> This file is the **authoritative style and component guide** for this project. When building new pages, features, or components, consult this document first. It prevents design drift and keeps the codebase consistent.

---

## Design Principles

| Principle | Description |
|---|---|
| **Dark-first** | Everything is designed for dark backgrounds. Never use light backgrounds. |
| **Intentional** | Every color, shadow, and transition has a purpose. No decorative noise. |
| **Rave + precision** | The brand is fun and high-energy, but the UI is calm and readable. Neon accents on deep dark bases. |
| **Accessible by default** | WCAG 2.2 AA is the floor, not the goal. Every interactive element must work via keyboard. |
| **Token-driven** | Never write a raw hex, pixel value, or opacity directly. Use `var(--token-name)`. |

---

## File Structure

```
src/
  App.jsx                   ← Root routing, auth state, global layout
  App.css                   ← App-level styles only (loading screen)
  index.css                 ← Imports tokens + global in correct order
  main.jsx                  ← React entry point
  supabaseClient.js         ← Supabase singleton

  styles/
    tokens.css              ← 🟣 ALL design tokens (colors, spacing, type, shadows)
    global.css              ← CSS reset, base element styles, skip link, sr-only
    Button.css              ← Global button classes (non-module — imported once)

  components/
    SkipLink.jsx            ← Accessibility skip nav
    Button.jsx              ← Polymorphic button component
    FormField.jsx           ← Accessible form field with label + error
    FormField.module.css
    SiteHeader.jsx          ← Sticky top nav with wordmark + auth-aware nav
    SiteHeader.module.css
    SiteFooter.jsx          ← Site-wide footer
    SiteFooter.module.css

  pages/
    LandingPage.jsx         ← Public marketing page
    LandingPage.module.css
    AuthPage.jsx            ← Login / Sign-up tabbed form
    AuthPage.module.css
    WorkspacePage.jsx       ← Protected visualizer workspace
    WorkspacePage.module.css
```

---

## Design Tokens — `src/styles/tokens.css`

Import order: `tokens.css` → `global.css`. Always import via `index.css`. Never import tokens directly in a component.

### Color Palette

#### Backgrounds (darkest → lightest)
```
--clr-bg:        #0a0a0f   ← Page background, canvas base
--clr-surface:   #13131a   ← Cards, sidebar, header, footer
--clr-surface-2: #1c1c26   ← Input fields, elevated cards
--clr-border:    #2a2a38   ← Default borders and dividers
--clr-border-2:  #3a3a50   ← Elevated/hover borders
```

#### Text
```
--clr-text-primary:   #f0f0f8   ← Headings, primary content
--clr-text-secondary: #8888a8   ← Body copy, labels
--clr-text-muted:     #55556a   ← Hints, timestamps, placeholders
```

#### Brand Colors
```
--clr-violet:       #7C3AED   ← Primary action / CTA
--clr-violet-light: #9F67FF   ← Hover state for violet
--clr-violet-dim:   rgba(124,58,237,0.15)  ← Background tint

--clr-cyan:         #00E5FF   ← Focus rings, special CTA, live indicators
--clr-cyan-dim:     rgba(0,229,255,0.12)   ← Background tint

--clr-green:        #10B981   ← Success states, live dot
--clr-green-dim:    rgba(16,185,129,0.15)

--clr-red:          #EF4444   ← Error states, danger actions
--clr-red-dim:      rgba(239,68,68,0.15)

--clr-orange:       #F59E0B   ← Warning states (use sparingly)
```

#### Shadows & Glows
```
--shadow-sm:          0 1px 3px rgba(0,0,0,0.5), ...
--shadow-md:          0 4px 12px rgba(0,0,0,0.5), ...
--shadow-lg:          0 10px 30px rgba(0,0,0,0.6), ...
--shadow-glow-violet: 0 0 24px rgba(124,58,237,0.35)
--shadow-glow-cyan:   0 0 24px rgba(0,229,255,0.25)
```

---

### Typography

#### Fonts
```
--font-heading: 'Space Grotesk', system-ui, sans-serif
--font-body:    'Inter', system-ui, sans-serif
--font-mono:    ui-monospace, 'Cascadia Code', Consolas, monospace
```
Both are loaded via Google Fonts in `tokens.css`. No additional imports needed.

#### Type Scale
```
--text-xs:   0.75rem   (12px) — hints, labels, badges, timestamps
--text-sm:   0.875rem  (14px) — body copy, nav links, button labels
--text-base: 1rem      (16px) — default body text
--text-md:   1.125rem  (18px) — sub-headings, feature descriptions
--text-lg:   1.25rem   (20px) — card titles, section sub-headings
--text-xl:   1.5rem    (24px) — sidebar section headings
--text-2xl:  1.875rem  (30px) — small page headings
--text-3xl:  2.25rem   (36px) — section headings
--text-4xl:  3rem      (48px) — page headings (desktop)
--text-5xl:  3.75rem   (60px) — hero (use clamp for responsive)
```

**Responsive hero pattern** (always prefer `clamp` over fixed sizes for headings):
```css
font-size: clamp(2rem, 5vw, 3.75rem);
```

---

### Spacing

Use these tokens for all padding, margin, and gap values:
```
--sp-1:  4px    --sp-2:  8px    --sp-3:  12px   --sp-4:  16px
--sp-5:  20px   --sp-6:  24px   --sp-8:  32px   --sp-10: 40px
--sp-12: 48px   --sp-16: 64px   --sp-20: 80px   --sp-24: 96px
```

---

### Border Radius
```
--radius-sm:   4px
--radius-md:   8px    ← buttons, inputs, most UI elements
--radius-lg:   12px   ← cards, larger containers
--radius-xl:   16px   ← modals, large cards
--radius-full: 9999px ← pills, badges, dots
```

### Transitions
```
--transition-fast:   150ms cubic-bezier(0.4,0,0.2,1)  ← hovers, focus
--transition-normal: 250ms cubic-bezier(0.4,0,0.2,1)  ← panel transitions
--transition-slow:   400ms cubic-bezier(0.4,0,0.2,1)  ← page-level
```
All transitions are automatically set to `0ms` when `prefers-reduced-motion: reduce` is active.

### Layout
```
--container-max:  1200px   ← max page content width
--sidebar-width:  280px    ← workspace sidebar
--header-height:  64px     ← sticky header height
```

### Z-Index Scale
```
--z-base:    1
--z-overlay: 10   ← sticky header, sidebar
--z-modal:   100  ← dialogs
--z-toast:   200  ← notifications, skip link
```

---

## Component Patterns

### `<Button>` Component

**Import:** `import Button from '../components/Button'`

```jsx
// Variants
<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">Dismiss</Button>
<Button variant="danger">Delete</Button>
<Button variant="success">Confirm</Button>
<Button variant="cyan">Capture Audio</Button>

// Sizes
<Button size="sm">Small</Button>
<Button>Default</Button>
<Button size="lg">Large</Button>

// Full-width
<Button fullWidth>Submit</Button>

// Icon-only — always provide aria-label
<Button variant="ghost" className="btn-icon" aria-label="Delete preset">
  <Trash2 size={16} aria-hidden="true" />
</Button>
```

**Do NOT render `<Button as="a">` for internal routes.** Use `<Link>` with button CSS classes instead:
```jsx
// ✅ Correct — internal navigation
<Link to="/auth" className={styles.heroCta}>Get started</Link>

// ❌ Wrong — causes full page reload
<Button as="a" href="/kalimotxo/auth">Get started</Button>
```

---

### `<FormField>` Component

**Import:** `import FormField from '../components/FormField'`

```jsx
<FormField
  label="Email address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  placeholder="you@example.com"
  hint="We'll never share your email."
  error={errors.email}   // string | null
/>
```

- The `id` is generated automatically via `useId()` — never pass one manually.
- The `error` prop triggers `role="alert"`, `aria-invalid`, and red border styling.
- Always provide a `label` — never rely on `placeholder` as the label.

---

### Form Layout Pattern

```jsx
<form onSubmit={handleSubmit} noValidate aria-label="Form purpose">
  <FormField label="…" type="email" … />
  <FormField label="…" type="password" … />

  {error && (
    <div role="alert" className={styles.errorMsg}>{error}</div>
  )}
  {successMsg && (
    <div role="status" className={styles.successMsg}>{successMsg}</div>
  )}

  <Button type="submit" variant="primary" fullWidth disabled={loading} aria-busy={loading}>
    {loading ? 'Please wait…' : 'Submit'}
  </Button>
</form>
```

---

### Page Layout Pattern

Every page should follow this structure for landmark compliance:

```jsx
// Public page (wrapped in App.jsx with SiteHeader + SiteFooter)
<main id="main-content">
  <section aria-labelledby="section-heading">
    <h1 id="section-heading">…</h1>
    {/* content */}
  </section>
</main>

// Protected workspace page (renders its own main internally)
<main id="main-content" aria-label="…">
  {/* content */}
</main>
```

---

### Status / Feedback Messages

For inline status messages, always use `role="alert"` for errors and `role="status"` for success:

```jsx
{error && (
  <div role="alert" className={styles.errorMsg}>{error}</div>
)}
{success && (
  <div role="status" aria-live="polite" className={styles.successMsg}>{success}</div>
)}
```

CSS classes from any `*.module.css`:
```css
.errorMsg {
  padding: var(--sp-3) var(--sp-4);
  background: var(--clr-red-dim);
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: var(--radius-md);
  color: var(--clr-red);
  font-size: var(--text-sm);
}
.successMsg {
  padding: var(--sp-3) var(--sp-4);
  background: var(--clr-green-dim);
  border: 1px solid rgba(16,185,129,0.3);
  border-radius: var(--radius-md);
  color: var(--clr-green);
  font-size: var(--text-sm);
}
```

---

### Section Structure Pattern

```jsx
<section className={styles.mySection} aria-labelledby="section-id">
  <div className={styles.container}>
    <h2 id="section-id" className={styles.sectionHeading}>Heading</h2>
    <p className={styles.sectionSub}>Supporting text</p>
    {/* content */}
  </div>
</section>
```

```css
.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--sp-6);
  width: 100%;
}
.mySection {
  padding: var(--sp-24) 0;
  border-top: 1px solid var(--clr-border);
}
.sectionHeading {
  text-align: center;
  margin-bottom: var(--sp-4);
}
.sectionSub {
  text-align: center;
  color: var(--clr-text-secondary);
  font-size: var(--text-md);
  max-width: 52ch;
  margin: 0 auto;
}
```

---

### Card Pattern

```css
.card {
  background: var(--clr-surface-2);
  border: 1px solid var(--clr-border);
  border-radius: var(--radius-xl);
  padding: var(--sp-8);
  transition: border-color var(--transition-normal), box-shadow var(--transition-normal), transform var(--transition-normal);
}
.card:hover {
  border-color: var(--clr-violet);
  box-shadow: 0 0 24px rgba(124,58,237,0.12);
  transform: translateY(-2px);
}
```

---

### Background Glow / Gradient Pattern

Used in hero, CTA sections, and auth page for depth:

```css
.glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 50% at 20% 50%, rgba(124,58,237,0.18) 0%, transparent 70%),
    radial-gradient(ellipse 40% 40% at 80% 30%, rgba(0,229,255,0.1) 0%, transparent 70%);
  pointer-events: none;
  /* Always add aria-hidden="true" to the DOM element */
}
```

---

### Badge / Pill Pattern

```jsx
<span className={styles.badge}>Free to use</span>
```
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--sp-1) var(--sp-3);
  background: var(--clr-violet-dim);
  border: 1px solid rgba(124,58,237,0.3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--clr-violet-light);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
```

---

### Live Indicator / Pulse Dot

```jsx
<span className={styles.liveDot} aria-hidden="true" />
```
```css
.liveDot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--clr-green);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
  50%       { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
}
```

---

## Accessibility Checklist

Every new page or component **must** satisfy these before merging:

- [ ] **Skip link** — present at top of `<body>` (handled by `<SkipLink />` in `App.jsx`)
- [ ] **One `<h1>`** — per route, clearly describes the page
- [ ] **Semantic landmarks** — `header`, `nav`, `main`, `aside`, `footer` in correct positions
- [ ] **Heading hierarchy** — h1 → h2 → h3, no skips
- [ ] **Focus visible** — all interactive elements have `:focus-visible` outlines using `--clr-cyan`
- [ ] **Labels** — every form input has a persistent `<label>` (use `<FormField>`)
- [ ] **ARIA roles** — `role="alert"` for errors, `role="status"` for success messages
- [ ] **Icon buttons** — always have `aria-label` or `<span class="sr-only">` text
- [ ] **Decorative elements** — `aria-hidden="true"` on SVGs, glows, and icons used as decoration
- [ ] **Touch targets** — minimum 44×44px for all interactive elements
- [ ] **Color contrast** — text must meet 4.5:1 (normal) or 3:1 (large) ratio
- [ ] **No color-only meaning** — errors shown with icon + color + text, not just color
- [ ] **Reduced motion** — all animations respect `prefers-reduced-motion` (handled globally)
- [ ] **No keyboard traps** — modals and dialogs must have Escape-to-close

---

## Routing

| Route | Component | Auth | Layout |
|---|---|---|---|
| `/` | `LandingPage` | Public — redirects to `/workspace` if logged in | SiteHeader + SiteFooter |
| `/auth` | `AuthPage` | Public — redirects to `/workspace` if logged in | SiteHeader only |
| `/workspace` | `WorkspacePage` | Protected — redirects to `/auth` if logged out | SiteHeader only |

**Always use React Router `<Link to="…">` for internal links.** Never use `<a href="/kalimotxo/…">` for routes.

---

## Supabase Integration

**Client:** `import { supabase } from '../supabaseClient'`

### Auth
```js
// Sign in
const { error } = await supabase.auth.signInWithPassword({ email, password })

// Sign up
const { error } = await supabase.auth.signUp({ email, password })

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

### Database
All tables are protected by Row Level Security (RLS). Users can only read/write their own data.

**`kalimotxo_visuals`** — user visual presets:
```
id          UUID (pk)
user_id     UUID → auth.users
name        TEXT
settings    JSONB  { color: string, sensitivity: number, mode: string }
created_at  TIMESTAMPTZ
```

```js
// Load presets
const { data } = await supabase
  .from('kalimotxo_visuals')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// Save preset
const { error } = await supabase
  .from('kalimotxo_visuals')
  .insert([{ user_id, name, settings }])

// Delete preset
await supabase.from('kalimotxo_visuals').delete().eq('id', id)
```

---

## Audio Architecture

The visualizer uses the Web Audio API with `getDisplayMedia` for system audio capture.

```
getDisplayMedia({ audio: true, video: true })
  → stop video tracks (only need audio)
  → AudioContext
  → AnalyserNode (fftSize: 1024, smoothingTimeConstant: 0.8)
  → MediaStreamSource → Analyser
  → requestAnimationFrame loop
    → getByteFrequencyData(Uint8Array)
    → canvas fillRect (frequency bars)
```

Settings shape:
```js
const settings = {
  color:       '#7C3AED',  // hex string — base color for spectrum shift
  sensitivity: 1.5,        // float 0.2–3.0 — bar height multiplier
  mode:        'bars',     // string — future: 'wave', 'circle'
}
```

**The draw loop reads from `settingsRef.current`** (not `settings` state) to avoid stale closures without restarting the loop.

---

## Environment Variables

Located in `/kalimotxo/.env`:
```
VITE_SUPABASE_URL=https://…supabase.co
VITE_SUPABASE_ANON_KEY=eyJ…
```

**All `VITE_` variables are injected at build time.** After changing `.env`, run `npm run build`.

---

## Build & Deploy

```bash
cd /Users/philybarrolaza/antigravity/resume/kalimotxo
npm run build       # compile to /dist
cd ..
npm start           # serve at http://localhost:3000/kalimotxo
```

The Express server at `/server.js` serves the built `/kalimotxo/dist` directory under the `/kalimotxo` route.

---

## Anti-Patterns to Avoid

| ❌ Don't | ✅ Do instead |
|---|---|
| Inline `style={{}}` in JSX | Use CSS module classes |
| Raw hex colors in CSS | Use `var(--clr-*)` tokens |
| Raw pixel values | Use `var(--sp-*)` spacing tokens |
| `<a href="/kalimotxo/route">` for internal nav | `<Link to="/route">` |
| `<Button as="a" href="/kalimotxo/…">` | `<Link to="…" className={styles.ctaClass}>` |
| `:focus { outline: none }` | Never remove focus outlines |
| `aria-label` on decorative elements | `aria-hidden="true"` |
| Labels only as `placeholder` text | Persistent `<label>` via `<FormField>` |
| Importing tokens in individual components | Use `index.css` import chain |
| Z-index magic numbers | Use `var(--z-*)` tokens |
