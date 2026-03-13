// ============================================================
//  Feature 05 — Identity Management (Manajemen Identitas)
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
  let c = if m == "GET" { emerald } else if m == "POST" { amber } else if m == "DELETE" { rose } else { violet }
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
    columns: (1.6cm, 6cm, 1fr),
    gutter: 0.5em,
    align(horizon)[#method(m)],
    align(horizon)[#tok(path)],
    align(horizon)[#text(size: 9.5pt, fill: rgb("#94a3b8"))[#desc]],
  )
  v(0.4em)
}


// ═══════════════════════════════════════════════════════════
#align(center)[
  #chip("Feature 05", sky) #h(0.5em) #chip("Priority: HIGH", rose)
  #v(0.5em)
  #text(size: 22pt, weight: "bold", fill: rgb("#f8fafc"))[Manajemen Identitas Staff]
  #v(0.3em)
  #text(size: 9pt, fill: slate500)[
    File: #text(fill: sky)[Identities.jsx] #h(1em) Status: #text(fill: amber)[Full Mock Data]
  ]
]
#v(0.8em)
#line(stroke: 0.5pt + slate700, length: 100%)
#v(0.8em)


#card("Status Saat Ini", amber, "📌")[
  #lbl("Kondisi frontend")
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - CRUD identitas sepenuhnya di *local React state* (mock array).
    - Add modal: nama, jabatan, ID karyawan, upload foto (hanya simpan filename).
    - Delete dengan konfirmasi overlay.
    - Tombol *Encode* ada tapi *belum terhubung* ke API.
    - Search by nama (client-side).
    - TODO tertulis: #tok("GET/POST/DELETE /api/identities") dan #tok("POST /api/identities/{id}/encode").
  ]
]


#card("Database — identities", emerald, "🗄")[
  #lbl("Schema")
  #v(0.3em)
  #field("id", "UUID", "Primary key")
  #field("nama", "String", "Nama lengkap staff")
  #field("jabatan", "String", "Posisi/jabatan")
  #field("id_karyawan", "String", "Unique employee ID (EMP001, dll)")
  #field("avatar", "String", "Path/URL foto wajah")
  #field("status", "Enum", "'Active' | 'Inactive'")
  #field("terdaftar", "DateTime", "Tanggal registrasi")
  #field("encoding", "BLOB/JSON", "Face embedding vector (128/512-d)")
  #field("is_encoded", "Boolean", "Apakah encoding sudah diproses")
]


#card("REST API Endpoints", violet, "🔌")[
  #lbl("CRUD + Face Encoding")
  #v(0.5em)
  #route("GET", "/api/identities", "Daftar semua identitas. Query: ?search, ?status.")
  #route("POST", "/api/identities", "Tambah identitas baru + upload foto (multipart).")
  #route("DELETE", "/api/identities/:id", "Hapus identitas + file foto terkait.")
  #route("POST", "/api/identities/:id/encode", "Trigger face encoding oleh AI Engine.")

  #v(0.3em)
  #block(fill: cyan.lighten(85%), stroke: 0.5pt + cyan, inset: 0.6em, radius: 4pt, width: 100%)[
    #text(size: 9pt, fill: cyan, weight: "bold")[🧠 Face Encoding Flow] \
    #text(size: 9pt, fill: rgb("#334155"))[
      1. User upload foto → backend simpan file. \
      2. User klik "Encode" → backend panggil AI Engine. \
      3. AI Engine baca foto, generate embedding vector. \
      4. Backend simpan encoding ke database. \
      5. AI Engine gunakan encoding saat real-time detection.
    ]
  ]
]


#card("File Storage", amber, "💾")[
  #lbl("Foto wajah staff")
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - Simpan di folder #tok("public/uploads/identities/") atau Cloud storage.
    - Format: JPEG/PNG, max 5MB (sesuai hint di frontend).
    - Foto perlu *accessible* oleh AI Engine untuk proses encoding.
    - *Saat delete identity* → hapus juga file foto dan encoding data.
  ]
]
