# Live Monitoring Page — Redesign for Single Camera

> **Date:** 2026-03-04  
> **Status:** validated  
> **Topic:** Redesign Monitoring.jsx as a stream-centric command center for 1 camera, scalable to multi-camera later

---

## Problem Statement

The current `Monitoring.jsx` is a multi-camera grid UI with 8 mock cameras and placeholder images. However, the V2_Project backend only serves **one MJPEG stream** (`/api/stream/video`). The page needs to be redesigned to:

1. Focus on a single live MJPEG stream as the hero element
2. Connect to real backend endpoints (REST + Socket.IO)
3. Provide glanceable monitoring UX for operators who watch for extended periods
4. Be architecturally ready for multi-camera support later

---

## Constraints

- **Tech stack:** React + Vite + Tailwind CSS + Lucide icons (no new UI libraries)
- **Backend:** Flask at `localhost:5001` — REST API + Socket.IO
- **Stream format:** MJPEG via `<img>` tag (not `<video>`)
- **Single file:** Keep everything in `src/pages/Monitoring.jsx` (matches existing pattern — one file per page with local subcomponents)
- **No new dependencies** for this page (socket.io-client and axios are separate integration tasks)
- **Dark theme default** — industry standard for CCTV monitoring

---

## Approach

**"Stream-Centric Command Center"** — the video stream dominates ~70% of the viewport, with a collapsible info sidebar on the right (~30%).

**Why not keep the grid view?** With 1 camera, a grid wastes space and makes the stream tiny. A command center maximizes real estate for the most important element.

**Why not fullscreen theater?** Operators need detection events, engine status, and controls visible at all times without toggling overlays. Monitoring is passive — info must be glanceable.

---

## Architecture

### Page Layout (Desktop)

```
┌──────────────────────────────────────────────────────────────┐
│  Header: "Live Monitoring" | Connection ● | Engine ● | ⚙️    │
├──────────────────────────────────────────┬───────────────────┤
│                                          │ 📷 Camera Info    │
│                                          │   Name, Res, FPS  │
│                                          ├───────────────────┤
│          LIVE VIDEO STREAM               │ 🎛 Engine Control │
│          (MJPEG from backend)            │   Start/Stop/     │
│                                          │   Restart         │
│          Floating overlays:              ├───────────────────┤
│          • LIVE badge (top-left)         │ 📊 Detection      │
│          • Resolution/FPS (top-right)    │   Stats           │
│          • Alert banner (bottom)         │   Today: 12       │
│                                          │   Violations: 3   │
│                                          ├───────────────────┤
│                                          │ 📋 Activity Feed  │
│                                          │   (scrollable)    │
│                                          │   14:32 Motion    │
│                                          │   14:28 Person ID │
└──────────────────────────────────────────┴───────────────────┘
```

**Proportions:** Stream area ~70% width, sidebar ~30% (collapsible to 0%).

### Responsive Behavior

- **Desktop (>1024px):** Stream + Sidebar side by side
- **Tablet (768-1024px):** Sidebar auto-collapsed, toggle button visible
- **Mobile (<768px):** Stream full width, sidebar becomes bottom sheet or overlay

---

## Components

All components are local subcomponents inside `Monitoring.jsx` (matching existing codebase pattern).

### 1. StreamViewer (Hero Component)

**Purpose:** Renders the live MJPEG stream as the main focal point.

**Props:** None initially (single camera). Later: `cameraId`, `streamUrl`.

**Rendering:**
- Uses an `<img>` tag with `src` pointing to `/api/stream/video` (MJPEG streams work natively in `<img>` tags — the browser keeps receiving JPEG frames)
- `object-fit: contain` to maintain aspect ratio within the container
- Dark background (`bg-black`) behind the stream

**Floating Overlays (absolute positioned inside the stream container):**
- **Top-left:** LIVE badge — red pill with pulsing white dot + "LIVE" text
- **Top-right:** Resolution badge ("1080p") and FPS badge ("30 FPS") — semi-transparent dark background
- **Bottom:** Alert banner — amber bar that appears when there's an active detection/violation. Shows event text + timestamp.
- **Center (on hover):** Fullscreen button and Snapshot button — appear with opacity transition

**Connection States:**
- `connecting`: Skeleton pulse animation + "Connecting to stream..." text centered
- `live`: Stream visible, LIVE badge pulsing
- `offline`: Dark screen + `WifiOff` icon + "Camera Offline" + manual Retry button
- `error`: Dark screen with red-tinted border + error message + Retry button

**Stream connection logic:**
- Set `<img src>` to the MJPEG URL
- Listen to `onLoad` → set state to `live`
- Listen to `onError` → set state to `error`
- Auto-retry: on error, attempt reconnect every 5 seconds (up to 5 attempts), then show manual retry
- Retry button: reset src to trigger reload

