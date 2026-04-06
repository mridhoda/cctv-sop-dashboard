// ============================================================
//  QA TESTING GUIDE — CCTV Dashboard Web App
//  Project : Foodinesia CCTV-SOP Dashboard
//  Date    : 2026-04-06
//  For     : Tim QA / Testing Engineer
// ============================================================

#set page(
  paper: "a4",
  margin: (x: 1.8cm, y: 2cm),
  fill: rgb("#0f172a"),
  header: context {
    if counter(page).get().first() > 1 [
      #set text(size: 7.5pt, fill: rgb("#475569"))
      #grid(
        columns: (1fr, 1fr),
        [#text(fill: rgb("#38bdf8"))[QA Guide] #sym.dash.en CCTV Dashboard Web App],
        align(right)[Halaman #counter(page).display("1")],
      )
      #v(-0.3em)
      #line(stroke: 0.3pt + rgb("#1e293b"), length: 100%)
    ]
  },
)
#set text(font: ("Segoe UI", "Arial"), fill: rgb("#e2e8f0"), size: 10.5pt)
#set par(leading: 0.75em, spacing: 1.1em)

#let slate900 = rgb("#0f172a")
#let slate800 = rgb("#1e293b")
#let slate700 = rgb("#334155")
#let slate500 = rgb("#64748b")
#let slate300 = rgb("#94a3b8")
#let sky     = rgb("#38bdf8")
#let emerald = rgb("#10b981")
#let amber   = rgb("#f59e0b")
#let violet  = rgb("#8b5cf6")
#let rose    = rgb("#f43f5e")
#let cyan    = rgb("#06b6d4")
#let orange  = rgb("#f97316")
#let white   = rgb("#f8fafc")

#let chip(label, color) = box(
  fill: color.lighten(80%),
  stroke: 0.6pt + color,
  inset: (x: 6pt, y: 3pt),
  radius: 20pt,
)[#text(size: 8pt, weight: "bold", fill: color)[#label]]

#let tok(t) = box(
  fill: rgb("#020617"),
  stroke: 0.5pt + slate700,
  inset: (x: 4pt, y: 2pt),
  radius: 3pt,
)[#text(font: ("Consolas", "Courier New"), size: 9pt, fill: rgb("#7dd3fc"))[#t]]

#let lbl(t) = text(size: 8pt, fill: slate500, weight: "bold")[#upper(t)]

#let card(title, accent, icon, body) = block(
  fill: slate800,
  stroke: (left: 3pt + accent, rest: 0.5pt + slate700),
  inset: 1.1em,
  radius: 6pt,
  width: 100%,
  below: 1em,
)[
  #grid(
    columns: (auto, 1fr),
    gutter: 0.5em,
    align(horizon)[#text(size: 15pt)[#icon]],
    align(horizon)[#text(size: 12pt, weight: "bold", fill: accent)[#title]],
  )
  #line(stroke: 0.5pt + slate700, length: 100%)
  #v(0.4em)
  #body
]

#let warn(body) = block(
  fill: rose.lighten(85%),
  stroke: (left: 3pt + rose, rest: 0.5pt + rose.lighten(60%)),
  inset: 0.8em, radius: 5pt, width: 100%, below: 0.8em,
)[
  #text(size: 8.5pt, weight: "bold", fill: rose)[#sym.warning PERHATIAN] #h(0.4em)
  #text(size: 9.5pt, fill: rgb("#334155"))[#body]
]

#let info(body) = block(
  fill: sky.lighten(85%),
  stroke: (left: 3pt + sky, rest: 0.5pt + sky.lighten(60%)),
  inset: 0.8em, radius: 5pt, width: 100%, below: 0.8em,
)[
  #text(size: 8.5pt, weight: "bold", fill: sky)[i INFO] #h(0.4em)
  #text(size: 9.5pt, fill: rgb("#334155"))[#body]
]

#let tip(body) = block(
  fill: emerald.lighten(85%),
  stroke: (left: 3pt + emerald, rest: 0.5pt + emerald.lighten(60%)),
  inset: 0.8em, radius: 5pt, width: 100%, below: 0.8em,
)[
  #text(size: 8.5pt, weight: "bold", fill: emerald)[TIP] #h(0.4em)
  #text(size: 9.5pt, fill: rgb("#334155"))[#body]
]

