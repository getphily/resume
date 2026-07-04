# Workspace Rules & Design Principles

## 1. 1:1 Square Design Principle (Strict Squares)
- **Rule:** Whenever possible, use square boxes (1:1 aspect ratio) instead of portrait or landscape ratios for all UI cells, widgets, slides, and thumbnails.
- **Components affected:**
  - **Slide Carousel:** Excluded from the square rule to allow height-to-content spacing for text and timelines.
  - **Segments Stats Bar:** All grid cells must be rendered as `1:1` aspect ratio squares with centered content.
  - **Media Gallery Thumbnails:** Grid thumbnails are styled as `1:1` aspect ratio squares (`aspectRatio="1/1"`, `objectFit="cover"`).
  - **Lightbox Modal Container:** The main view image box container is rendered as a square.

## 2. Git & Deployment Operations
- **Rule:** The agent can run `git push` directly in the terminal to push changes to GitHub. When changes are verified and ready, stage and commit them, then execute `git push` directly.