**Fullscreen:** Use `element.requestFullscreen()` API on the stream container div.

**Snapshot:** Fetch `/api/stream/snapshot` → open in new tab or trigger download.

**Multi-camera scalability:** This component takes `streamUrl` as a prop. For multi-camera, render multiple `StreamViewer` instances in a grid and pass each camera's stream URL.

---

### 2. MonitoringHeader (Top Bar)

**Purpose:** Compact header showing system status at a glance.

**Left section:**
- Camera icon + "Live Monitoring" title (text-sm, font-semibold)

**Center section (status indicators):**
- **Connection indicator:** Small colored dot (green = connected, red = disconnected) + text label. Uses the stream connection state.
- **Engine status pill:** Rounded pill showing engine state:
  - Running: green dot (pulsing) + "Running"
  - Stopped: gray dot + "Stopped"
  - Error: red dot + "Error"

**Right section (actions):**
- Theme toggle button (Sun/Moon icon) — existing pattern
- Sidebar toggle button (PanelRightClose/PanelRightOpen) — existing pattern
- Fullscreen button for entire page

**Multi-camera scalability:** Add camera count badges ("6 Online · 2 Offline") between title and status indicators.

---

### 3. InfoSidebar (Right Panel, Collapsible)

**Purpose:** Contextual information and controls panel.

**Collapse behavior:** Same as existing — width transitions from `w-80` to `w-0` with `overflow-hidden` and `transition-all duration-300`.

**Contains 4 stacked sections:**

#### 3a. Camera Info Card
- Camera name (e.g., "Main Entrance Camera")
- Location text
- Resolution + FPS in small badges
- Online/Offline status indicator
- Compact card, always at the top
- Uses data from `/api/status` endpoint

#### 3b. Engine Controls
- Reuse the existing `EngineControls` subcomponent (Start/Stop/Restart buttons) — it's already well-designed
- Status pill above buttons showing current engine state
- Loading spinner on buttons during API calls
- Calls `POST /api/engine/{start|stop|restart}`

#### 3c. Detection Stats (Mini Dashboard)
- 3-4 stat items in a compact grid (2 columns):
  - "Detections Today" — count number
  - "Violations" — count with red accent
  - "Valid SOP" — count with green accent  
  - "Compliance Rate" — percentage with small progress bar
- Data from `/api/stats` (polled every 10s) or Socket.IO `stats_update`
- Numbers animate on change (simple CSS transition on opacity)

#### 3d. Activity Feed (Scrollable, fills remaining height)
- Takes `flex-1` to fill remaining sidebar space
- Sticky sub-header: "Activity Log" + count badge
- Scrollable list of detection events
- Each entry shows:
  - Severity dot (color-coded: red=alert, amber=warning, blue=info)
  - Event text (e.g., "Violation Detected", "Person Identified")
  - Camera name (for multi-camera readiness)
  - Timestamp
- New events prepend to top with subtle slide-in animation
- Data from Socket.IO `detection_event` or polled from `/api/events?limit=20`
- Auto-scroll to newest entry when new events arrive (unless user has scrolled up manually)

**Multi-camera scalability:** Add a "Camera List" section at the very top of sidebar (above Camera Info) with clickable camera tiles. Selected camera determines which stream shows in StreamViewer.

---

## Data Flow

### Initial Load
1. Page mounts → fetch `GET /api/status` for camera info + engine status
2. Page mounts → fetch `GET /api/stats` for detection statistics
3. Page mounts → fetch `GET /api/events?limit=20` for initial activity feed
4. Page mounts → set `<img src>` to `/api/stream/video` to start MJPEG stream
5. Page mounts → establish Socket.IO connection (if socket.io-client is available)

### Real-time Updates (Socket.IO)
- `detection_event` → prepend to activity feed, update stats counters
- `stats_update` → update Detection Stats section
- `engine_status` → update engine status pill in header + sidebar

### Polling Fallback (if Socket.IO not yet integrated)
- Poll `/api/status` every 5 seconds → update connection + engine status
- Poll `/api/stats` every 10 seconds → update detection stats
- Poll `/api/events?limit=20` every 5 seconds → update activity feed

### User Actions
- Engine Start/Stop/Restart → `POST /api/engine/{action}` → update UI on response
- Snapshot → `GET /api/stream/snapshot` → download or open image
- Fullscreen → Browser Fullscreen API
- Toggle sidebar → local state
- Toggle theme → local state

---

## State Management

All state is local to the `Monitoring` component via `useState` (matching existing pattern — no global store).

```
State variables:
- dark (boolean) — theme, default true
- engineStatus ("running" | "stopped" | "error") — from API/socket
- isLoading (boolean) — engine action in progress
- sidebarOpen (boolean) — sidebar visibility, default true
- streamStatus ("connecting" | "live" | "offline" | "error") — stream connection state
- cameraInfo (object | null) — name, location, resolution, fps from /api/status
- stats (object | null) — detection counts from /api/stats
- events (array) — activity feed entries from /api/events
- connectionStatus ("connected" | "disconnected") — overall backend reachability
```

