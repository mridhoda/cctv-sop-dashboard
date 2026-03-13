// ============================================================
//  Feature 02 — Dashboard Home (Overview)
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
  #chip("Feature 02", sky) #h(0.5em) #chip("Priority: MEDIUM", amber)
  #v(0.5em)
  #text(size: 22pt, weight: "bold", fill: rgb("#f8fafc"))[Dashboard Home (Overview)]
  #v(0.3em)
  #text(size: 9pt, fill: slate500)[
    File: #text(fill: sky)[App.jsx (DashboardView)] #h(1em) Status: #text(fill: amber)[Mock Data]
  ]
]
#v(0.8em)
#line(stroke: 0.5pt + slate700, length: 100%)
#v(0.8em)


#card("Status Saat Ini", amber, "📌")[
  #lbl("Kondisi frontend")
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - Metric cards (Total Deteksi, Insiden, Tingkat Kepatuhan) = *hardcoded*.
    - Pie Chart compliance = *statik* (85% / 15%).
    - Daftar insiden terbaru = *MOCK\_INCIDENTS* array.
    - Status CCTV & AI Deteksi = *MOCK\_CCTV* array.
    - Tidak ada data real-time dari backend.
  ]
]


#card("REST API Endpoints", violet, "🔌")[
  #lbl("Data yang dibutuhkan dashboard")
  #v(0.5em)
  #route("GET", "/api/dashboard/summary", "Aggregate metrics: total deteksi 24h, insiden, compliance rate.")
  #route("GET", "/api/dashboard/incidents", "5 insiden terbaru untuk tabel preview (limit=5).")
  #route("GET", "/api/dashboard/cameras", "Status online/offline + jumlah insiden per kamera hari ini.")
  #route("GET", "/api/dashboard/compliance", "Data pie chart: persentase kepatuhan vs pelanggaran.")

  #v(0.3em)
  #block(fill: rose.lighten(85%), stroke: 0.5pt + rose, inset: 0.6em, radius: 4pt, width: 100%)[
    #text(size: 9pt, fill: rose, weight: "bold")[💡 Alternatif] \
    #text(size: 9pt, fill: rgb("#334155"))[
      Bisa dijadikan *1 endpoint* #tok("GET /api/dashboard") yang return semua data sekaligus untuk mengurangi HTTP requests.
    ]
  ]
]


#card("Data Model — Dashboard Summary", emerald, "📊")[
  #lbl("Response yang diharapkan frontend")
  #v(0.4em)
  #block(fill: rgb("#020617"), stroke: 0.5pt + slate700, inset: 0.8em, radius: 5pt, width: 100%)[
    #text(font: ("Consolas", "Courier New"), size: 9pt, fill: rgb("#7dd3fc"))[
      \{ \
      #h(1em) totalDetections: 1248, \
      #h(1em) totalViolations: 42, \
      #h(1em) complianceRate: 85.4, \
      #h(1em) recentIncidents: [...], \
      #h(1em) cameras: [ \{ name, status, detectionState, incidentsToday \} ] \
      \}
    ]
  ]
]


#card("Real-Time (Opsional)", cyan, "⚡")[
  #lbl("Jika ingin dashboard home juga live")
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - Subscribe Socket.IO event #tok("stats_update") untuk update metrics tanpa polling.
    - Subscribe #tok("detection_event") untuk push insiden baru ke tabel tanpa refresh.
    - Saat ini hanya halaman *Monitoring* yang melakukan ini — bisa di-extend ke Home.
  ]
]
