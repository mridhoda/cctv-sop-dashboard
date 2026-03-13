// ============================================================
//  Backend Implementation Plan — Photo Evidence Feature
//  Project : Foodinesia CCTV-SOP Dashboard
//  Date    : 2026-03-09
// ============================================================

// ─── Page Setup ──────────────────────────────────────────────
#set page(paper: "a4", margin: (x: 2cm, y: 2cm), fill: rgb("#0f172a"))
#set text(font: ("Segoe UI", "Arial"), fill: rgb("#e2e8f0"), size: 10.5pt)
#set par(leading: 0.75em, spacing: 1.2em)

// ─── Colors ──────────────────────────────────────────────────
#let slate700 = rgb("#334155")
#let slate500 = rgb("#64748b")
#let sky = rgb("#38bdf8")
#let emerald = rgb("#10b981")
#let amber = rgb("#f59e0b")
#let violet = rgb("#8b5cf6")
#let rose = rgb("#f43f5e")
#let cyan = rgb("#06b6d4")

// ─── Components ──────────────────────────────────────────────

// Pill / Chip
#let chip(label, color) = box(
  fill: color.lighten(80%),
  stroke: 0.6pt + color,
  inset: (x: 6pt, y: 3pt),
  radius: 20pt,
)[#text(size: 8pt, weight: "bold", fill: color)[#label]]

// HTTP Method
#let method(m) = {
  let c = if m == "GET" { emerald } else if m == "POST" { amber } else { violet }
  chip(m, c)
}

// Code token
#let tok(t) = box(
  fill: rgb("#020617"),
  stroke: 0.5pt + slate700,
  inset: (x: 4pt, y: 2pt),
  radius: 3pt,
)[#text(font: ("Consolas", "Courier New"), size: 9pt, fill: rgb("#7dd3fc"))[#t]]

// Section card with colored left border
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

// DB field row
#let field(name, ftype, desc) = {
  grid(
    columns: (5.5cm, 2.8cm, 1fr),
    gutter: 0.5em,
    align(horizon)[#tok(name)],
    align(horizon)[#chip(ftype, violet)],
    align(horizon)[#text(size: 9.5pt, fill: rgb("#94a3b8"))[#desc]],
  )
  v(0.3em)
}

// API route row
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

// Small label
#let lbl(t) = text(size: 8.5pt, fill: slate500, weight: "bold")[#upper(t)]


// ═════════════════════════════════════════════════════════════
//  HEADER
// ═════════════════════════════════════════════════════════════
#align(center)[
  #text(size: 9pt, fill: slate500)[BACKEND IMPLEMENTATION PLAN]
  #v(0.3em)
  #text(size: 22pt, weight: "bold", fill: rgb("#f8fafc"))[Photo Evidence Feature]
  #v(0.3em)
  #text(size: 9pt, fill: slate500)[
    Project: #text(fill: sky)[Foodinesia CCTV-SOP] #h(1.5em)
    Date: #text(fill: sky)[2026-03-09]
  ]
]

#v(1em)
#line(stroke: 0.5pt + slate700, length: 100%)
#v(0.6em)

// Overview chips
#align(center, grid(
  columns: 4,
  gutter: 0.8em,
  chip("Database", emerald), chip("Storage", amber), chip("REST API", violet), chip("Socket.IO", rose),
))
#v(1.2em)


// ═════════════════════════════════════════════════════════════
//  1. DATABASE
// ═════════════════════════════════════════════════════════════
#card("Database Table — reports", emerald, "🗄")[
  #lbl("Tujuan")
  #v(0.3em)
  Menyimpan metadata tiap foto tangkapan AI Engine ke database relasional.

  #v(0.7em)
  #lbl("Schema")
  #v(0.3em)
  #field("id", "UUID", "Primary key — auto-generated")
  #field("filename", "String", "Nama file lokal atau path Cloud")
  #field("timestamp", "DateTime", "Waktu deteksi terjadi")
  #field("location", "String", "Area / nama kamera sumber")
  #field("type", "Enum", "'pelanggaran'  |  'valid'")
  #field("jenis", "String", "Deskripsi singkat hasil deteksi")
  #field("confidence_score", "Float", "Akurasi AI (0.0 – 1.0)")
]


