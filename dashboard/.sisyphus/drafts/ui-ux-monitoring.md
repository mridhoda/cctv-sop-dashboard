# Draft: UI/UX Redesign - Live Monitoring Page

## Requirements (confirmed)
- Improve UI/UX of `Monitoring.jsx` to be neater and more user-friendly.

## Current Pain Points Discovered
1. **Inconsistent Theming**: Single camera view uses a dark theme (`bg-slate-950`), while the grid view uses a light theme (`bg-white`). A consistent dark theme is standard for CCTV monitoring to reduce eye strain.
2. **Redundant Controls**: Engine controls (Start/Stop/Restart) appear in both the Top Bar and the Right Sidebar.
3. **Layout Squeezing**: The right sidebar (Activity Log) takes up constant space. It should be collapsible or integrated better to maximize the camera grid size.
4. **Visual Hierarchy**: Too many borders and separate boxes.

## Proposed Technical Decisions
- **Theme**: Unified Dark Theme (`slate-900`/`slate-950`) across the entire Monitoring page.
- **Layout Structure**:
  - **Header**: Clean, minimal. Contains Title, Stats Badges, and Global Actions (Grid Selector, Collapse Sidebar). Remove redundant engine controls from here.
  - **Main Area**: Camera Grid. Maximize width. Dynamic sizing based on grid selection.
  - **Sidebar (Collapsible)**: Move all Engine Controls to the top of the sidebar. Below it, a scrollable Activity Log. 
- **Single Camera View**: Instead of replacing the entire screen, use a theater mode (Main large player + smaller grid of others below/aside) OR a clean full-screen modal with overlay controls to keep context.
- **Card Design**: Camera tiles should have a sleek overlay for camera name, status (Live/Offline/Alert), and quick actions (expand, snapshot) rather than taking space below the video.

## Open Questions
- Does the user prefer a strict Dark Mode for this page, or support for both (via a theme toggle)?
- Should the Activity Log sidebar be collapsible by default to give maximum space to cameras?
- How should the single camera view behave? (Modal, Theatre Mode, or keep replacing the screen but with a better layout?)

## Scope Boundaries
- INCLUDE: Refactoring `Monitoring.jsx` React component, updating Tailwind classes, adding collapsible animations (e.g., using Framer Motion or simple CSS transitions if not installed).
- EXCLUDE: Modifying the backend API, changing other pages.