#let bugbox(body) = block(
  fill: violet.lighten(85%),
  stroke: (left: 3pt + violet, rest: 0.5pt + violet.lighten(60%)),
  inset: 0.8em, radius: 5pt, width: 100%, below: 0.8em,
)[
  #text(size: 8.5pt, weight: "bold", fill: violet)[BUG FOUND?] #h(0.4em)
  #text(size: 9.5pt, fill: rgb("#334155"))[#body]
]

#let testrow(id, case, expected, priority) = {
  let pc = if priority == "P0" { rose } else if priority == "P1" { amber } else if priority == "P2" { cyan } else { slate500 }
  block(
    fill: slate800,
    stroke: (left: 2pt + pc, rest: 0.5pt + slate700),
    inset: (x: 0.8em, y: 0.6em),
    radius: 4pt, width: 100%, below: 0.5em,
  )[
    #grid(
      columns: (2.5cm, 1fr, auto),
      gutter: 0.5em,
      align(horizon)[#tok(id)],
      align(horizon)[#text(size: 9.5pt)[#case]],
      align(horizon)[#chip(priority, pc)],
    )
    #v(0.2em)
    #text(size: 8.5pt, fill: slate300)[#sym.arrow.r #expected]
  ]
}

#let sectionhead(num, title, color, icon) = {
  v(1em)
  block(
    fill: color.lighten(25%),
    width: 100%, inset: (x: 1em, y: 0.7em), radius: 8pt, below: 0.8em,
  )[
    #grid(
      columns: (auto, 1fr),
      gutter: 0.6em,
      align(horizon)[#text(size: 20pt)[#icon]],
      align(horizon)[
        #text(size: 7pt, fill: color.darken(30%), weight: "bold")[SECTION #num]
        #v(0.1em)
        #text(size: 13pt, weight: "bold", fill: color.darken(50%))[#title]
      ],
    )
  ]
}

// ═══════════════════════════════════════════════════════════
//  COVER PAGE
// ═══════════════════════════════════════════════════════════
#align(center)[
  #v(2em)
  #block(
    fill: slate800, stroke: 0.5pt + slate700,
    inset: (x: 2em, y: 1.5em), radius: 16pt, width: 85%,
  )[
    #text(size: 36pt)[#sym.shield]
    #v(0.4em)
    #text(size: 8pt, fill: slate500, weight: "bold", tracking: 3pt)[QA TESTING GUIDE]
    #v(0.3em)
    #text(size: 28pt, weight: "bold", fill: white)[CCTV Dashboard]
    #v(0.1em)
    #text(size: 16pt, fill: sky)[Web Application]
    #v(1em)
    #line(stroke: 0.5pt + slate700, length: 65%)
    #v(0.8em)
    #grid(
      columns: (1fr, 1fr, 1fr),
      gutter: 0.8em,
      align(center)[#chip("Platform: Web", cyan)],
      align(center)[#chip("v1.0", emerald)],
      align(center)[#chip("06 April 2026", amber)],
    )
  ]
  #v(1.5em)
  #text(size: 8pt, fill: slate500, tracking: 2pt)[FITUR YANG DIUJI]
  #v(0.5em)
  #grid(
    columns: (1fr,1fr,1fr,1fr),
    gutter: 0.5em,
    align(center)[#chip("Auth", rose)],
    align(center)[#chip("Live Monitoring", emerald)],
    align(center)[#chip("History", sky)],
    align(center)[#chip("Identities", violet)],
    align(center)[#chip("Cameras", amber)],
    align(center)[#chip("Reports", cyan)],
    align(center)[#chip("Settings", orange)],
    align(center)[#chip("Profile & Notif", slate300)],
  )
  #v(1.5em)
  #text(size: 9.5pt, fill: slate300)[
    Panduan lengkap bagi tim QA untuk menguji semua fitur aplikasi. \
    Ikuti setiap langkah dengan teliti. Dokumentasikan setiap temuan menggunakan \
    #text(fill: violet)[Bug Report Template] yang tersedia.
  ]
  #v(1em)
  #block(fill: rose.lighten(80%), stroke: 0.5pt + rose, inset: 0.8em, radius: 8pt, width: 70%)[
    #text(size: 9pt, fill: rose.darken(30%), weight: "bold")[
      Jika menemukan BUG BESAR #sym.arrow.r langsung isi Bug Report Template.docx
    ]
  ]
]

#pagebreak()
