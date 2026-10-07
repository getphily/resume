# OBSWidgets UI & Layout Guidelines

## Core Layout Structure
The application must strictly follow a "Hostinger Dashboard" inspired layout architecture:
1. **Global Top Navbar**: A full-width, very dark (high contrast) navigation bar at the very top. This contains global actions, branding, and user profile/auth state.
2. **Left Sidebar(s)**: Positioned *below* the top navbar on the left. Can be single or dual-column (e.g., narrow icon sidebar + wider secondary menu). Background should match the main app background or be slightly contrasting (e.g., white if app bg is light gray).
3. **Main Content Area**: Occupies the remaining space to the right of the sidebar. Uses a very light, off-white background (`var(--bg-main)`).
4. **Cards / Panels**: Content within the main area must be contained in pure white, rounded panels with very subtle borders and soft drop shadows to separate them from the off-white background.

**Mobile**: This layout is the *desktop* expression. Below `md`, the sidebar(s) collapse into a drawer/bottom nav, panels stack in one column, and the main area uses full width with comfortable padding. See "Mobile & Responsive (CRITICAL)".

## Unified Shell Principle (CRITICAL)
- The shell for **each section or toolset** must share the exact same style, navigation, toolbars, and component styling. 
- While the *output* of these tools (e.g., a 3D WebGL canvas, audio waveforms, OBS text tickers, or document diffs) will be vastly different, the application wrappers, controls, layout structures (`layout.tsx`), and UI primitives (buttons, cards, inputs) must remain **perfectly uniform across the entire platform**.

## Styling & Contrast Rules
- **Aesthetic**: Clean, corporate, minimalist, and highly practical. Avoid heavy gradients, neon colors, or thick drop shadows.
- **Backgrounds**: 
  - Main App Background: Very light gray (e.g., `#f4f5f7`).
  - Panels/Cards: Pure white (`#ffffff`).
  - Top Navbar: Very dark navy/black (e.g., `#0f172a` or `#111111`).
- **Borders & Radiuses**: 
  - Use subtle borders (e.g., `#e2e8f0`).
  - Border radius for panels should be medium-large (e.g., `8px` or `12px`).
- **Typography**:
  - Headings: Bold, clean sans-serif (e.g., Inter). No text shadows.
  - Body: High legibility. Primary text should be very dark gray (not pure black). Secondary text should be muted gray.
- **Accents**: Use a clean, vibrant primary color (e.g., a modern blue or purple) for primary buttons, active states, and focus rings.

## Implementation Details
- The hex values above are the *Modern Minimal* defaults for reference only. In code, always use semantic theme tokens / `globals.css` CSS variables (`bg-background`, `bg-card`, `text-foreground`, `border-border`, etc.), never hard-coded hex, so all four themes work.
- Ensure all inputs and buttons have distinct hover and focus states (e.g., `focus-visible:ring-2 ring-ring` / `box-shadow: 0 0 0 2px var(--accent-primary)`). On touch, `:active` pressed feedback must exist too (hover does not).
- The "Export to OBS" or preview windows should utilize the transparent checkerboard pattern (`.preview-window-container`) to indicate transparency cleanly.
- Never use inline styles for structural colors; always map to `globals.css` CSS variables. (Inline styles are only acceptable for genuinely dynamic user-driven values such as a chosen font size or position.)

## Modals & Popups
- NEVER use native browser popups like `alert()`, `confirm()`, or `prompt()`.
- For all alerts, confirmations, and notifications, always use `react-hot-toast` (`import toast from "react-hot-toast"`).
- For complex confirmation dialogs, render a custom React component inside the toast.
- Toast notifications MUST be positioned at `top-center` (not bottom-right) so they are immediately visible and easily interactive for the user.

## Web Design UX Best Practices
- ALWAYS apply established modern web development UI/UX best practices when building new elements, layouts, features, or adding styling. 
- Ask yourself: "Is this intuitive, accessible, and standard for modern web apps?" before finalizing any layout or component.
- **Accessibility baseline**: every icon-only button has an `aria-label`; every input has a visible or `aria-label`ed label; focus is always visible; color is never the only signal; text/background contrast meets WCAG AA (4.5:1 body, 3:1 large text/UI).
- **Minimum text size**: helper/secondary text is never smaller than `text-xs` (12px). Body/control text is `text-sm` (14px) or larger.
- **States**: every async feature must show loading, empty, success and error states (errors via `react-hot-toast`).

