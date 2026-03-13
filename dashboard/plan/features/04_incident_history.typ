// ============================================================
//  Feature 04 — Incident History (Riwayat Insiden)
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
  #chip("Feature 04", sky) #h(0.5em) #chip("Priority: HIGH", rose)
  #v(0.5em)
  #text(size: 22pt, weight: "bold", fill: rgb("#f8fafc"))[Riwayat Insiden]
  #v(0.3em)
  #text(size: 9pt, fill: slate500)[
    File: #text(fill: sky)[History.jsx] #h(1em) Status: #text(fill: amber)[Full Mock Data]
  ]
]
#v(0.8em)
#line(stroke: 0.5pt + slate700, length: 100%)
#v(0.8em)


#card("Status Saat Ini", amber, "📌")[
  #lbl("Kondisi frontend")
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - Menampilkan 10 item dari #tok("mockIncidents") array hardcoded.
    - Filter by status (All/Pelanggaran/Valid), search by nama/lokasi/jenis — *client-side*.
    - Pagination 5 item/page — *client-side*.
    - Detail modal dengan foto (placeholder URL), AI description.
    - Export CSV button *disabled* (belum ada API).
    - TODO: #tok("GET /api/events?limit=50&status=...") tertulis tapi belum di-implement.
  ]
]


#card("Database — events / incidents", emerald, "🗄")[
  #lbl("Schema")
  #v(0.3em)
  #field("id", "Serial", "Primary key auto-increment")
  #field("waktu", "DateTime", "Timestamp kejadian deteksi")
  #field("lokasi", "String", "Nama area / kamera")
  #field("nama_staff", "String", "Nama staff terdeteksi (bisa null)")
  #field("jenis_pelanggaran", "String", "Deskripsi jenis deteksi")
  #field("status", "Enum", "'Pelanggaran' | 'Valid'")
  #field("foto", "String", "Path/URL ke foto bukti")
  #field("deskripsi_ai", "Text", "Analisis AI: confidence, rekomendasi")
  #field("track_id", "String", "Tracking ID dari engine (opsional)")
]


#card("REST API Endpoints", violet, "🔌")[
  #lbl("Endpoint yang dibutuhkan")
  #v(0.5em)
  #route("GET", "/api/events", "Daftar insiden — query: ?limit, ?offset, ?status, ?search.")
  #route("GET", "/api/events/:id", "Detail satu insiden + foto + AI description.")
  #route("GET", "/api/events/export/csv", "Download CSV dari filtered events.")

  #v(0.3em)
  #lbl("Query params yang di-support")
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - #tok("status") = Pelanggaran | Valid | All
    - #tok("search") = keyword pencarian (nama, lokasi, jenis)
    - #tok("limit") & #tok("offset") = pagination server-side
    - #tok("sort") = waktu desc (default)
  ]
]


#card("Catatan Penting", rose, "⚠")[
  #lbl("Bug dan improvement")
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - *Bug:* Object field typo di mock data — #tok("wakti") harusnya #tok("waktu") (line 111).
    - Pagination harus diubah ke *server-side* untuk dataset besar.
    - Foto bukti masih placeholder — perlu endpoint yang sama dengan Photo Evidence (#tok("/api/reports/:filename")).
  ]
]
