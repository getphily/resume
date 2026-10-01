# OBSWidgets UI & Layout Guidelines

## Core Layout Structure
The application must strictly follow a "Hostinger Dashboard" inspired layout architecture:
1. **Global Top Navbar**: A full-width, very dark (high contrast) navigation bar at the very top. This contains global actions, branding, and user profile/auth state.
2. **Left Sidebar(s)**: Positioned *below* the top navbar on the left. Can be single or dual-column (e.g., narrow icon sidebar + wider secondary menu). Background should match the main app background or be slightly contrasting (e.g., white if app bg is light gray).
3. **Main Content Area**: Occupies the remaining space to the right of the sidebar. Uses a very light, off-white background (`var(--bg-main)`).
4. **Cards / Panels**: Content within the main area must be contained in pure white, rounded panels with very subtle borders and soft drop shadows to separate them from the off-white background.

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
- Ensure all inputs and buttons have distinct hover and focus states (e.g., `box-shadow: 0 0 0 2px var(--accent-primary)` for focus).
- The "Export to OBS" or preview windows should utilize the transparent checkerboard pattern (`.preview-window-container`) to indicate transparency cleanly.
- Never use inline styles for structural colors; always map to `globals.css` CSS variables.

## Modals & Popups
- NEVER use native browser popups like `alert()`, `confirm()`, or `prompt()`.
- For all alerts, confirmations, and notifications, always use `react-hot-toast` (`import toast from "react-hot-toast"`).
- For complex confirmation dialogs, render a custom React component inside the toast.
- Toast notifications MUST be positioned at `top-center` (not bottom-right) so they are immediately visible and easily interactive for the user.

## Web Design UX Best Practices
- ALWAYS apply established modern web development UI/UX best practices when building new elements, layouts, features, or adding styling. 
- Ask yourself: "Is this intuitive, accessible, and standard for modern web apps?" before finalizing any layout or component.

## Customization Philosophy — "Apple HOA"
This app follows an **opinionated, bounded customization** model. Think Apple: users get meaningful choices, but within guardrails that preserve the overall look and quality.

**Rules:**
- **Prefer segmented controls over sliders** for any setting where 2–4 named options cover the real-world range (e.g., font size → Small / Medium / Large; speed → Slow / Normal / Fast).
- **Avoid granular numeric inputs** (sliders, number fields) unless the user genuinely needs pixel-precise control. If a slider has more than ~5 meaningful stops, replace it with named options.
- **Dropdowns are allowed** for selections like fonts and colors when appropriate. Limit font choices to a curated set (3–5 fonts) instead of raw font-family text inputs.
- **Text toolbars and complex tools** are allowed to break the above "HOA" rules (like using dropdowns, granular inputs, etc.) if it results in a better, more efficient design for that specific tool. Industry best practices are always allowed.
- **Color pickers are acceptable** for brand-level customization (text color, background, accent) since color is inherently personal.
- **Prefer themes and curated color palettes** over raw color pickers wherever possible. Offer a set of named, pre-designed color combinations (e.g., "CNN Red", "Breaking Blue", "Dark Minimal") that users can select with one click. Raw color pickers can exist as an "Advanced / Custom" escape hatch, but should not be the primary UX for color selection.
- When adding new controls, always ask: *"Does this need more than 3-4 options, or can we reduce it to Small / Medium / Large?"*

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
