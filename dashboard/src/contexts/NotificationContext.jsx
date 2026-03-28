import { createContext, useContext } from "react";
import { useNotifications } from "../hooks/useNotifications";

const NotificationContext = createContext(null);

/**
 * Provides global notification state to the entire app.
 * Consumes useNotifications internally so only one Supabase/Socket subscription exists.
 */
export function NotificationProvider({ children }) {
  const value = useNotifications();

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider",
    );
  }
  return ctx;
}
