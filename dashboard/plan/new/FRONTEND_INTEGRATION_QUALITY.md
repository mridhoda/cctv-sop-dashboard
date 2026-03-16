# Frontend Integration: Adaptive Quality Streaming

Panduan untuk mengintegrasikan fitur quality selector di dashboard frontend.

## API Reference

### 1. Get Available Qualities

```
GET /api/stream/qualities
```

**Response:**
```json
{
  "qualities": [
    { "key": "144p",  "label": "144p",  "scale": 0.25, "jpeg_quality": 40, "max_fps": 8,  "default": false },
    { "key": "360p",  "label": "360p",  "scale": 0.50, "jpeg_quality": 60, "max_fps": 12, "default": false },
    { "key": "720p",  "label": "720p",  "scale": 0.75, "jpeg_quality": 80, "max_fps": 15, "default": true  },
    { "key": "1080p", "label": "1080p", "scale": 1.00, "jpeg_quality": 90, "max_fps": 15, "default": false }
  ]
}
```

### 2. Stream Video dengan Quality

```
GET /api/stream/video?quality={tier}
```

Parameter `quality`: `144p` | `360p` | `720p` | `1080p` (default: `720p`)

### 3. Snapshot dengan Quality

```
GET /api/stream/snapshot?quality={tier}
```

## Contoh Implementasi (React)

### Quality Selector Component

```jsx
import { useState, useEffect } from 'react';

function QualitySelector({ onQualityChange }) {
  const [qualities, setQualities] = useState([]);
  const [selected, setSelected] = useState('720p');

  useEffect(() => {
    fetch('/api/stream/qualities')
      .then(res => res.json())
      .then(data => {
        setQualities(data.qualities);
        const def = data.qualities.find(q => q.default);
        if (def) setSelected(def.key);
      });
  }, []);

  const handleChange = (key) => {
    setSelected(key);
    onQualityChange(key);
  };

  return (
    <div className="quality-selector">
      {qualities.map(q => (
        <button
          key={q.key}
          className={selected === q.key ? 'active' : ''}
          onClick={() => handleChange(q.key)}
        >
          {q.label}
        </button>
      ))}
    </div>
  );
}
```

### Live Stream Component

```jsx
function LiveStream({ quality = '720p' }) {
  const streamUrl = `/api/stream/video?quality=${quality}`;

  return (
    <div className="stream-container">
      <img
        src={streamUrl}
        alt="Live Stream"
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  );
}
```

### Gabungkan Keduanya

```jsx
function DashboardStream() {
  const [quality, setQuality] = useState('720p');

  return (
    <div>
      <LiveStream quality={quality} />
      <QualitySelector onQualityChange={setQuality} />
    </div>
  );
}
```

## Catatan Penting

1. **Ganti kualitas = ganti URL stream** — ketika user memilih kualitas baru,
   update `src` pada `<img>`. Browser otomatis reconnect ke URL baru.

2. **Default quality adalah `720p`** — keseimbangan terbaik antara kualitas dan bandwidth.

3. **`1080p` tidak melakukan resize/re-encode** — langsung passthrough dari engine
   untuk performa maksimal di jaringan LAN.

4. **FPS juga berkurang di tier rendah** — `144p` = 8fps, `360p` = 12fps
   untuk penghematan bandwidth tambahan.
