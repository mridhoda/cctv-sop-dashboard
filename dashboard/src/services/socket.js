/**
 * Socket.IO Connection Manager
 *
 * Singleton socket instance for communicating with the V2 engine server.
 * Server: Flask + SocketIO at http://localhost:5001 (path: /socket.io/)
 *
 * Dashboard clients require NO authentication — just connect and listen.
 *
 * Events received from server:
 *   - engine_status  → { status, message? }
 *   - stats_update   → { date, total_valid, total_pelanggaran, fps, active_tracks, engine_status }
 *   - detection_event → { id, name, status, track_id, timestamp, photo_path }
 *   - log            → { message, level, timestamp }
 *   - snapshot       → { image (base64), detections[], timestamp }
 *
 * Events the dashboard can emit:
 *   - engine_command   → { command: 'start'|'stop'|'restart'|'reload_identities' }
 *   - request_snapshot → (no payload)
 */
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE || "http://localhost:5001";

let socket = null;

/**
 * Get or create the singleton socket instance.
 * Socket is created with autoConnect: false — call connectSocket() to connect.
 */
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

/**
 * Connect the socket if not already connected.
 * @returns {import("socket.io-client").Socket}
 */
export function connectSocket() {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

/**
 * Disconnect the socket gracefully.
 */
export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}

export { SOCKET_URL };