## Mobile & Responsive (CRITICAL)
Everything we build MUST work well on mobile, not just shrink. Design **mobile-first** (base styles = phone, then `sm:`/`md:`/`lg:` to enhance) and treat a broken or cramped phone layout as a bug, same as a desktop bug.

- **Target viewports**: 360–430px phones (verify at 390px), 768px tablets, and desktop 1280px+. No horizontal page scroll at any width; only deliberate containers (tab bars, tables, tickers) may scroll sideways.
- **Layout shell on mobile**: The Hostinger-style shell adapts, it does not disappear. The top navbar stays. Left sidebar(s) collapse into a hamburger/drawer (or bottom nav) below `md`. Multi-column editor layouts stack into a single column (preview first, controls below), and side-by-side grids use `grid-cols-1 md:grid-cols-[...]`.
- **Touch targets**: interactive elements are at least 44×44px on touch (`min-h-11` or adequate padding); keep adequate spacing between adjacent targets. Hover-only interactions are forbidden. Everything reachable by hover must also work by tap.
- **Dialogs & popovers**: must fit the viewport (`w-full max-w-[calc(100vw-2rem)] max-h-[90dvh] overflow-y-auto`), scroll internally, and keep their close/submit buttons reachable. Use `dvh`, not `vh`, for full-height layouts.
- **Forms**: use correct `type`, `inputmode`, `autocomplete` attributes; inputs are at least 16px font size on mobile (prevents iOS zoom-on-focus); never let the on-screen keyboard cover the field being edited or the primary action.
- **Canvas / drag-and-drop / sliders**: pointer-based editors must use Pointer Events (not mouse-only events), set `touch-action` appropriately, and configure `@dnd-kit` with `PointerSensor` + `TouchSensor` (with an activation delay or distance so scrolling still works). Provide a non-drag alternative (e.g., up/down buttons) for reordering where practical.
- **Tables & dense data**: convert to stacked cards or wrap in a horizontally scrollable container on mobile; never let them overflow the page.
- **Media**: images/canvases scale with `max-w-full h-auto`; large uploads are downscaled before upload; avoid heavy per-frame work that stutters phones.
- **Platform realities**: Some features are inherently desktop-only (e.g., Kalimotxo's Web Audio loopback via `getDisplayMedia`, OBS browser-source embeds at `/embed/*` which render at fixed broadcast resolutions). For those, do NOT leave a broken page on mobile: detect the limitation and show a clear, friendly explanation (and a useful alternative or preview) instead. Editors that configure an OBS overlay (Chyron, Crawl, Clock, Timer, Screen) must still be fully editable on mobile; only the embed output itself is exempt.
- **Don't break desktop**: Mobile improvements must not regress the desktop layout. Check both.

## Verification Before Done
Do not claim a UI change works until it has been checked:
1. `npm run build` and typecheck pass.
2. The affected page was visually checked with a screenshot (e.g., Playwright against `next dev`) at **390px (mobile)** and **desktop** widths, with no console/page errors.
3. Keyboard navigation and visible focus work for any new interactive control.
4. Any temporary test pages/scripts created for verification are deleted afterward.
If a flow requires a signed-in user and cannot be tested locally, say so explicitly rather than implying it was verified.


## Customization Philosophy — "Apple HOA"
This app follows an **opinionated, bounded customization** model. Think Apple: users get meaningful choices, but within guardrails that preserve the overall look and quality.

**Rules:**

- **Prefer themes and curated color palettes** over raw color pickers wherever possible. Offer a set of named, pre-designed color combinations (e.g., "CNN Red", "Breaking Blue", "Dark Minimal") that users can select with one click. Raw color pickers can exist as an "Advanced / Custom" escape hatch, but should not be the primary UX for color selection.
- When adding new controls, always ask: *"Does this need more than 3-4 options, or can we reduce it to Small / Medium / Large?"*

## Shadcnblocks & Shadcnblocks/themes Guidelines
- **Shadcnblocks Integration**: Use free blocks from [Shadcnblocks](https://www.shadcnblocks.com) whenever possible for surrounding application shells, landing pages, authentication, marketing sections, and dashboard overviews.
- **Preserve Core Workspaces**: Always preserve our specialized custom studio editors (such as the Chyron, Crawl ticker, Clock, Timer, and Screen editors) and their fine-tuned drag-and-drop / real-time streaming architectures.
- **Theming System ([shadcnblocks.com/themes](https://www.shadcnblocks.com/themes))**:
  - The project uses Shadcnblocks theme tokens mapped to semantic CSS variables in `globals.css`.
  - Available curated user preference themes:
    1. **Modern Minimal** (`data-theme="modern-minimal"`): The default color scheme for the entire website. Clean, high contrast, stripped-back content-first UI.
    2. **Autoblog** (`data-theme="autoblog"`): Publishing-focused aesthetic with vivid orange primary and warm accent wash.
    3. **Alpine** (`data-theme="alpine"`): Cobalt structure, coral heat accent, and warm blush canvas (`#fcf5f7`).
    4. **Light Green** (`data-theme="light-green"`): High-contrast neon green primary with deep slate typography.
  - When introducing new components or blocks, ensure they utilize semantic theme tokens (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary`, etc.) so they automatically adapt across all user-selected themes.

## Platform Architecture: getphily's code stand (code.getphily.io)
The website functions as a unified platform hub for multiple specialized creator, broadcast, and organizing toolsets:
1. **OBS Stream Studio** (`/`, `/stream-studio`, `/crawl`, `/clock`, `/timer`, `/screen`): Real-time broadcast overlays, animated lower-third news chyrons, stream clocks, countdown timers, multi-page scene sets, and transparent OBS browser source embed URLs (`/embed/*`).
2. **Kalimotxo** (`/kalimotxo`): Audio-reactive 3D graphics engine utilizing Web Audio loopback and Three.js geometry.
3. **Podcast Tools** (`/podcast-tools`): Audio publishing automation including YouTube/Spotify chapter markers, ID3v2 metadata chunking, and syndicated RSS show notes.
All toolsets share global authentication, verified account profiles, and the Shadcnblocks theming system under `code.getphily.io`.

## Technology Stack & Deployment Notes
For detailed specifications, see `STACK.md`.
- **Framework & Runtime**: Next.js `16.3.8` (App Router, SSG `output: 'export'`), React `19.2.8`, TypeScript `5.x`.
- **Styling & Components**: Tailwind CSS `v4.3.3`, Radix UI primitives, Shadcnblocks blocks & themes.
  - `src/app/globals.css` MUST keep `@import "shadcn/tailwind.css"` and `@import "tw-animate-css"` right after `@import "tailwindcss"`. Without them, Tabs, Sliders, Switches and other `ui/*` components render broken (their `data-open`/`data-checked`/`data-active` state selectors never match Radix `data-state`). Fix this globally; never patch individual `ui/*` components around it.
- **Backend & Auth**: Supabase PostgreSQL + Auth (Google OAuth redirect via `/auth/callback`, Email/Password, RLS). Schema changes are delivered as `.sql` files in the project root for the user to run in the Supabase SQL Editor (no service-role key is available locally).
- **Drag-and-Drop**: `@dnd-kit/core` & `@dnd-kit/sortable` for sortable widget cards (must be configured with touch-capable sensors, see "Mobile & Responsive").
- **Toasts**: `react-hot-toast` positioned exclusively at `top-center`. Never use native `alert()`, `confirm()`, or `prompt()`.
- **Hosting & Production Deployment**:
  - Hosted on Hostinger LiteSpeed server under subdomain `code.getphily.io`.
  - Document root: `/home/u239940464/domains/getphily.io/public_html/code`.
  - Before deploying: the build and typecheck must pass, and any UI change must have been checked visually at desktop AND mobile widths (see "Verification Before Done").
  - Deployment command: Build locally via `npm run build` with `BypassSandbox: true` (exporting to `out/`), and sync to Hostinger via `rsync -avz --delete -e "ssh -p 65002 -i ~/.ssh/id_ed25519_podabio" out/ u239940464@46.202.198.21:/home/u239940464/domains/getphily.io/public_html/code/`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
