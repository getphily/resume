# Unified Shell Architecture Plan

## Objective
Apply the **Unified Shell Principle** across all broadcast and creator tools in the platform (`code.getphily.io`). Every studio editor (Chyron, Clock, Timer, Screen, Kalimotxo, Podcast, Union) will share an identical architectural layout, navigation pattern, and UI component styling.

---

## 1. Eliminate Fragmented Catalogs
**Current State:** Tools like `/clock` and `/timer` currently render their own internal lists of saved widgets.
**Action:** 
- Strip all list/catalog views from the individual tool pages.
- The `/dashboard` is now the *only* place where saved widgets are listed and managed.
- Accessing a tool URL (e.g., `/clock`) with no `?id=` parameter will immediately open a blank, unsaved Studio Editor.
- Accessing a tool URL with an `?id=...` parameter will load that specific widget into the Studio Editor.

## 2. Standardized `StudioShell` Component
Create a reusable, strict layout wrapper (`src/components/StudioShell.tsx`) that enforces the layout across all tools.

**Anatomy of the `StudioShell`:**
1. **Sub-Header Toolbar (Top)**:
   - Left: Tool Icon + Tool Title (e.g., `[Icon] Clock Studio`).
   - Middle: Universal `Widget Name` text input.
   - Right: "Back to Dashboard" button, "Copy URL" button, and primary "Save Widget" button.
2. **Main Workspace (Split View)**:
   - **Settings Panel (Left or Right Column)**: 
     - Fixed width (e.g., `350px` or `400px`).
     - Y-scrollable.
     - Pure white background (`bg-card`).
     - Contains standard segmented tabs ("General", "Styles", "Content") and unified Shadcn form controls.
   - **Canvas/Preview Window (Remaining Space)**:
     - Off-white/dark background depending on theme.
     - Centers the actual tool output inside a `preview-window-container`.
     - Maintains a strict **16:9 Aspect Ratio** for all tools (unless explicitly overridden for tools like Crawl that are 1920x200).

## 3. Tool-by-Tool Refactoring Steps

### A. Chyron/Crawl Builder (`/crawl`)
- Wrap the editor state in `<StudioShell>`.
- Move the top "Back" and "Save" buttons into the Shell header.
- Move the accordion/tabbed properties (Title Bar, Subheader, Logo Bug) into the `settingsPanel` slot.
- Place the `ChyronPreview` into the `previewCanvas` slot.

### B. Clock Widget (`/clock`)
- Delete the `<div className="max-w-7xl mx-auto">` list view.
- Force it to render the Editor immediately.
- Map the config state (theme, font, timezone) to standard `Select` and `Slider` components in the `settingsPanel`.

### C. Timer Widget (`/timer`)
- Delete its internal catalog list.
- Standardize the inputs (duration, countdown/countup, chime selection) into the `settingsPanel`.
- Render the `TimerPreview` in the 16:9 canvas area.

### D. Screen Sets (`/screen`)
- Move the multi-page manager (Starting Soon, BRB, etc.) into the `settingsPanel`.
- Standardize the active page selector.
- Render the `ScreenPreview` in the `previewCanvas`.

### E. Kalimotxo 3D Visualizer (`/kalimotxo`)
- Currently has its own custom full-screen layout.
- Wrap it in `<StudioShell title="Kalimotxo Visualizer">`.
- Move the active preset buttons (Cyber Grid, Stems Flux, Amber Pulse) and the Three.js controls into the `settingsPanel`.
- Ensure the Three.js canvas stays perfectly 16:9 in the `previewCanvas` area.

### F. Placeholder Tools (`/podcast-tools`, `/union-tools`)
- Wrap their "Roadmap Preview" UI inside the exact same `<StudioShell>`, making them look like authentic, unified parts of the platform even before full functionality is built.

## 4. UI Primitive Standardization
- **Color Pickers**: All tools must use the exact same `<ColorInputWithPalette>` component.
- **Toggles**: Use `Switch` from Shadcn.
- **Dropdowns**: Use `Select` from Shadcn.
- **Sliders**: Use `Slider` from Shadcn.
- No raw `<input type="color">` or native `<select>`.

---
## Execution Strategy
1. Build `src/components/StudioShell.tsx` first.
2. Refactor `/clock/page.tsx` as the pilot test.
3. Apply to `/timer/page.tsx`.
4. Apply to `/crawl/page.tsx`.
5. Apply to `/screen/page.tsx`.
6. Apply to `/kalimotxo/page.tsx` and the placeholders.
7. Verify all tools look identical in structure and pass accessibility tests.
