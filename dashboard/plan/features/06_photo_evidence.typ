// ============================================================
//  Feature 06 — Photo Evidence (Laporan & Bukti Foto)
//  Project : Foodinesia CCTV-SOP Dashboard
//  NOTE    : Updated version of the earlier backend_plan.typ
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
  #chip("Feature 06", sky) #h(0.5em) #chip("Priority: HIGH", rose)
  #v(0.5em)
  #text(size: 22pt, weight: "bold", fill: rgb("#f8fafc"))[Laporan & Bukti Foto]
  #v(0.3em)
  #text(size: 9pt, fill: slate500)[
    File: #text(fill: sky)[Reports.jsx] #h(1em) Status: #text(fill: amber)[Full Mock Data]
  ]
]
#v(0.8em)
#line(stroke: 0.5pt + slate700, length: 100%)
#v(0.8em)


#card("Status Saat Ini", amber, "📌")[
  #lbl("Kondisi frontend")
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - Gallery 8 item dari #tok("mockReports") array.
    - Filter tabs (Semua / Pelanggaran / SOP Valid).
    - Lightbox modal dengan detail laporan, confidence score bar.
    - Export CSV button *fungsional* tapi hanya dari mock data.
    - Foto = *placeholder* (gradient + Camera icon), bukan gambar asli.
    - TODO: #tok("GET /api/reports"), #tok("GET /api/reports/{filename}"), #tok("GET /api/reports/export/csv").
  ]
]


#card("Database — reports", emerald, "🗄")[
  #lbl("Schema")
  #v(0.3em)
  #field("id", "UUID", "Primary key")
  #field("filename", "String", "Nama file foto lokal / Cloud path")
  #field("timestamp", "DateTime", "Waktu deteksi")
  #field("location", "String", "Nama area / kamera")
  #field("type", "Enum", "'pelanggaran' | 'valid'")
  #field("jenis", "String", "Deskripsi deteksi")
  #field("confidence_score", "Float", "Akurasi AI (0.0 – 1.0)")
]


#card("REST API Endpoints", violet, "🔌")[
  #lbl("Dibutuhkan oleh Reports.jsx")
  #v(0.5em)
  #route("POST", "/api/reports", "Internal — terima gambar + metadata dari AI Engine.")
  #route("GET", "/api/reports", "Daftar laporan. Query: ?type, ?limit, ?offset.")
  #route("GET", "/api/reports/:filename", "Serve foto asli atau redirect ke Cloud URL.")
  #route("GET", "/api/reports/export/csv", "Download CSV rekap laporan.")

  #v(0.3em)
  #block(fill: rose.lighten(85%), stroke: 0.5pt + rose, inset: 0.6em, radius: 4pt, width: 100%)[
    #text(size: 9pt, fill: rose, weight: "bold")[⚠ Security] \
    #text(size: 9pt, fill: rgb("#334155"))[
      #tok("POST /api/reports") hanya boleh dipanggil internal (AI Engine) — proteksi via #tok("X-Internal-Key").
    ]
  ]
]


#card("Socket.IO Broadcast", rose, "⚡")[
  #lbl("Real-time notifikasi")
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    Saat #tok("POST /api/reports") diterima, backend juga broadcast #tok("detection_event") via Socket.IO
    dengan field #tok("photo_path") agar Monitoring page bisa menampilkan thumbnail langsung.
  ]
]


#card("File Storage", amber, "💾")[
  #lbl("Opsi penyimpanan")
  #v(0.3em)
  #grid(
    columns: (1fr, 1fr),
    gutter: 1em,
    block(fill: rgb("#0f172a"), stroke: 0.5pt + slate700, inset: 0.8em, radius: 5pt)[
      #text(weight: "bold", fill: amber)[Local] \
      #v(0.2em)
      #text(size: 9.5pt, fill: rgb("#94a3b8"))[
        #tok("public/uploads/reports/") \
        Serve via #tok("express.static()")
      ]
    ],
    block(fill: rgb("#0f172a"), stroke: 0.5pt + slate700, inset: 0.8em, radius: 5pt)[
      #text(weight: "bold", fill: amber)[Cloud] \
      #v(0.2em)
      #text(size: 9.5pt, fill: rgb("#94a3b8"))[
        S3 / R2 / Minio \
        File harus punya *public URL*.
      ]
    ],
  )
]
