// ============================================================
//  ALUR PRESENTASI — Monitoring Dashboard (Viewer Role)
//  Untuk: Presentasi ke Bos / Manajemen
//  Fokus: Output yang sudah jalan, bukan teknis
// ============================================================

#set page(
  paper: "a4",
  margin: (x: 1.8cm, y: 1.8cm),
  fill: rgb("#ffffff"),
  header: context {
    if counter(page).get().first() > 1 [
      #set text(size: 7.5pt, fill: rgb("#94a3b8"))
      #grid(
        columns: (1fr, 1fr),
        [VisionGuard AI — Alur Presentasi], align(right)[— #counter(page).display("1") —],
      )
      #v(-0.3em)
      #line(stroke: 0.3pt + rgb("#e2e8f0"), length: 100%)
    ]
  },
)
#set text(font: ("Segoe UI", "Arial"), fill: rgb("#1e293b"), size: 10.5pt)
#set par(leading: 0.75em, spacing: 1em)

// ─── Colors ──────────────────────────────────────────────
#let dark = rgb("#f8fafc")
#let darker = rgb("#f1f5f9")
#let slate = rgb("#e2e8f0")
#let muted = rgb("#64748b")
#let light = rgb("#1e293b")
#let sky = rgb("#0284c7")
#let emerald = rgb("#059669")
#let amber = rgb("#d97706")
#let rose = rgb("#e11d48")
#let cyan = rgb("#0891b2")
#let violet = rgb("#7c3aed")

// ─── Components ──────────────────────────────────────────
#let chip(label, color) = box(
  fill: color.lighten(80%),
  stroke: 0.6pt + color,
  inset: (x: 6pt, y: 3pt),
  radius: 20pt,
)[#text(size: 8pt, weight: "bold", fill: color)[#label]]

#let section(num, title, accent, icon) = {
  v(0.8em)
  block(width: 100%, below: 0.8em)[
    #grid(
      columns: (auto, auto, 1fr),
      gutter: 0.5em,
      align(horizon)[#box(fill: accent, inset: (x: 7pt, y: 4pt), radius: 6pt)[
        #text(size: 10pt, weight: "bold", fill: white)[#num]
      ]],
      align(horizon)[#text(size: 15pt, weight: "bold", fill: accent)[#icon #title]],
      align(horizon + right)[],
    )
  ]
  line(stroke: 0.5pt + slate, length: 100%)
  v(0.3em)
}

#let card(title, accent, body) = block(
  fill: dark,
  stroke: (left: 3pt + accent, rest: 0.5pt + slate),
  inset: 1em,
  radius: 6pt,
  width: 100%,
  below: 0.8em,
)[
  #text(size: 11pt, weight: "bold", fill: accent)[#title]
  #v(0.3em)
  #body
]

#let speak(txt) = block(
  fill: emerald.lighten(88%),
  stroke: 0.5pt + emerald.lighten(40%),
  inset: (x: 1em, y: 0.7em),
  radius: 8pt,
  width: 100%,
  below: 0.8em,
)[
  #text(size: 8pt, weight: "bold", fill: emerald.darken(20%))[💬 KATA-KATA KE BOS:]
  #v(0.2em)
  #text(size: 10pt, weight: "medium", fill: emerald.darken(40%), style: "italic")[
    "#txt"
  ]
]

#let tip(txt) = block(
  fill: amber.lighten(88%),
  stroke: 0.5pt + amber.lighten(40%),
  inset: (x: 1em, y: 0.6em),
  radius: 8pt,
  width: 100%,
  below: 0.8em,
)[
  #text(size: 8pt, weight: "bold", fill: amber.darken(20%))[💡 TAMBAHAN PENTING:]
  #v(0.2em)
  #text(size: 9.5pt, fill: amber.darken(40%))[#txt]
]

