/**
 * React hooks for Socket.IO integration.
 *
 * useSocket()      — Manages connection lifecycle, returns { isConnected, emit }
 * useSocketEvent() — Subscribes to a single socket event with auto-cleanup
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { connectSocket, disconnectSocket, getSocket } from "../services/socket";

/**
 * Hook that manages the Socket.IO connection lifecycle.
 *
 * - Connects on mount, disconnects on unmount.
 * - Tracks connection state reactively.
 * - Provides a stable `emit` function.
 *
 * @returns {{ isConnected: boolean, emit: (event: string, data?: any) => void }}
 */
export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onConnectError = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    // Sync initial state (may already be connected from another hook)
    setIsConnected(socket.connected);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      disconnectSocket();
    };
  }, []);

  const emit = useCallback((event, data) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit(event, data);
    } else {
      console.warn(`[useSocket] Cannot emit "${event}" — socket not connected`);
    }
  }, []);

  return { isConnected, emit };
}

/**
 * Hook that subscribes to a Socket.IO event and calls `handler` on each message.
 *
 * The handler reference is kept fresh via a ref so the effect doesn't
 * re-subscribe on every render. Unsubscribes automatically on unmount.
 *
 * @param {string} eventName - Socket.IO event name to listen for
 * @param {(...args: any[]) => void} handler - Callback invoked with event data
 */
export function useSocketEvent(eventName, handler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const socket = getSocket();

    const wrappedHandler = (...args) => {
      handlerRef.current(...args);
    };

    socket.on(eventName, wrappedHandler);
    return () => {
      socket.off(eventName, wrappedHandler);
    };
  }, [eventName]);
}
