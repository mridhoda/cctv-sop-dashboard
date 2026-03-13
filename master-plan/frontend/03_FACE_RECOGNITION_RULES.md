# 📋 Face Recognition Rules — Master Plan

> Dokumen ini menjelaskan aturan-aturan yang berlaku ketika fitur **Face Recognition** diaktifkan atau dinonaktifkan di dashboard VisionGuard AI.

---

## 🎯 Ringkasan Fitur

Fitur Face Recognition merupakan **premium feature** yang memungkinkan sistem:

1. Mengenali identitas staff berdasarkan wajah
2. Menampilkan nama staff di riwayat insiden
3. Mengelola database identitas staff

---

## 🔄 State Management

### Storage

- **localStorage key**: `faceRecognitionEnabled`
- **API field**: `enable_face_recognition` (1 = aktif, 0 = nonaktif)
- **Default**: `false` (nonaktif)

### Hook yang Digunakan

- `useConfig()` — mengambil konfigurasi dari backend
- `useFaceRecognition()` — custom hook untuk akses cepat state face recognition

---

## 📊 Rules Matrix

| Komponen/Feature              | Face Recognition ON ✅     | Face Recognition OFF ❌     |
| ----------------------------- | -------------------------- | --------------------------- |
| **Sidebar Menu**              |                            |                             |
| "Identitas Staff"             | ✅ Muncul di sidebar       | ❌ Tersembunyi              |
| **Settings Page**             |                            |                             |
| Card "Face Recognition"       | ✅ Muncul dengan toggle ON | ✅ Muncul dengan toggle OFF |
| Note premium                  | ✅ Ditampilkan             | ✅ Ditampilkan              |
| **History/Riwayat Page**      |                            |                             |
| Kolom "Nama Staff"            | ✅ Ditampilkan             | ❌ Disembunyikan            |
| Filter by Staff               | ✅ Aktif                   | ❌ Dinonaktifkan            |
| **Dashboard Home**            |                            |                             |
| Kolom "Nama" di tabel insiden | ✅ Ditampilkan             | ❌ Disembunyikan            |
| **Monitoring Page**           |                            |                             |
| Overlay nama staff di video   | ✅ Ditampilkan             | ❌ Tidak ditampilkan        |
| **Identitas Page**            |                            |                             |
| Akses halaman                 | ✅ Bisa diakses            | ❌ Redirect ke Dashboard    |
| **Reports Page**              |                            |                             |
| Filter by staff               | ✅ Aktif                   | ❌ Dinonaktifkan            |
| Kolom staff di export         | ✅ Ditampilkan             | ❌ Disembunyikan            |

---

## 🧩 Implementasi Detail

### 1. Hook: useFaceRecognition.js

```javascript
// Hook untuk akses state face recognition
export function useFaceRecognition() {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem("faceRecognitionEnabled") === "true";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setEnabled(localStorage.getItem("faceRecognitionEnabled") === "true");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return {
    enabled,
    toggle: (value) => {
      localStorage.setItem("faceRecognitionEnabled", String(value));
      setEnabled(value);
    },
  };
}
```

### 2. Sidebar Navigation (App.jsx)

```javascript
// Identitas menu hanya muncul jika face recognition aktif
{
  hasPermission("identities") && faceRecognitionEnabled && (
    <button onClick={() => setActiveTab("identities")}>
      <Users size={20} /> Identitas Staff
    </button>
  );
}
```

### 3. AuthContext Modification

Tambahkan logika untuk mengecek face recognition state saat menentukan permissions:

```javascript
// Di getAllowedTabs() atau hasPermission()
const faceRecognitionEnabled =
  localStorage.getItem("faceRecognitionEnabled") === "true";

if (permission === "identities" && !faceRecognitionEnabled) {
  return false;
}
```

### 4. History.jsx Table

```javascript
// Header tabel
<thead>
  <tr>
    <th>Waktu</th>
    {faceRecognitionEnabled && <th>Nama Staff</th>}
    <th>Lokasi</th>
    <th>Jenis</th>
  </tr>
</thead>

// Body tabel
<tbody>
  {incidents.map((item) => (
    <tr>
      <td>{item.time}</td>
      {faceRecognitionEnabled && <td>{item.staff_name || "—"}</td>}
      <td>{item.location}</td>
      <td>{item.type}</td>
    </tr>
  ))}
</tbody>
```

### 5. DashboardHomeTab (App.jsx)

```javascript
// Tabel insiden terbaru
<table>
  <thead>
    <tr>
      <th>Waktu</th>
      {faceRecognitionEnabled && <th>Nama</th>}
      <th>Lokasi</th>
      <th>Jenis</th>
    </tr>
  </thead>
</table>
```

---

## 🎨 UI/UX Considerations

### Toggle di Settings

- Letak: Card "Fitur Face Recognition" di bawah Telegram
- Style: Toggle switch dengan label jelas
- Feedback: Toast notification saat toggle berubah

### Empty States

- Saat face recognition OFF, kolom nama dihilangkan sepenuhnya (bukan ditampilkan sebagai "—")
- Table tetap responsive tanpa kolom tambahan

### Transitions

- Sidebar menu muncul/hilang dengan animasi smooth
- Table columns resize dengan animasi CSS transition

---

## 🔒 Security & Permissions

1. **Permission Check**: Identitas menu hanya muncul jika:
   - User memiliki permission `identities`
   - **DAN** face recognition diaktifkan

2. **Route Guard**: Jika user mencoba akses `/identities` langsung via URL saat face recognition OFF:
   - Redirect ke Dashboard
   - Tampilkan toast: "Fitur Face Recognition belum diaktifkan"

---

## 🧪 Testing Checklist

- [ ] Toggle ON → Menu Identitas muncul di sidebar
- [ ] Toggle OFF → Menu Identitas hilang dari sidebar
- [ ] Toggle ON → Kolom "Nama Staff" muncul di History
- [ ] Toggle OFF → Kolom "Nama Staff" hilang dari History
- [ ] Toggle ON → Kolom "Nama" muncul di Dashboard table
- [ ] Toggle OFF → Kolom "Nama" hilang dari Dashboard table
- [ ] State persist setelah refresh (localStorage)
- [ ] State sync dengan backend (API config)
- [ ] Route guard berfungsi saat akses langsung ke Identitas page

---

## 📝 Catatan Implementasi

1. **LocalStorage First**: UI mengikuti localStorage untuk responsifitas, lalu sync dengan API
2. **API Sync**: Saat settings disimpan, `enable_face_recognition` dikirim ke backend
3. **No Breaking Changes**: Jika user upgrade dari versi lama tanpa localStorage, default adalah OFF
4. **Consistent Naming**: Gunakan `faceRecognitionEnabled` (camelCase) untuk variable, `enable_face_recognition` (snake_case) untuk API field

---

## 🔗 Related Files

| File                              | Purpose                                  |
| --------------------------------- | ---------------------------------------- |
| `src/hooks/useFaceRecognition.js` | Custom hook untuk state face recognition |
| `src/hooks/useConfig.js`          | Hook untuk konfigurasi dari API          |
| `src/pages/Settings.jsx`          | Toggle face recognition                  |
| `src/App.jsx`                     | Sidebar navigation & Dashboard table     |
| `src/pages/History.jsx`           | Riwayat insiden table                    |
| `src/contexts/AuthContext.jsx`    | Permission management                    |

---

_Last updated: March 2026_
