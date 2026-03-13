# One-Shot Prompt: Backend CCTV SOP Detection Server Setup

## Context
Dashboard CCTV SOP berhasil di-deploy ke Vercel dan perlu terhubung ke backend Flask via Cloudflare Tunnel.

## Current Configuration

### Dashboard (Frontend)
- **URL**: https://dashboard-cdzeqmfrm-it-core-foodinesias-projects.vercel.app
- **API Base URL**: `https://api.foodiserver.my.id`
- **WebSocket URL**: `https://api.foodiserver.my.id`

### Expected API Endpoints
Frontend expects these endpoints from backend:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Return engine status, camera info, stream status |
| `/api/stats` | GET | Return detection stats (total, violations, valid, compliance) |
| `/api/stream/video` | GET | MJPEG video stream for `<img>` tag |
| `/api/stream/snapshot` | GET | JPEG snapshot image |
| `/api/engine/start` | POST | Start detection engine |
| `/api/engine/stop` | POST | Stop detection engine |
| `/socket.io/` | WebSocket | Socket.IO connection for real-time events |

### Expected Response Format

**GET /api/status**
```json
{
  "engine_status": "running" | "stopped" | "error",
  "camera_name": "Camera 1",
  "camera_location": "Plant A",
  "camera_status": "online" | "offline",
  "resolution": "1080p",
  "fps": 30,
  "stream_status": "live" | "offline"
}
```

**GET /api/stats**
```json
{
  "total_valid": 100,
  "total_pelanggaran": 5,
  "fps": 30,
  "active_tracks": 10
}
```

**GET /api/stream/video**
- Content-Type: `multipart/x-mixed-replace; boundary=frame`
- MJPEG stream for HTML `<img>` tag

**GET /api/stream/snapshot**
- Content-Type: `image/jpeg`
- Single JPEG frame

### Socket.IO Events (Backend → Frontend)
- `engine_status` - `{ status, message? }`
- `stats_update` - `{ date, total_valid, total_pelanggaran, fps, active_tracks, engine_status }`
- `detection_event` - `{ id, name, status, track_id, timestamp, photo_path }`
- `log` - `{ message, level, timestamp }`
- `snapshot` - `{ image (base64), detections[], timestamp }`

### Socket.IO Events (Frontend → Backend)
- `engine_command` - `{ command: 'start'|'stop'|'restart'|'reload_identities' }`
- `request_snapshot` - no payload

## CRITICAL: CORS Configuration

Backend MUST allow CORS from Vercel domain:

```python
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit

app = Flask(__name__)

# Allow specific origins (recommended for production)
CORS(app, origins=[
    "https://dashboard-cdzeqmfrm-it-core-foodinesias-projects.vercel.app",
    "https://dashboard-tawny-six-91.vercel.app",
    "http://localhost:5173"  # for local dev
], supports_credentials=True)

# OR allow all origins (development only - less secure)
# CORS(app, origins="*")

socketio = SocketIO(app, cors_allowed_origins=[
    "https://dashboard-cdzeqmfrm-it-core-foodinesias-projects.vercel.app",
    "https://dashboard-tawny-six-91.vercel.app",
    "http://localhost:5173"
])
```

## CRITICAL: Cloudflare Tunnel Setup

Ensure Cloudflare Tunnel forwards to Flask backend:

```yaml
# cloudflared config.yml
tunnel: <your-tunnel-id>
credentials-file: /path/to/credentials.json

ingress:
  - hostname: api.foodiserver.my.id
    service: http://localhost:5001  # Flask server port
  - service: http_status:404
```

Restart tunnel after config changes:
```bash
cloudflared tunnel restart <tunnel-id>
# or
cloudflared tunnel run <tunnel-id>
```

## Test Commands

Test API dari local:
```bash
# Test status endpoint
curl -i https://api.foodiserver.my.id/api/status

# Test with origin header (simulates browser)
curl -i -H "Origin: https://dashboard-cdzeqmfrm-it-core-foodinesias-projects.vercel.app" \
  https://api.foodiserver.my.id/api/status

# Check CORS headers
# Should see: Access-Control-Allow-Origin: *
```

## Troubleshooting Checklist

- [ ] Flask server running on port 5001
- [ ] CORS enabled with correct origins
- [ ] Cloudflare tunnel running and pointing to localhost:5001
- [ ] All endpoints `/api/status`, `/api/stats`, `/api/stream/*` implemented
- [ ] Socket.IO initialized with cors_allowed_origins
- [ ] `Access-Control-Allow-Origin` header present in responses

## Sample Flask Implementation

```python
from flask import Flask, jsonify, Response
from flask_cors import CORS
from flask_socketio import SocketIO
import cv2

app = Flask(__name__)
CORS(app, origins="*")  # Configure properly for production

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

@app.route('/api/status')
def status():
    return jsonify({
        "engine_status": "running",
        "camera_name": "CCTV 01",
        "camera_location": "Plant A",
        "camera_status": "online",
        "resolution": "1080p",
        "fps": 30,
        "stream_status": "live"
    })

@app.route('/api/stats')
def stats():
    return jsonify({
        "total_valid": 100,
        "total_pelanggaran": 5,
        "fps": 30,
        "active_tracks": 10
    })

@app.route('/api/stream/video')
def video_stream():
    def generate():
        # Your MJPEG generator logic
        pass
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/stream/snapshot')
def snapshot():
    # Return single JPEG frame
    pass

@app.route('/api/engine/<action>', methods=['POST'])
def engine_control(action):
    # Handle start/stop
    return jsonify({"status": "success", "action": action})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5001)
```

## Deliverables
1. Backend Flask dengan semua endpoint di atas
2. CORS configured untuk domain Vercel
3. Cloudflare Tunnel aktif dan routing benar
4. Socket.IO events emitting ke frontend
