// ============================================================
//  Shared Typst Template for Feature Plan Files
//  Import this at the top of each plan file
// ============================================================

// ─── Page Setup ──────────────────────────────────────────────
#let setup-page() = {
  set page(paper: "a4", margin: (x: 2cm, y: 2cm), fill: rgb("#0f172a"))
  set text(font: ("Segoe UI", "Arial"), fill: rgb("#e2e8f0"), size: 10.5pt)
  set par(leading: 0.75em, spacing: 1.2em)
}

// ─── Colors ──────────────────────────────────────────────────
#let slate700 = rgb("#334155")
#let slate500 = rgb("#64748b")
#let sky = rgb("#38bdf8")
#let emerald = rgb("#10b981")
#let amber = rgb("#f59e0b")
#let violet = rgb("#8b5cf6")
#let rose = rgb("#f43f5e")
#let cyan = rgb("#06b6d4")