---

## Error Handling Strategy

| Scenario | User Sees | Recovery |
|----------|-----------|----------|
| Stream fails to load | Dark screen + "Unable to connect to stream" + Retry button | Auto-retry every 5s (max 5), then manual retry |
| Engine API call fails | Engine button shows error state + toast "Failed to start engine" | Button stays enabled for retry |
| /api/status fails | Camera info shows "Unknown" placeholders, connection dot red | Auto-retry on next poll cycle |
| /api/stats fails | Stats show "--" placeholder values | Auto-retry on next poll cycle |
| /api/events fails | Activity feed shows "Unable to load events" | Retry on next poll cycle |
| Backend completely down | Header shows red "Disconnected" + all sections show fallback UI | Manual refresh, auto-retry polling continues |

**Principle:** Component-level error isolation. Stream failure doesn't break sidebar. Sidebar API failures don't break stream. Each section handles its own error state independently.

---

## Visual Design Details

### Color Palette (Dark Theme)
- Page background: `bg-slate-950`
- Header background: `bg-slate-900`
- Sidebar background: `bg-slate-900`
- Card backgrounds: `bg-slate-800`
- Stream container: `bg-black`
- Primary text: `text-white` / `text-slate-100`
- Secondary text: `text-slate-400`
- Borders: `border-slate-800`
- Accent green (online/running): `emerald-400/500`
- Accent red (alert/error): `red-400/500`
- Accent amber (warning): `amber-400/500`
- Accent blue (info): `blue-400/500`

### Typography
- Header title: `text-sm font-semibold`
- Section titles: `text-xs font-semibold uppercase tracking-wider text-slate-400`
- Body text: `text-sm`
- Compact text: `text-xs`
- Tiny text (timestamps): `text-[10px]`

### Spacing
- Header padding: `px-5 py-3`
- Sidebar section padding: `px-4 py-3`
- Between sections: `border-b border-slate-800`
- Card internal padding: `p-3`

### Animations
- Sidebar collapse: `transition-all duration-300 ease-in-out`
- LIVE badge dot: `animate-pulse`
- Status dot (running): `animate-pulse`
- New activity feed entry: CSS `@keyframes slideIn` — translateY(-8px) + opacity 0→1, duration 200ms
- Stat number changes: `transition-opacity duration-300`
- Hover states on buttons: `transition-colors duration-150`

---

## Testing Strategy

- **Stream states:** Verify all 4 connection states render correctly (connecting, live, offline, error)
- **Engine controls:** Buttons trigger correct POST endpoints, disabled states work
- **Sidebar collapse:** Smooth animation, content hidden when collapsed
- **Error isolation:** Mock API failures individually — each section degrades gracefully without affecting others
- **Responsive:** Check layout at 1280px, 1024px, 768px, 375px breakpoints
- **Theme toggle:** All components respect dark/light state

---

## Implementation Notes

### File to modify
- `src/pages/Monitoring.jsx` — complete rewrite of the existing file

### What to keep from existing code
- `EngineControls` subcomponent — well-designed, reuse with minor tweaks
- `getSeverityStyle` helper — reuse for activity feed styling
- Overall structure pattern: mock data at top, helpers, subcomponents, main component
- Engine control API call pattern (`handleEngineControl`)

### What to remove
- `MOCK_CAMERAS` array (8 cameras) — replace with single camera from `/api/status`
- `CameraTile` subcomponent — not needed for single camera view
- `TheatreView` subcomponent — replaced by StreamViewer as default
- `GridView` subcomponent — not needed for single camera
- Grid layout selector in header — not applicable
- All `picsum.photos` placeholder URLs — replaced by real MJPEG stream

### What to add
- `StreamViewer` subcomponent — new hero component for MJPEG
- `CameraInfoCard` subcomponent — camera details panel
- `DetectionStats` subcomponent — mini dashboard in sidebar
- `ActivityFeed` subcomponent — real-time event list
- API fetch calls: `/api/status`, `/api/stats`, `/api/events`
- Polling logic with `useEffect` + `setInterval`
- Stream connection state management
- Snapshot download functionality

### Data fetching approach (for now, without socket.io-client)
- Use native `fetch` (already used in existing code for engine control)
- Polling with `setInterval` inside `useEffect` with proper cleanup
- MJPEG stream via `<img src>` — browser handles the streaming natively

### Multi-camera preparation
- `StreamViewer` accepts optional `streamUrl` prop (defaults to `/api/stream/video`)
- Camera info stored as object (easy to convert to array later)
- Activity feed entries include `camera` field
- Sidebar structure allows inserting a camera list section later

---

## Open Questions

None — design is self-contained and ready for implementation.