#let feat(icon, name, desc) = {
  grid(
    columns: (2em, 3.5cm, 1fr),
    gutter: 0.4em,
    align(horizon + center)[#text(size: 12pt)[#icon]],
    align(horizon)[#text(size: 9.5pt, weight: "bold", fill: light)[#name]],
    align(horizon)[#text(size: 9.5pt, fill: muted)[#desc]],
  )
  v(0.2em)
}


// ═══════════════════════════════════════════════════════════
//  COVER
// ═══════════════════════════════════════════════════════════
#align(center)[
  #v(3em)
  #box(fill: emerald, inset: (x: 12pt, y: 8pt), radius: 10pt)[
    #text(size: 18pt, weight: "bold", fill: white)[🛡️ VisionGuard AI]
  ]
  #v(1em)
  #text(size: 24pt, weight: "bold", fill: light)[Alur Presentasi]
  #v(0.3em)
  #text(size: 14pt, fill: sky)[Live Monitoring Dashboard]
  #v(1.5em)
  #line(stroke: 0.5pt + slate, length: 50%)
  #v(1em)
  #grid(
    columns: (1fr, 1fr, 1fr),
    gutter: 1em,
    align(center)[#chip("Role: Viewer", cyan)],
    align(center)[#chip("Demo Langsung", emerald)],
    align(center)[#chip("Durasi: Fleksibel", amber)],
  )
  #v(2em)
  #text(size: 9pt, fill: muted)[
    Tujuan: Tunjukkan ke bos *output nyata* yang sudah jalan. \
    Bukan teknis — tapi *manfaat bisnis*.
  ]
]


// ═══════════════════════════════════════════════════════════
//  TIPS SEBELUM MULAI
// ═══════════════════════════════════════════════════════════
#pagebreak()

#align(center)[
  #text(size: 16pt, weight: "bold", fill: amber)[⚡ Tips Sebelum Mulai Presentasi]
  #v(0.5em)
]

#grid(
  columns: (1fr, 1fr),
  gutter: 1em,
  block(fill: rose.lighten(90%), stroke: 0.5pt + rose, inset: 1em, radius: 8pt)[
    #text(size: 10pt, weight: "bold", fill: rose)[❌ JANGAN]
    #v(0.3em)
    #text(size: 9.5pt, fill: rose.darken(30%))[
      - "Ini pakai React, Tailwind, Socket..."
      - Jelasin kode / nama library
      - Banyak teks, baca slide
      - "Endpoint API-nya ini..."
      - "WebSocket real-time..."
    ]
  ],
  block(fill: emerald.lighten(90%), stroke: 0.5pt + emerald, inset: 1em, radius: 8pt)[
    #text(size: 10pt, weight: "bold", fill: emerald)[✅ LAKUKAN]
    #v(0.3em)
    #text(size: 9.5pt, fill: emerald.darken(30%))[
      - "Ini hasilnya: monitoring otomatis"
      - Jelasin *manfaat* dan *efisiensi*
      - Banyak *demo klik-klik* langsung
      - "Data muncul langsung, tanpa refresh"
      - "Pelanggaran muncul otomatis di layar"
    ]
  ],
)

#v(0.5em)
#tip[
  Bos care soal *hasil*, bukan cara bikin. Fokus ke: hemat waktu, hemat tenaga, otomatis, akurat. \
  Kalau bos tanya teknis, jawab singkat aja saat presentasi. Detailnya bisa dijelaskan terpisah.
]


// ═══════════════════════════════════════════════════════════
//  SECTION 1 — HOOK
// ═══════════════════════════════════════════════════════════
#pagebreak()

#section("1", "HOOK — Masalah yang Kita Selesaikan", rose, "🎯")

#card("Masalah Lama", rose)[
  #text(size: 9.5pt, fill: muted)[
    - Monitoring CCTV *manual*, perlu supervisor yang terus-menerus lihat layar.
    - Karyawan lelah, banyak kejadian pelanggaran SOP *terlewat* tanpa tercatat.
    - Laporan pelanggaran *tulis manual* — lambat, tidak efisien, sering lupa.
    - Tidak ada *data akurat* untuk evaluasi kepatuhan SOP.
  ]
]

#speak[Selama ini monitoring CCTV manual, Seorang Supervisor Perlu terus-menerus lihat layar, belum tentu efektif dan sudah pasti tidak efisien. Banyak pelanggaran SOP yang terlewat karena manpower kita terbatas. Sekarang saya tunjukkan solusinya.]

#tip[
  Kalau ada *contoh nyata* kejadian pelanggaran SOP yang pernah terlewat — ceritakan. Bos lebih relate kalau dengar kasus real.
]


