import {
  Bell,
  ShieldAlert,
  ShieldCheck,
  Activity,
  CameraOff,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotificationContext } from "../../contexts/NotificationContext";

// ── Severity config ────────────────────────────────────────────────────────

const SEVERITY = {
  critical: {
    dot: "bg-rose-500",
    badge: "bg-rose-100 text-rose-700",
    icon: ShieldAlert,
    iconColor: "text-rose-500",
    bg: "hover:bg-rose-50/60",
  },
  warning: {
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
    icon: CameraOff,
    iconColor: "text-amber-500",
    bg: "hover:bg-amber-50/60",
  },
  info: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
    icon: ShieldCheck,
    iconColor: "text-emerald-500",
    bg: "hover:bg-emerald-50/60",
  },
  system: {
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700",
    icon: Activity,
    iconColor: "text-blue-500",
    bg: "hover:bg-blue-50/60",
  },
};

function getSeverityConfig(severity) {
  return SEVERITY[severity] ?? SEVERITY.info;
}

// ── Individual notification item ───────────────────────────────────────────

function NotifItem({ notif, onRead }) {
  const cfg = getSeverityConfig(notif.severity);
  const Icon = cfg.icon;

  return (
    <button
      onClick={() => onRead(notif.id)}
      className={`w-full flex items-start gap-3 px-4 py-3 transition-colors text-left ${cfg.bg} ${notif.read ? "opacity-60" : ""}`}
    >
      {/* Unread dot */}
      <span className="shrink-0 mt-1.5">
        {notif.read ? (
          <span className="h-2 w-2 block rounded-full bg-transparent" />
        ) : (
          <span className={`h-2 w-2 block rounded-full ${cfg.dot}`} />
        )}
      </span>

      {/* Icon */}
      <div className={`shrink-0 mt-0.5 ${cfg.iconColor}`}>
        <Icon size={15} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold text-slate-800 leading-tight ${notif.read ? "font-medium" : ""}`}
        >
          {notif.title}
        </p>
        {notif.description && (
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {notif.description}
          </p>
        )}
        <p className="text-[10px] text-slate-400 mt-1">{notif.relativeTime}</p>
      </div>
    </button>
  );
}

// ── Main dropdown ──────────────────────────────────────────────────────────

/**
 * Notification dropdown panel.
 *
 * @param {boolean} isOpen - controlled by parent (Bell button toggle)
 */
export default function NotificationDropdown({ isOpen }) {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    relativeTime,
  } = useNotificationContext();

  if (!isOpen) return null;

  // Enrich with relativeTime string for display
  const enriched = notifications.map((n) => ({
    ...n,
    relativeTime: relativeTime(n.createdAt),
  }));

  const handleRead = (id) => {
    markAsRead(id);
    const notif = notifications.find((n) => n.id === id);
    if (notif?.type === "violation") {
      navigate("/dashboard/history");
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-slate-800">Notifikasi</h4>
          {unreadCount > 0 && (
            <span className="flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-rose-100 text-[10px] font-bold text-rose-600">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-[11px] text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            ✓ Tandai semua dibaca
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
        {enriched.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <Bell size={28} className="text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-500">
              Belum ada notifikasi
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Notifikasi pelanggaran SOP akan muncul di sini secara real-time
            </p>
          </div>
        ) : (
          enriched.map((notif) => (
            <NotifItem key={notif.id} notif={notif} onRead={handleRead} />
          ))
        )}
      </div>

      {/* Footer */}
      {enriched.length > 0 && (
        <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/50">
          <button
            onClick={() => navigate("/dashboard/history")}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Lihat semua riwayat insiden →
          </button>
        </div>
      )}
    </div>
  );
}
