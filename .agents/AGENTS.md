# Workspace Rules & Design Principles

## 1. Hardware Aesthetic Principle (Pioneer DJ)
- **Rule:** The UI must adhere to the tactile, industrial aesthetic of a Pioneer DJ DDJ-FLX10 controller.
- **Colors:** 
  - Chassis Black (`#111111`) for main backgrounds.
  - Module Grey (`#1C1C1C`) with rigid 1px solid borders (`#333333`) for grouped mixing panels.
  - Active Amber (`#FF5900`) for active states and engaged buttons.
  - Stems Accents: Drums Blue (`#0055FF`), Vocals Green (`#00FF00`), Instruments Red (`#FF0000`).
- **Typography:** Use `Inter` or `Roboto` for labels/headers, and `Roboto Mono` for any numerical readouts (simulating digital screens).
- **Layout:** The main preview window must be a **16:9 aspect ratio**, overriding any previous strict square constraints.

## 2. Git & Deployment Operations
- **Rule:** The agent can run `git push` directly in the terminal to push changes to GitHub. When changes are verified and ready, stage and commit them, then execute `git push` directly.