// ═══════════════════════════════════════════════════════════
//  SECTION 2 — DEMO DASHBOARD
// ═══════════════════════════════════════════════════════════
#pagebreak()

#section("2", "DEMO — Fitur yang Sudah Jalan", emerald, "🖥️")

#text(size: 9pt, fill: muted)[
  _Buka dashboard di browser → login role Viewer → tunjukkan fitur satu per satu._
]
#v(0.5em)

// --- 2.1 Live Stream ---
#card("2.1 — Live Stream Panel", sky)[
  #feat("🟢", "Status Indicator", "Titik hijau = online, merah = offline — langsung kelihatan")
  #feat("📺", "LIVE Badge", "Badge \"LIVE\" merah berkedip saat streaming jalan")
  #feat("🕐", "Timestamp", "Waktu real-time di pojok kiri bawah stream")
  #feat("🔄", "Rotate", "Putar gambar landscape ↔ portrait sesuai posisi kamera")
  #feat("📸", "Snapshot", "1 klik → screenshot 1 frame langsung bisa dijadikan bukti")
  #feat("📐", "Resolution", "Pilih kualitas: 480p / 720p / 1080p / 1440p")
  #feat("▶️", "Auto-play", "Stream otomatis mulai saat engine sedang processing")
]

#speak[Ini tampilan utamanya. Supervisor tinggal buka browser — laptop, HP, tablet — langsung lihat CCTV live. Tidak perlu install aplikasi apapun. Dan kalau butuh bukti pelanggaran, tinggal klik Snapshot.]

#tip[
  Tekankan: *"Cuma butuh browser."* Ini penting karena artinya bos/supervisor bisa pantau dari mana saja — ruangan, HP di lapangan, bahkan dari rumah.
]

// --- 2.2 Activity Feed ---
#v(0.5em)
#card("2.2 — Real-time Activity Feed", amber)[
  #block(fill: darker, stroke: 0.5pt + slate, inset: 0.8em, radius: 5pt, width: 100%)[
    #text(font: ("Consolas", "Courier New"), size: 9pt)[
      #text(fill: rose)[🔴  Pelanggaran SOP detected] #h(1fr) #text(fill: muted)[10:05:23] \
      #text(fill: emerald)[🟢  Valid SOP compliance] #h(1fr) #text(fill: muted)[10:01:15] \
      #text(fill: emerald)[🟢  Valid SOP compliance] #h(1fr) #text(fill: muted)[09:52:10]
    ]
  ]
  #v(0.3em)
  #feat("⚡", "Real-time", "Event muncul langsung tanpa refresh halaman")
  #feat("⬆️", "Auto-scroll", "Event terbaru selalu paling atas")
  #feat("✨", "Animasi", "3 event terbaru ada animasi slide supaya menarik perhatian")
  #feat("🔢", "Counter", "Jumlah total events terlihat di pojok kanan")
]

#speak[Ini feed aktivitas real-time. Kalau AI mendeteksi ada pelanggaran, langsung muncul di sini. Warna merah artinya pelanggaran, warna hijau artinya patuh SOP. Semua otomatis, tanpa perlu input manual dari siapapun.]

#tip[
  Demo langsung: minta seseorang lewat depan kamera *tanpa helm/masker*, tunjukkan event merah muncul otomatis. Ini "wow moment" paling kuat.
]

// --- 2.3 Detection Stats ---
#pagebreak()
#card("2.3 — Detection Stats (Ringkasan Angka)", cyan)[
  #grid(
    columns: (1fr, 1fr, 1fr),
    gutter: 0.6em,
    block(fill: darker, stroke: 0.5pt + slate, inset: 0.7em, radius: 5pt)[
      #align(center)[
        #text(size: 8pt, fill: muted, weight: "bold")[DETECTIONS] \
        #text(size: 20pt, weight: "bold", fill: light)[320]
      ]
    ],
    block(fill: darker, stroke: 0.5pt + slate, inset: 0.7em, radius: 5pt)[
      #align(center)[
        #text(size: 8pt, fill: muted, weight: "bold")[VIOLATIONS] \
        #text(size: 20pt, weight: "bold", fill: rose)[24]
      ]
    ],
    block(fill: darker, stroke: 0.5pt + slate, inset: 0.7em, radius: 5pt)[
      #align(center)[
        #text(size: 8pt, fill: muted, weight: "bold")[COMPLIANCE] \
        #text(size: 20pt, weight: "bold", fill: emerald)[92%]
      ]
    ],
  )
  #v(0.3em)
  #feat("👥", "Active Tracks", "Jumlah orang yang sedang di-track AI saat ini")
  #feat("🎞️", "FPS", "Kelancaran stream / processing — optimal di 30 FPS")
]

