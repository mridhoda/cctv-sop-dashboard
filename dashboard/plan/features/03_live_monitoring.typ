// ============================================================
//  Feature 03 — Live Monitoring
//  Project : Foodinesia CCTV-SOP Dashboard
// ============================================================

#set page(paper: "a4", margin: (x: 2cm, y: 2cm), fill: rgb("#0f172a"))
#set text(font: ("Segoe UI", "Arial"), fill: rgb("#e2e8f0"), size: 10.5pt)
#set par(leading: 0.75em, spacing: 1.2em)

#let slate700 = rgb("#334155")
#let slate500 = rgb("#64748b")
#let sky = rgb("#38bdf8")
#let emerald = rgb("#10b981")
#let amber = rgb("#f59e0b")
#let violet = rgb("#8b5cf6")
#let rose = rgb("#f43f5e")
#let cyan = rgb("#06b6d4")

#let chip(label, color) = box(
  fill: color.lighten(80%),
  stroke: 0.6pt + color,
  inset: (x: 6pt, y: 3pt),
  radius: 20pt,
)[#text(size: 8pt, weight: "bold", fill: color)[#label]]
#let method(m) = {
  let c = if m == "GET" { emerald } else if m == "POST" { amber } else { violet }
  chip(m, c)
}
#let tok(t) = box(fill: rgb("#020617"), stroke: 0.5pt + slate700, inset: (x: 4pt, y: 2pt), radius: 3pt)[#text(
  font: ("Consolas", "Courier New"),
  size: 9pt,
  fill: rgb("#7dd3fc"),
)[#t]]
#let card(title, accent, icon, body) = block(
  fill: rgb("#1e293b"),
  stroke: (left: 3pt + accent, rest: 0.5pt + slate700),
  inset: 1.2em,
  radius: 6pt,
  width: 100%,
  below: 1.2em,
)[
  #grid(
    columns: (auto, 1fr),
    gutter: 0.6em,
    align(horizon)[#text(size: 16pt)[#icon]], align(horizon)[#text(size: 13pt, weight: "bold", fill: accent)[#title]],
  )
  #line(stroke: 0.5pt + slate700, length: 100%)
  #v(0.5em)
  #body
]
#let lbl(t) = text(size: 8.5pt, fill: slate500, weight: "bold")[#upper(t)]
#let route(m, path, desc) = {
  grid(
    columns: (1.6cm, 5.8cm, 1fr),
    gutter: 0.5em,
    align(horizon)[#method(m)],
    align(horizon)[#tok(path)],
    align(horizon)[#text(size: 9.5pt, fill: rgb("#94a3b8"))[#desc]],
  )
  v(0.4em)
}


// ═══════════════════════════════════════════════════════════
#align(center)[
  #chip("Feature 03", sky) #h(0.5em) #chip("Priority: HIGH", rose) #h(0.5em) #chip("Partially Working", emerald)
  #v(0.5em)
  #text(size: 22pt, weight: "bold", fill: rgb("#f8fafc"))[Live Monitoring]
  #v(0.3em)
  #text(size: 9pt, fill: slate500)[
    File: #text(fill: sky)[Monitoring.jsx] #h(1em) Status: #text(fill: emerald)[Backend Exists (Partial)]
  ]
]
#v(0.8em)
#line(stroke: 0.5pt + slate700, length: 100%)
#v(0.8em)


#card("Status Saat Ini", emerald, "✅")[
  #lbl("Yang sudah berjalan")
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - MJPEG stream dari #tok("GET /api/stream/video") — *sudah aktif*.
    - Snapshot preview dari #tok("GET /api/stream/snapshot") — *sudah aktif*.
    - Socket.IO events (#tok("engine_status"), #tok("stats_update"), #tok("detection_event"), #tok("log")) — *sudah aktif*.
    - Engine control via Socket (emit #tok("engine_command")) + REST fallback — *sudah aktif*.
    - REST polling fallback #tok("GET /api/status"), #tok("GET /api/stats"), #tok("GET /api/events") — *sudah aktif*.
  ]
]


#card("Yang Masih Kurang", amber, "⚠")[
  #lbl("Fitur frontend ada tapi backend belum tentu siap")
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - Activity feed fallback events masih pakai #tok("MOCK_EVENTS") saat API gagal.
    - Field #tok("photo_path") di detection\_event — ada di frontend, tapi perlu verifikasi apakah backend sudah kirim.
    - Role permission (#tok("viewer") vs #tok("superadmin")) di-handle only frontend — server belum validasi.
  ]
]


#card("REST API yang Dipakai", violet, "🔌")[
  #lbl("Semua endpoint yang di-call oleh Monitoring.jsx")
  #v(0.5em)
  #route("GET", "/api/stream/video", "MJPEG stream — render langsung di <img> tag.")
  #route("GET", "/api/stream/snapshot", "Single frame JPEG untuk preview saat offline.")
  #route("GET", "/api/status", "Camera info, engine status, stream status.")
  #route("GET", "/api/stats", "Detection counts, compliance, FPS, active tracks.")
  #route("GET", "/api/events?limit=20", "Recent detection events (fallback saat Socket mati).")
  #route("POST", "/api/engine/:action", "Start/stop/restart engine (fallback saat Socket mati).")
]


#card("Socket.IO Events", cyan, "⚡")[
  #lbl("Dari server ke client (listen)")
  #v(0.3em)
  #grid(
    columns: (4cm, 1fr),
    gutter: 0.4em,
    tok("engine_status"), text(size: 9.5pt, fill: rgb("#94a3b8"))[\{ status, message? \}],
    tok("stats_update"),
    text(size: 9.5pt, fill: rgb("#94a3b8"))[\{ total_valid, total_pelanggaran, fps, active_tracks \}],

    tok("detection_event"),
    text(size: 9.5pt, fill: rgb("#94a3b8"))[\{ id, name, status, track_id, timestamp, photo_path \}],

    tok("log"), text(size: 9.5pt, fill: rgb("#94a3b8"))[\{ message, level, timestamp \}],
  )
  #v(0.5em)
  #lbl("Dari client ke server (emit)")
  #v(0.3em)
  #grid(
    columns: (4cm, 1fr),
    gutter: 0.4em,
    tok("engine_command"), text(size: 9.5pt, fill: rgb("#94a3b8"))[\{ command: 'start' | 'stop' | 'restart' \}],
    tok("request_snapshot"), text(size: 9.5pt, fill: rgb("#94a3b8"))[no payload],
  )
]
