// ============================================================
//  Feature 07 — System Settings (Pengaturan Sistem)
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
  let c = if m == "GET" { emerald } else if m == "POST" { amber } else if m == "PUT" { cyan } else { violet }
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
    columns: (1.6cm, 4.5cm, 1fr),
    gutter: 0.5em,
    align(horizon)[#method(m)],
    align(horizon)[#tok(path)],
    align(horizon)[#text(size: 9.5pt, fill: rgb("#94a3b8"))[#desc]],
  )
  v(0.4em)
}


// ═══════════════════════════════════════════════════════════
#align(center)[
  #chip("Feature 07", sky) #h(0.5em) #chip("Priority: MEDIUM", amber)
  #v(0.5em)
  #text(size: 22pt, weight: "bold", fill: rgb("#f8fafc"))[System Settings]
  #v(0.3em)
  #text(size: 9pt, fill: slate500)[
    File: #text(fill: sky)[Settings.jsx] #h(1em) Status: #text(fill: amber)[Mock — Simulated Save]
  ]
]
#v(0.8em)
#line(stroke: 0.5pt + slate700, length: 100%)
#v(0.8em)


#card("Status Saat Ini", amber, "📌")[
  #lbl("Kondisi frontend")
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - Semua config di-*hardcode* sebagai default di React state.
    - Save button *simulated* — setTimeout 1 detik, lalu show banner sukses.
    - Reset button mengembalikan ke default values client-side.
    - TODO: #tok("GET /api/config") dan #tok("PUT /api/config") tertulis tapi belum di-call.
  ]
]


#card("Config Sections & Fields", emerald, "⚙")[
  #lbl("4 section yang ada di frontend")
  #v(0.5em)

  // Section 1
  #text(size: 11pt, weight: "bold", fill: emerald)[1. Kamera & Sumber Video]
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - #tok("camera_source") — RTSP URL atau index (default: "0")
    - #tok("detection_duration") — Detik konfirmasi sebelum alert (default: 3)
    - #tok("cooldown_minutes") — Jeda re-alert untuk pelanggaran sama (default: 5)
  ]
  #v(0.6em)

  // Section 2
  #text(size: 11pt, weight: "bold", fill: emerald)[2. AI Detection Threshold]
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - #tok("conf_person") — Float 0-1 (default: 0.65)
    - #tok("conf_sop") — Float 0-1 (default: 0.70)
    - #tok("face_distance_threshold") — Float 0-1 (default: 0.45)
  ]
  #v(0.6em)

  // Section 3
  #text(size: 11pt, weight: "bold", fill: emerald)[3. Server & Streaming]
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - #tok("server_fps") — Integer 1-60 (default: 30)
    - #tok("server_quality") — Integer 1-100, JPEG quality (default: 85)
  ]
  #v(0.6em)

  // Section 4
  #text(size: 11pt, weight: "bold", fill: emerald)[4. Notifikasi Telegram]
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - #tok("telegram_enabled") — Boolean toggle
    - #tok("telegram_bot_token") — String, sensitif (field type: password)
    - #tok("telegram_chat_id") — String, ID tujuan notifikasi
  ]
]


#card("REST API Endpoints", violet, "🔌")[
  #lbl("Config management")
  #v(0.5em)
  #route("GET", "/api/config", "Load semua config saat ini dari server/file.")
  #route("PUT", "/api/config", "Simpan perubahan config. Body = seluruh config object.")

  #v(0.3em)
  #lbl("Implementasi di backend")
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - Config bisa disimpan sebagai *JSON file* di server (simpel) atau *tabel database*.
    - Saat #tok("PUT /api/config") dipanggil, backend juga harus *notify AI Engine* untuk reload config
      (via Socket emit #tok("engine_command") \{ command: 'reload\_config' \}).
  ]
]


#card("Security", rose, "🔒")[
  #lbl("Perhatian khusus")
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - #tok("telegram_bot_token") = *sensitif* — *enkripsi* saat simpan, *jangan* return plaintext di GET.
    - Hanya role #tok("superadmin") yang boleh akses endpoint config.
    - Validasi range: FPS 1-60, quality 1-100, confidence 0.0-1.0.
    - Jika config invalid, tolak request dengan 422 dan pesan jelas.
  ]
]