#speak[Ini datanya: hari ini dari 320 orang yang terdeteksi, 24 ada pelanggaran. Tingkat kepatuhan SOP 92%. Angka ini update otomatis setiap detik. Bos bisa langsung lihat, tanpa perlu nunggu laporan akhir hari.]

#tip[
  Angka *compliance rate* ini yang paling penting buat bos. Sebutkan target-nya (misalnya 95%), bandingkan dengan aktual. Ini membantu bos lihat *gap* yang perlu dikejar.
]

// --- 2.4 Camera Info ---
#card("2.4 — Camera Info", emerald)[
  #block(fill: darker, stroke: 0.5pt + slate, inset: 0.8em, radius: 5pt, width: 100%)[
    #text(size: 10pt)[
      #text(fill: light, weight: "bold")[📷 Ruang Produksi] \
      #text(fill: muted, size: 9pt)[Pabrik Eskala] \
      #v(0.2em)
      #chip("Online", emerald) #h(0.5em) #chip("1080p", sky) #h(0.5em) #chip("30 FPS", cyan)
    ]
  ]
]

#speak[Di sini ada info kameranya: lokasi, resolusi, dan status. Kalau kamera mati atau ada masalah, langsung kelihatan statusnya berubah jadi offline.]


// ═══════════════════════════════════════════════════════════
//  SECTION 3 — ROLE VIEWER vs ADMIN
// ═══════════════════════════════════════════════════════════
#pagebreak()

#section("3", "Role Viewer vs Admin — Akses Berbeda", violet, "👥")

