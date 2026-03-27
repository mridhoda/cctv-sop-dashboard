# 📡 Streaming Architecture Plan

> **Rencana migrasi streaming** dari MJPEG (prototype) ke WebRTC (production-grade, scalable, siap jual)

---

## 🎯 Tujuan

Membangun infrastruktur streaming video CCTV yang:

- **Low-latency** (<1 detik delay) untuk live monitoring
- **Scalable** (bisa handle banyak kamera & banyak user)
- **Siap dijual** (tanpa install software apapun di sisi pelanggan)
- **Cost-efficient** (pakai Cloudflare ekosistem yang sudah ada)

---

## 📊 Perbandingan Teknologi Streaming

| Fitur                    | MJPEG (Sekarang)  | WebRTC + Go2RTC (Target) | WebSocket Video    |
| :----------------------- | :---------------- | :----------------------- | :----------------- |
| **Latency**              | ~0.5-2 detik      | <1 detik                 | ~1-3 detik         |
| **Bandwidth**            | ❌ Sangat Boros   | ✅ Irit (H.264 kompresi) | ❌ Boros           |
| **Beban Server**         | ❌ Berat          | ✅ Ringan                | ❌ Sangat Berat    |
| **Audio Support**        | ❌ Tidak Ada      | ✅ Ada                   | ❌ Tidak Ada       |
| **Browser Support**      | ✅ Native `<img>` | ✅ Native WebRTC         | ⚠️ Perlu coding JS |
| **Cloudflare Tunnel**    | ✅ OK             | ✅ OK (Signaling)        | ✅ OK              |
| **Scalability**          | ❌ Buruk          | ✅ Excellent             | ❌ Buruk           |
| **Setup Complexity**     | Sangat Mudah      | Sedang                   | Sangat Sulit       |
| **Cocok untuk Produksi** | ❌ Tidak          | ✅ Ya                    | ❌ Tidak           |

---

## 🏗️ Arsitektur Target (Produksi)

```
┌─────────────────────────────────────────────────────────┐
│                    SISI CLIENT                          │
│  Browser (React Dashboard)                              │
│  - Video: WebRTC via WHEP protocol                      │
│  - Data:  Socket.IO (events, stats, detections)         │
│  - Auth:  Supabase Auth (JWT)                           │
└───────────────┬──────────────┬──────────────────────────┘
                │ HTTPS/WSS    │ WSS (Socket.IO)
                ▼              ▼
┌──────────────────────────────────────────────────────────┐
│              CLOUDFLARE (Existing)                        │
│  - Tunnel: HTTP/HTTPS/WebSocket ✅                        │
│  - TURN: Relay media UDP untuk WebRTC ✅                  │
│  - CDN: Serve HLS rekaman video ✅                        │
└──────────┬───────────────────┬───────────────────────────┘
           │ Tunnel            │ TURN relay (UDP)
           ▼                   ▼
┌──────────────────────────────────────────────────────────┐
│              SERVER (Di Lokasi Pelanggan)                 │
│                                                           │
│  ┌─────────────┐    ┌──────────────────┐                 │
│  │   Go2RTC    │    │  Flask AI Server │                 │
│  │  (Port 8554)│    │  (V2_Project)    │                 │
│  │             │◄───│                  │                 │
│  │ RTSP → WebRTC    │ - Deteksi SOP    │                 │
│  │ RTSP → HLS  │    │ - Socket.IO      │                 │
│  │ RTSP → MJPEG│    │ - REST API       │                 │
│  └──────┬──────┘    └──────────────────┘                 │
│         │                                                  │
│         ▼ RTSP                                             │
│  ┌──────────────┐                                          │
│  │ CCTV Kamera  │                                          │
│  └──────────────┘                                          │
└──────────────────────────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Supabase   │
                    │ (Database)  │
                    └─────────────┘
```

---

## 🛠️ Komponen Utama

### 1. Go2RTC — Media Server

**Apa itu?** Server ringan open-source yang mengerti RTSP (bahasa kamera) dan bisa mengubahnya ke WebRTC, HLS, atau MJPEG.

**Kenapa Go2RTC, bukan yang lain?**

- Satu file binary (sangat mudah diinstall)
- Gratis & open-source
- Sudah dipakai jutaan device (Home Assistant)
- Support `rtsp://`, `rtsps://`, `ffmpeg`, dan banyak sumber lain
- Built-in WebRTC server tanpa setup rumit

**Cara Install:**

```bash
# Linux / Raspberry Pi
wget https://github.com/AlexxIT/go2rtc/releases/latest/download/go2rtc_linux_amd64
chmod +x go2rtc_linux_amd64
./go2rtc_linux_amd64
```

**Konfigurasi `go2rtc.yaml`:**

```yaml
streams:
  # Tambahkan kamera kamu di sini
  kamera_utama: rtsp://user:pass@192.168.1.100:554/stream1
  kamera_gudang: rtsp://user:pass@192.168.1.101:554/stream1

api:
  listen: ":1984" # Port untuk dashboard Go2RTC

webrtc:
  listen: ":8555/tcp" # Port untuk WebRTC
  candidates:
    - stun:stun.cloudflare.com:3478 # Cloudflare STUN
  ice_servers:
    - urls: [turn:turn.cloudflare.com] # Cloudflare TURN
      username: "DARI_CLOUDFLARE_DASHBOARD"
      credential: "DARI_CLOUDFLARE_DASHBOARD"
```

