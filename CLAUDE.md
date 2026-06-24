# Phil Ybarrolaza Resume Timeline - Project Context (CLAUDE.md)

This file contains the context, scripts, and guiding principles for agents working on this project.

## Scripts & Operations

* **Start development server**: `npm run dev` (starts nodemon watching `server.js` and public assets)
* **Start production server**: `npm start` (runs node on `server.js`)
* **Local address**: `http://localhost:3000`

## Tech Stack & Architecture

* **Backend**: Node.js & Express (`server.js`). Standard Node.js webapp optimized for Hostinger deployment.
* **Frontend**: Vanilla HTML5, CSS3 (using layers, modern selectors, `@supports`), and client-side JavaScript. Assets are located in the `public/` directory.
* **Data Sources**:
  * `podcasts.json`: Stashed podcast listing containing titles, hosts, frequencies, links, and status.

## Core Guiding Principles & Rules

> [!IMPORTANT]
> ### 📱 Visual-First & Mobile-First Priority (Highest Importance)
> The web interface must always be fully responsive, with **mobile devices prioritized as the highest design, usability, and aesthetic priority**.
> * **Visual-First Infographic Focus**: The project must focus heavily on **visual storytelling**. The professional summary and other key sections must utilize CSS/SVG-based infographics, interactive flow dashboards, status meters, and visual cards instead of plain, cold blocks of text. The summary serves as a high-fidelity visual index leading into timeline cards and media galleries.
> * **Functional Accessibility**: Keyboard navigation, screen-reader compatibility (semantic HTML, descriptive ARIA attributes, table fallbacks for charts), and touch targets of at least `24x24` CSS pixels (leveraging coarse pointer rules where appropriate).
> * **Aesthetic Excellence on Mobile**: Ambient glows, glassmorphic blur ratios, font sizing rules (`clamp()`), and timelines must look clean, balanced, and premium on vertical viewports of all screen widths.
> * **Progressive Enhancement**: Native CSS View Timeline animations must degrade gracefully to performant JavaScript IntersectionObservers on unsupported devices/browsers.
