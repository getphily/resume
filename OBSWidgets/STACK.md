# Technology Stack — getphily's code stand (`code.getphily.io`)

This document outlines the architecture, frameworks, libraries, deployment infrastructure, and design systems powering **getphily's code stand** (`code.getphily.io`) and its sub-toolsets.

---

## 1. Core Framework & Runtime

- **Next.js**: `16.3.8` (App Router)
  - Static Site Generation (SSG) via `output: 'export'` with `trailingSlash: true`.
  - Webpack build pipeline (`next build --webpack`).
  - Base path configurability via `process.env.NEXT_PUBLIC_BASE_PATH` (defaults to root `""` on `code.getphily.io`).
- **React**: `19.2.8` & **React DOM**: `19.2.8`
- **TypeScript**: `5.x`
- **Node.js**: `v20+` LTS compatible.

---

## 2. Styling, Design Systems & Theming

- **Tailwind CSS**: `v4.3.3` with `@tailwindcss/postcss` and `tw-animate-css`.
- **Component Primitives**: Radix UI primitives (`@radix-ui/react-dropdown-menu`, `@radix-ui/react-popover`, `@radix-ui/react-toolbar`, `@radix-ui/react-icons`, `radix-ui`).
- **UI Block Library**: [Shadcnblocks](https://www.shadcnblocks.com) (`Hero1`, `Login2`, `Feature43`, `Footer2`, `Navbar1`).
- **Class Utilities**: `clsx`, `tailwind-merge`, and `class-variance-authority` (`cva`).
- **Icons**: `lucide-react` (`v1.49.0`).
- **Theming Engine**: Dynamic CSS variable mapping (`data-theme` attribute on `<html>` persisted in `localStorage` and Supabase user profiles):
  1. `modern-minimal` (Default: High-contrast, stripped-back content-first UI)
  2. `autoblog` (Warm orange publishing aesthetic)
  3. `alpine` (Cobalt structure, coral accent, warm canvas)
  4. `light-green` (High-contrast neon green with deep slate typography)
  5. `dark` (Chassis black and module grey)
  6. `light` (Clean off-white canvas)

---

## 3. Backend, Database & Authentication

- **BaaS Platform**: [Supabase](https://supabase.com)
  - Client: `@supabase/supabase-js` (`v2.117.2`).
  - **Authentication**:
    - Google OAuth (`provider: 'google'`) with dedicated redirect callback handler at `/auth/callback`.
    - Email & Password authentication with verification flows.
    - Session tracking with `onAuthStateChange`.
  - **Database (PostgreSQL)**:
    - `widget_configs`: User saved widgets, JSON configuration payloads, widget types (`crawl`, `clock`, `timer`, `screen`), and drag-and-drop sort order.
    - `profiles`: User account preferences and selected theme persistence.
  - **Row Level Security (RLS)**: Enforced per `auth.uid() = user_id`.

---

## 4. State Management, Drag & Drop, and Notifications

- **Drag and Drop**:
  - `@dnd-kit/core` (`v6.3.1`), `@dnd-kit/sortable` (`v10.0.0`), `@dnd-kit/utilities` (`v3.2.2`).
  - Pointer + keyboard sensor support for re-ordering stream overlays in `/dashboard`.
- **User Notifications & Dialogs**:
  - `react-hot-toast` (`v2.6.1`).
  - **Policy**: NEVER use native browser dialogs (`alert()`, `confirm()`, `prompt()`). All notifications and confirmation modals are rendered via custom React components inside toast positioned at `top-center`.

---

## 5. Broadcast & Specialized Graphics Engines

- **OBS Browser Source Engine**:
  - Zero-latency embed endpoints (`/embed/chyron`, `/embed/clock`, `/embed/timer`, `/embed/screen`).
  - Pure transparent background rendering (`allowTransparency`).
  - 16:9 canvas standardization (`1920 × 1080` and `1920 × 200` ticker bars).
- **Audio & 3D Graphics (Kalimotxo)**:
  - Pioneer DJ DDJ-FLX10 industrial aesthetic (Chassis Black `#111111`, Active Amber `#FF5900`, Stems Blue/Green/Red).
  - Three.js WebGL rendering canvas.
  - Web Audio API loopback with real-time frequency/waveform analysers.

---

## 6. Testing & Quality Assurance

- **End-to-End Testing**: `@playwright/test` (`v1.63.0`).
- **Automated Accessibility Testing**: `@axe-core/playwright` (`v4.13.0`) checking WCAG 2.1 AA / Section 508 contrast, semantic landmark roles, label associations, and focus targets.
- **Type Checking**: `npx tsc --noEmit`.
- **Linting**: ESLint 9 with `eslint-config-next`.

---

## 7. Hosting & Infrastructure Deployment

- **Hosting Provider**: Hostinger VPS / Cloud LiteSpeed Server (`46.202.198.21`).
- **Domain & Subdomain Routing**:
  - Domain: `getphily.io`
  - Subdomain: `code.getphily.io`
  - Document Root: `/home/u239940464/domains/getphily.io/public_html/code`
- **Web Server Configuration**:
  - LiteSpeed web server with `.htaccess` rewriting rules supporting HTML5 pushState routing and static exports.
- **Deployment Pipeline**:
  - Source Repository: `getphily/resume` (`main` branch on GitHub).
  - Build command: `npm run build` (`next build --webpack` outputting to `out/`).
  - Deployment mechanism: Secure SSH rsync to Hostinger on port `65002` using SSH key `~/.ssh/id_ed25519_podabio`.
