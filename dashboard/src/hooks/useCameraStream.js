import { useEffect, useState } from "react";
import { useSocket, useSocketEvent } from "./useSocket";

/**
 * Hook for subscribing to a camera's real-time stream via WebSocket.
 * Returns the latest frame (base64), detections array, and connection status.
 *
 * @param {string|null} cameraId - Camera ID to subscribe to, or null for none
 */
export function useCameraStream(cameraId) {
  const { isConnected, emit } = useSocket();
  const [frame, setFrame] = useState(null);
  const [detections, setDetections] = useState([]);

  // Subscribe/unsubscribe to camera room whenever cameraId changes
  useEffect(() => {
    if (!cameraId || !isConnected) return;

    emit("subscribe_camera", { camera_id: cameraId });

    return () => {
      emit("unsubscribe_camera", { camera_id: cameraId });
      setFrame(null);
      setDetections([]);
    };
  }, [cameraId, isConnected, emit]);

  // Listen for frames from this camera
  useSocketEvent("frame", (data) => {
    if (data.camera_id === cameraId) {
      setFrame(data.frame);
    }
  });

  // Listen for detection events
  useSocketEvent("detection_event", (data) => {
    if (data.camera_id === cameraId) {
      setDetections((prev) => [data, ...prev].slice(0, 20));
    }
  });

  return { frame, detections, isConnected };
}