// ═════════════════════════════════════════════════════════════
//  2. FILE STORAGE
// ═════════════════════════════════════════════════════════════
#card("File Storage", amber, "💾")[
  #lbl("Opsi penyimpanan foto fisik")
  #v(0.5em)

  #grid(
    columns: (1fr, 1fr),
    gutter: 1em,
    block(fill: rgb("#0f172a"), stroke: 0.5pt + slate700, inset: 0.8em, radius: 5pt)[
      #text(weight: "bold", fill: amber)[Local — Simpel] \
      #v(0.3em)
      #text(size: 9.5pt, fill: rgb("#94a3b8"))[
        Simpan ke folder server: \
        #tok("public/uploads/reports/") \
        #v(0.2em)
        Sajikan via #tok("express.static()")
      ]
    ],
    block(fill: rgb("#0f172a"), stroke: 0.5pt + slate700, inset: 0.8em, radius: 5pt)[
      #text(weight: "bold", fill: amber)[Cloud — Scalable] \
      #v(0.3em)
      #text(size: 9.5pt, fill: rgb("#94a3b8"))[
        AWS S3 / Cloudflare R2 / Minio \
        #v(0.2em)
        File harus punya *public URL* agar bisa dirender oleh frontend.
      ]
    ],
  )
]


// ═════════════════════════════════════════════════════════════
//  3. REST API
// ═════════════════════════════════════════════════════════════
#card("REST API Endpoints", violet, "🔌")[
  #lbl("Endpoint yang dibutuhkan frontend")
  #v(0.5em)

  #route("POST", "/api/reports", "Terima gambar (Multer) + metadata dari AI Engine, simpan ke DB & storage.")
  #route("GET", "/api/reports", "Daftar laporan — filter type, pagination. Dipakai Reports.jsx.")
  #route("GET", "/api/reports/:filename", "Serve foto asli atau redirect ke URL Cloud.")
  #route("GET", "/api/reports/export/csv", "Generate & download file CSV rekap laporan.")

  #v(0.3em)
  #block(fill: rose.lighten(85%), stroke: 0.5pt + rose, inset: 0.6em, radius: 4pt, width: 100%)[
    #text(size: 9pt, fill: rose, weight: "bold")[⚠ Catatan Keamanan] \
    #text(size: 9pt, fill: rgb("#334155"))[
      Endpoint #tok("POST /api/reports") hanya boleh dipanggil oleh AI Engine dengan header #tok("X-Internal-Key").
    ]
  ]
]


// ═════════════════════════════════════════════════════════════
//  4. SOCKET.IO
// ═════════════════════════════════════════════════════════════
#card("Real-Time Socket.IO", rose, "⚡")[
  #lbl("Alur broadcast deteksi baru")
  #v(0.5em)

  #grid(
    columns: (auto, 1fr),
    gutter: 0.5em,
    text(fill: sky)[→], text(size: 9.5pt)[AI Engine memanggil #tok("POST /api/reports")],
    text(fill: sky)[→], text(size: 9.5pt)[Backend simpan data, lalu *broadcast* Socket.IO ke semua client],
    text(fill: sky)[→], text(size: 9.5pt)[Frontend update Activity Feed & popup foto real-time],
  )

  #v(0.7em)
  #lbl("Payload — detection_event")
  #v(0.4em)
  #block(
    fill: rgb("#020617"),
    stroke: 0.5pt + slate700,
    inset: 0.8em,
    radius: 5pt,
    width: 100%,
  )[
    #text(font: ("Consolas", "Courier New"), size: 9pt, fill: rgb("#7dd3fc"))[
      \{ #h(0.5em) id, name, status, track_id, timestamp, \
      #h(1.5em) #text(fill: rose, weight: "bold")[photo_path] #text(fill: slate500)[ ← wajib ada] \
      \}
    ]
  ]
]


// ═════════════════════════════════════════════════════════════
//  DATA FLOW
// ═════════════════════════════════════════════════════════════
#v(0.3em)
#line(stroke: 0.5pt + slate700, length: 100%)
#v(0.5em)
#lbl("Alur data end-to-end")
#v(0.5em)

#align(center)[
  #text(size: 10pt)[
    #text(fill: cyan, weight: "bold")[AI Engine]
    #h(0.4em) → #h(0.4em)
    #text(fill: violet, weight: "bold")[Backend API]
    #h(0.4em) → #h(0.4em)
    #text(fill: amber, weight: "bold")[DB + Storage]
    #h(0.4em) → #h(0.4em)
    #text(fill: rose, weight: "bold")[Socket.IO]
    #h(0.4em) → #h(0.4em)
    #text(fill: emerald, weight: "bold")[Dashboard]
  ]
]