---

### 2. Cloudflare TURN — Media Relay

**Apa itu?** Server perantara milik Cloudflare yang membantu video WebRTC melewati firewall/NAT.

**Kenapa dibutuhkan?** WebRTC media (UDP) tidak bisa lewat Cloudflare Tunnel. TURN menjadi "makelar" agar video tetap sampai ke browser.

**Cara Aktifkan:**

1. Cloudflare Dashboard → **Calls** → Enable
2. Dapatkan `turn:` credentials
3. Masukkan ke konfigurasi Go2RTC (lihat di atas)
4. **Biaya**: Gratis sampai 1 TB/bulan (sangat cukup untuk puluhan kamera)

---

### 3. Frontend Integration

**Library yang dibutuhkan:**

```bash
# Tidak perlu library tambahan!
# WebRTC sudah built-in di browser modern
# Untuk HLS playback (rekaman):
npm install hls.js
```

**Cara pakai di React (Live View):**

```jsx
// Ganti <img src={streamUrl} /> dengan ini:
function CameraStreamWebRTC({ cameraName }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }]
    });

    // Minta stream dari Go2RTC (WHEP protocol)
    fetch(`https://api.foodiserver.my.id/go2rtc/api/webrtc?src=${cameraName}`, {
      method: "POST",
      body: new RTCSessionDescription(await pc.createOffer()).sdp,
    });

    pc.ontrack = (e) => { videoRef.current.srcObject = e.streams[0]; };

    return () => pc.close();
  }, [cameraName]);

  return <video ref={videoRef} autoPlay playsInline muted />;
}
```

---

## 🗺️ Roadmap Migrasi

### Phase 1 — Sekarang (Prototype) ✅ DONE

> **Status**: Berjalan dengan MJPEG

- [x] MJPEG streaming via Flask
- [x] Socket.IO untuk events real-time
- [x] Cloudflare Tunnel untuk akses publik

---

### Phase 2 — Saat Cari Investor / Pelanggan Pertama 🎯 NEXT

> **Target**: Q2/Q3 2026 | **Effort**: ~1 minggu

- [ ] Install Go2RTC di server lapangan
- [ ] Konfigurasi Cloudflare TURN credentials
- [ ] Expose Go2RTC via Cloudflare Tunnel
- [ ] Update React komponen dari `<img>` (MJPEG) ke `RTCPeerConnection` (WebRTC)
- [ ] Test di lapangan dengan 2-4 kamera

**Apa yang TIDAK berubah:**

- Supabase (database tetap)
- Flask AI Server (deteksi tetap)
- Socket.IO (events tetap)
- Dashboard UI (hanya bagian video yang berubah)

---

### Phase 3 — Saat Scale (10+ Pelanggan) 🚀 FUTURE

> **Target**: Q4 2026 | **Effort**: ~3-4 minggu

- [ ] HLS recording via Go2RTC (rekaman otomatis disimpan)
- [ ] Cloudflare CDN untuk serve rekaman video
- [ ] Multi-tenant Go2RTC management (setiap pelanggan punya instance)
- [ ] Dashboard untuk manage stream per tenant
- [ ] Monitoring uptime kamera (via heartbeat)

---

## 💰 Estimasi Biaya (Per Pelanggan)

| Komponen               | Biaya Bulanan                 |
| :--------------------- | :---------------------------- |
| Cloudflare TURN (1 TB) | **Gratis**                    |
| Cloudflare Tunnel      | **Gratis**                    |
| Go2RTC (Open Source)   | **Gratis**                    |
| Server lapangan        | Sudah ada di lokasi pelanggan |
| Supabase (Free tier)   | **Gratis** (sampai 500 MB DB) |

**Total biaya infrastruktur streaming: Rp 0 / bulan per pelanggan** ✅

(Berbeda dengan solusi cloud streaming seperti AWS Kinesis yang bisa jutaan rupiah/bulan)

---

## ⚠️ Hal yang Perlu Diperhatikan

1. **Setiap lokasi pelanggan butuh Go2RTC** — ini harus diinstall di server yang sama dengan AI Engine kamu. Bukan di cloud.

2. **Kamera harus output H.264** — kalau kamera pakai H.265/HEVC, Go2RTC harus transcode dulu (butuh CPU lebih). Cek spesifikasi kamera pelanggan sebelum deploy.

3. **Internet upload yang cukup** — WebRTC tetap butuh bandwidth upload dari server ke cloud. Minimal 2 Mbps per kamera untuk kualitas 720p.

4. **Cloudflare TURN belum tersedia di semua region** — kalau belum ada di region kamu, gunakan Metered.ca ($0.30/GB) sebagai alternatif sementara.

---

## 📚 Referensi

- [Go2RTC GitHub](https://github.com/AlexxIT/go2rtc)
- [Cloudflare Calls (TURN)](https://developers.cloudflare.com/calls/)
- [WebRTC WHEP Protocol Spec](https://www.ietf.org/archive/id/draft-ietf-wish-whep-01.txt)

---

**Dibuat**: 2026-03-27  
**Diperbarui**: 2026-03-27  
**Status**: Rencana Phase 2 siap dieksekusi saat produk siap go-to-market
