# KALIMOTXO // MASTER SYSTEM DESIGN DOCUMENT

## 1. Brand Identity & Visual Design System

Inspired by the tactile, industrial aesthetic of the Pioneer DJ DDJ-FLX10 controller, the interface combines professional hardware styling with clean legibility for streaming environments.

* **The Logo Mark:** A 2x2 tactile performance grid featuring physical rubber pads with subtle inner shadows, accompanied by the logotype **KALIMOTXO** rendered in uppercase, heavy weight, and wide letter-spacing (`Inter` font).
* **Hardware Color Palette:**
* **Chassis Black (`#111111`):** The matte background for the core UI structure.
* **Module Grey (`#1C1C1C`):** Used for grouped mixing panels, framed by rigid 1px solid borders (`#333333`).
* **Stems Accents:** Drums Blue (`#0055FF`), Vocals Green (`#00FF00`), and Instruments Red (`#FF0000`).
* **Active Amber (`#FF5900`):** Pioneer's signature warm orange used to indicate engaged performance pads and active states.


* **Typography System:**
* **Primary Font:** `Inter` or `Roboto` for clean, utilitarian UI headers and section labels.
* **Data Font:** `Roboto Mono` strictly reserved for numerical readouts (such as sensitivity and smoothing values) to simulate digital LED screens.


---

## 2. Application Architecture & Tech Stack

The platform is built on modern web standards to ensure high-performance 3D rendering and a frictionless deployment workflow.

* **Frontend Framework:** React powered by Vite for fast, modular component-based development.
* **Backend & Database Ecosystem:** Supabase handles backend infrastructure, secure user session management, and relational database storage.
* **Rendering & Audio Engine:** Three.js combined with the native Web Audio API drives real-time, frequency-reactive 3D graphics.

---

## 3. Authentication & Database Schema

User accounts and custom profiles are securely managed via Supabase, ensuring personal configurations follow the DJ across different studio setups.

* **Authentication Flow:** Supabase Auth manages standard username and password registrations, architected to easily scale into third-party OAuth providers later.
* **Relational Schema (`users` & `user_presets`):**
* `users` table: Stores `id` (UUID synced with Supabase Auth), `username`, and account metadata.
* `user_presets` table: Stores saved visual states linked to the respective `user_id`, including custom parameters (visual style, primary color hex, smoothing float, and sensitivity multiplier).



---

## 4. Website Structure & Streaming Integration

The platform separates the configuration phase from the live broadcast output, keeping the user experience clean and stream-ready.

* **Website Structure:**
* **The Dashboard / Studio (`/studio`):** The primary route housing the tactile FLX10-inspired control panel and a 16:9 aspect ratio preview window for tweaking visual parameters.
* **The Live Canvas (`/live`):** A dedicated route that opens a pristine, full-screen browser window containing exclusively the Three.js canvas, optimized for OBS capture.


* **Audio Capture Mechanism:** Utilizes the browser's native `getDisplayMedia()` API (the "screen share audio hack" or system loopback capture) to feed real-time audio data directly into the Web Audio API engine.