#block(fill: dark, stroke: 0.5pt + slate, inset: 1em, radius: 6pt, width: 100%, below: 1em)[
  #grid(
    columns: (1fr, 2.5cm, 2.5cm),
    gutter: 0.5em,
    text(size: 9pt, weight: "bold", fill: light)[Fitur],
    align(center)[#chip("Viewer", emerald)],
    align(center)[#chip("Admin", amber)],

    text(size: 9pt, fill: muted)[Lihat live stream],
    align(center)[#text(fill: emerald)[✅]],
    align(center)[#text(fill: emerald)[✅]],

    text(size: 9pt, fill: muted)[Lihat activity feed],
    align(center)[#text(fill: emerald)[✅]],
    align(center)[#text(fill: emerald)[✅]],

    text(size: 9pt, fill: muted)[Lihat statistik deteksi],
    align(center)[#text(fill: emerald)[✅]],
    align(center)[#text(fill: emerald)[✅]],

    text(size: 9pt, fill: muted)[Kontrol engine start/stop],
    align(center)[#text(fill: rose)[❌]],
    align(center)[#text(fill: amber)[⏳]],

    text(size: 9pt, fill: muted)[Verifikasi pelanggaran],
    align(center)[#text(fill: rose)[❌]],
    align(center)[#text(fill: amber)[⏳]],

    text(size: 9pt, fill: muted)[Export laporan lengkap],
    align(center)[#text(fill: rose)[❌]],
    align(center)[#text(fill: amber)[⏳]],

    text(size: 9pt, fill: muted)[Kelola kamera & settings],
    align(center)[#text(fill: rose)[❌]],
    align(center)[#text(fill: amber)[⏳]],
  )
]

#speak[Sekarang ini yang digunakan adalah akun role Viewer — khusus untuk monitoring. Kedepannya akan ditambahkan role Admin untuk kontrol engine, verifikasi pelanggaran, dan export laporan. Dengan pemisahan role ini, akses lebih aman dan terkontrol.]

#tip[
  Jelaskan *kenapa role dipisah*: keamanan. Viewer tidak bisa sembarangan matikan engine. Hanya orang yang ditunjuk (Admin) yang punya kontrol penuh.
]


// ═══════════════════════════════════════════════════════════
//  SECTION 4 — CARA KERJA
// ═══════════════════════════════════════════════════════════
#pagebreak()

#section("4", "Cara Kerja (Singkat, Non-Teknis)", sky, "⚙️")

#block(fill: dark, stroke: 0.5pt + slate, inset: 1.2em, radius: 8pt, width: 100%, below: 1em)[
  #align(center)[
    #grid(
      columns: (1fr, auto, 1fr, auto, 1fr, auto, 1fr),
      gutter: 0.3em,
      block(fill: darker, stroke: 0.5pt + slate, inset: (x: 0.5em, y: 0.8em), radius: 5pt)[
        #align(center)[
          #text(size: 16pt)[📷] \
          #text(size: 8pt, weight: "bold", fill: light)[CCTV] \
          #text(size: 7pt, fill: muted)[Kamera fisik]
        ]
      ],
      align(horizon)[#text(size: 14pt, fill: sky)[→]],
      block(fill: darker, stroke: 0.5pt + emerald, inset: (x: 0.5em, y: 0.8em), radius: 5pt)[
        #align(center)[
          #text(size: 16pt)[🧠] \
          #text(size: 8pt, weight: "bold", fill: emerald)[AI Engine] \
          #text(size: 7pt, fill: muted)[Deteksi orang]
        ]
      ],
      align(horizon)[#text(size: 14pt, fill: sky)[→]],
      block(fill: darker, stroke: 0.5pt + slate, inset: (x: 0.5em, y: 0.8em), radius: 5pt)[
        #align(center)[
          #text(size: 16pt)[🖥️] \
          #text(size: 8pt, weight: "bold", fill: amber)[Server] \
          #text(size: 7pt, fill: muted)[Simpan & kirim]
        ]
      ],
      align(horizon)[#text(size: 14pt, fill: sky)[→]],
      block(fill: darker, stroke: 0.5pt + sky, inset: (x: 0.5em, y: 0.8em), radius: 5pt)[
        #align(center)[
          #text(size: 16pt)[🌐] \
          #text(size: 8pt, weight: "bold", fill: sky)[Dashboard] \
          #text(size: 7pt, fill: muted)[Tampil di browser]
        ]
      ],
    )
    #v(0.5em)
    #text(size: 8pt, fill: muted)[
      Update ke browser secara *real-time* — pelanggaran muncul dalam hitungan detik.
    ]
  ]
]

#speak[Cara kerjanya simpel: CCTV tangkap gambar, AI Engine analisis otomatis, hasilnya langsung muncul di dashboard ini. Semua terjadi dalam hitungan detik. Kalau koneksi sempat putus, sistem otomatis reconnect.]

#tip[
  Jangan deep-dive ke bahasa teknis (Socket.IO, polling, fallback) kecuali bos tanya. Cukup bilang: "Semuanya otomatis dan sudah di-handle jika koneksi bermasalah."
]


// ═══════════════════════════════════════════════════════════
//  SECTION 5 — RENCANA KEDEPAN
// ═══════════════════════════════════════════════════════════
#pagebreak()

#section("5", "Rencana Pengembangan Selanjutnya", amber, "🚀")

#block(fill: dark, stroke: 0.5pt + slate, inset: 1em, radius: 6pt, width: 100%, below: 1em)[
  #grid(
    columns: (auto, 1fr, 2cm),
    gutter: (0.5em, 0.5em),
    chip("HIGH", rose),
    text(size: 9.5pt, fill: light, weight: "bold")[Photo Evidence — klik event langsung lihat foto bukti pelanggaran],
    align(center)[#text(fill: rose, size: 8pt, weight: "bold")[🔴]],

    chip("HIGH", rose),
    text(
      size: 9.5pt,
      fill: light,
      weight: "bold",
    )[Export CSV — download laporan harian/mingguan dalam format spreadsheet],
    align(center)[#text(fill: rose, size: 8pt, weight: "bold")[🔴]],

    chip("HIGH", rose),
    text(size: 9.5pt, fill: light, weight: "bold")[Role Admin — full control: engine, verifikasi, settings],
    align(center)[#text(fill: rose, size: 8pt, weight: "bold")[🔴]],

    chip("MEDIUM", amber),
    text(size: 9.5pt, fill: muted)[Notifikasi Telegram — alert otomatis ke HP saat ada pelanggaran],
    align(center)[#text(fill: amber, size: 8pt, weight: "bold")[🟡]],

    chip("MEDIUM", amber),
    text(size: 9.5pt, fill: muted)[Multi-camera — pilih antar kamera dari beberapa lokasi],
    align(center)[#text(fill: amber, size: 8pt, weight: "bold")[🟡]],

    chip("LOW", emerald),
    text(size: 9.5pt, fill: muted)[History Playback — replay rekaman deteksi masa lalu],
    align(center)[#text(fill: emerald, size: 8pt, weight: "bold")[🟢]],
  )
]

#speak[Ini rencana kedepannya. Yang paling prioritas: foto bukti pelanggaran yang sudah ada di lokal tapi belum terkoneksi ke website, kemudian export laporan ke spreadsheet, dan role admin. Fitur notifikasi website atau di dashboard admin dan multi-kamera menyusul setelahnya.]

#tip[
  Saat bilang rencana, *jangan bilang timeline estimasi* kecuali sudah pasti. Cukup bilang prioritas: "Yang pertama kita kerjakan ini, setelah itu ini." Bos lebih appreciate *kejelasan prioritas* daripada janji waktu yang tidak pasti.
]


// ═══════════════════════════════════════════════════════════
//  SECTION 6 — PENUTUP
// ═══════════════════════════════════════════════════════════
#v(1em)
#section("6", "Penutup — Key Takeaway", emerald, "✅")

#grid(
  columns: (1fr, 1fr),
  gutter: 1em,
  card("Sebelum", rose)[
    #text(size: 9.5pt, fill: muted)[
      - Monitoring manual, supervisor 8 jam nonaktif
      - Pelanggaran sering terlewat
      - Laporan tulis tangan / spreadsheet
      - Tidak ada data akurat & real-time
    ]
  ],
  card("Sesudah (Sekarang)", emerald)[
    #text(size: 9.5pt, fill: muted)[
      - AI deteksi otomatis 24/7
      - Pelanggaran tercatat real-time
      - Data kepatuhan langsung terlihat
      - Bisa dipantau dari HP / laptop manapun
    ]
  ],
)

#speak[Ringkasannya: dulu monitoring manual dan tidak efektif. Sekarang AI yang bekerja 24/7, datanya langsung muncul di dashboard, bisa diakses dari mana saja. Implementasi SOP jadi lebih efektif dan terukur.]


// ═══════════════════════════════════════════════════════════
//  CHECKLIST PERSIAPAN
// ═══════════════════════════════════════════════════════════
#pagebreak()

#align(center)[
  #text(size: 14pt, weight: "bold", fill: amber)[📋 Checklist Sebelum Presentasi]
  #v(0.3em)
]

#block(fill: dark, stroke: 0.5pt + slate, inset: 1em, radius: 6pt, width: 100%)[
  #grid(
    columns: (2em, 1fr),
    gutter: 0.4em,
    align(center)[☐], text(size: 9.5pt, fill: muted)[Dashboard sudah bisa diakses (cek URL, login berhasil)],
    align(center)[☐], text(size: 9.5pt, fill: muted)[CCTV nyala dan AI Engine running (stream tampil "LIVE")],
    align(center)[☐], text(size: 9.5pt, fill: muted)[Activity feed terisi event (bukan kosong)],
    align(center)[☐], text(size: 9.5pt, fill: muted)[Stats detection menunjukkan angka (bukan 0 semua)],
    align(center)[☐],
    text(
      size: 9.5pt,
      fill: muted,
    )[Siapkan "aktor" — minta seseorang lewat depan kamera tanpa helm/masker untuk demo live detection],

    align(center)[☐], text(size: 9.5pt, fill: muted)[Koneksi internet stabil (cek sebelum presentasi)],
    align(center)[☐], text(size: 9.5pt, fill: muted)[Latihan sekali runthrough alur ini (5-10 menit)],
  )
]

#v(1em)
#align(center)[
  #text(size: 9pt, fill: muted, style: "italic")[
    Dokumen ini hanya panduan alur presentasi. \
    Yang dipresentasikan adalah *dashboard live* — bukan slide ini.
  ]
]
