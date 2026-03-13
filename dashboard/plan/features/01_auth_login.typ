// ============================================================
//  Feature 01 — Authentication & Login
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

#let tok(t) = box(
  fill: rgb("#020617"),
  stroke: 0.5pt + slate700,
  inset: (x: 4pt, y: 2pt),
  radius: 3pt,
)[#text(font: ("Consolas", "Courier New"), size: 9pt, fill: rgb("#7dd3fc"))[#t]]

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
//  HEADER
// ═══════════════════════════════════════════════════════════
#align(center)[
  #chip("Feature 01", sky) #h(0.5em) #chip("Priority: HIGH", rose)
  #v(0.5em)
  #text(size: 22pt, weight: "bold", fill: rgb("#f8fafc"))[Authentication & Login]
  #v(0.3em)
  #text(size: 9pt, fill: slate500)[
    File: #text(fill: sky)[App.jsx] #h(1em) Status: #text(fill: amber)[Mock Data]
  ]
]
#v(0.8em)
#line(stroke: 0.5pt + slate700, length: 100%)
#v(0.8em)


// ═══════════════════════════════════════════════════════════
//  STATUS
// ═══════════════════════════════════════════════════════════
#card("Status Saat Ini", amber, "📌")[
  #lbl("Kondisi frontend")
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - Login menggunakan *hardcoded mock users* di `App.jsx` (superadmin / viewer).
    - Password perbandingan *plaintext* di sisi client.
    - Tidak ada JWT, session, atau API call.
    - Role-based tab visibility sudah *implemented* (superadmin vs viewer).
  ]
]


// ═══════════════════════════════════════════════════════════
//  DATABASE
// ═══════════════════════════════════════════════════════════
#card("Database — users", emerald, "🗄")[
  #lbl("Schema yang dibutuhkan")
  #v(0.3em)
  #field("id", "UUID", "Primary key")
  #field("username", "String", "Unique, untuk login")
  #field("password", "String", "Hashed (bcrypt / argon2)")
  #field("name", "String", "Nama tampilan")
  #field("role", "Enum", "'superadmin' | 'viewer'")
  #field("role_label", "String", "Label UI ('Super Administrator')")
  #field("is_active", "Boolean", "Bisa dinonaktifkan tanpa hapus")
  #field("created_at", "DateTime", "Auto-generated")
]


// ═══════════════════════════════════════════════════════════
//  API ENDPOINTS
// ═══════════════════════════════════════════════════════════
#card("REST API Endpoints", violet, "🔌")[
  #lbl("Endpoint yang dibutuhkan")
  #v(0.5em)
  #route("POST", "/api/auth/login", "Terima { username, password }, return JWT + user info.")
  #route("POST", "/api/auth/logout", "Invalidate refresh token (jika dipakai).")
  #route("GET", "/api/auth/me", "Return user info berdasarkan JWT di header.")

  #v(0.3em)
  #lbl("Response login berhasil")
  #v(0.3em)
  #block(fill: rgb("#020617"), stroke: 0.5pt + slate700, inset: 0.8em, radius: 5pt, width: 100%)[
    #text(font: ("Consolas", "Courier New"), size: 9pt, fill: rgb("#7dd3fc"))[
      \{ token, user: \{ id, username, name, role, roleLabel, allowedTabs \} \}
    ]
  ]
]


// ═══════════════════════════════════════════════════════════
//  SECURITY
// ═══════════════════════════════════════════════════════════
#card("Security Requirements", rose, "🔒")[
  #lbl("Checklist keamanan")
  #v(0.3em)
  #text(size: 9.5pt, fill: rgb("#94a3b8"))[
    - Password *harus* di-hash server-side (bcrypt, cost ≥ 10).
    - JWT access token: *short-lived* (15 menit), refresh token: 7 hari.
    - RBAC enforcement *server-side* — jangan hanya andalkan frontend.
    - Rate limit login endpoint (max 5 attempts / minute per IP).
    - Jangan kirim `password` field dalam response.
  ]
]
