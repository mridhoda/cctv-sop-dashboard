import { useState, useMemo } from "react";
import {
  Camera,
  Plus,
  Play,
  Square,
  Trash2,
  Edit2,
  Wifi,
  WifiOff,
  Search,
  AlertTriangle,
  RefreshCw,
  MapPin,
  RotateCw,
  Video,
  VideoOff,
} from "lucide-react";
import {
  useCameras,
  useCreateCamera,
  useUpdateCamera,
  useDeleteCamera,
  useCameraControl,
} from "../hooks/useCameras";
import { CameraFormModal } from "../components/camera/CameraFormModal";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { useToast } from "../components/ui/Toast";
import { cn } from "../utils/cn";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const getCameraStatus = (cam) => {
  if (cam.status === "error") return "error";
  if (cam.status === "online" || cam.status === "active" || cam.is_active)
    return "online";
  return "offline";
};

const STATUS_FILTERS = [
  { key: "all", label: "Semua" },
  { key: "online", label: "Online" },
  { key: "offline", label: "Offline" },
  { key: "error", label: "Error" },
];

// ─────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, colorClass }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
      <div className={cn("p-3 rounded-xl", colorClass)}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Camera Card
// ─────────────────────────────────────────────
function CameraCard({ camera, onStart, onStop, onDelete, onEdit }) {
  const status = getCameraStatus(camera);
  const isOnline = status === "online";
  const isError = status === "error";

  const statusConfig = {
    online: {
      badge: "bg-emerald-500 text-white",
      icon: <Wifi size={10} />,
      label: "Online",
      thumbnail: "bg-slate-800",
      pulse: true,
    },
    offline: {
      badge: "bg-slate-400 text-white",
      icon: <WifiOff size={10} />,
      label: "Offline",
      thumbnail: "bg-slate-100",
      pulse: false,
    },
    error: {
      badge: "bg-rose-500 text-white",
      icon: <AlertTriangle size={10} />,
      label: "Error",
      thumbnail: "bg-rose-50",
      pulse: false,
    },
  }[status];

  const cameraName = camera.name || camera.camera_name || "—";
  const cameraLocation = camera.location || "—";
  const cameraUrl = camera.source_url || "";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Thumbnail / Placeholder */}
      <div
        className={cn(
          "aspect-video flex items-center justify-center relative group",
          statusConfig.thumbnail,
        )}
      >
        {isOnline ? (
          <Video size={36} className="text-slate-500 opacity-40" />
        ) : (
          <VideoOff size={36} className="text-slate-300" />
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {statusConfig.pulse && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
          <span
            className={cn(
              "flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold",
              statusConfig.badge,
            )}
          >
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </div>

        {/* ID badge */}
        <div className="absolute top-3 right-3">
          <span className="text-[10px] bg-black/30 text-white px-2 py-0.5 rounded-full font-mono backdrop-blur-sm">
            #{camera.id}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Name & meta */}
        <div>
          <h4 className="font-bold text-slate-900 text-sm truncate">
            {cameraName}
          </h4>
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
            <MapPin size={11} className="shrink-0" />
            <span className="truncate">{cameraLocation}</span>
          </div>
          {cameraUrl && (
            <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
              {cameraUrl}
            </p>
          )}
          {camera.rotation != null && camera.rotation !== 0 && (
            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
              <RotateCw size={10} />
              <span>Rotasi: {camera.rotation}°</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-1 border-t border-slate-50">
          {isOnline ? (
            <button
              onClick={() => onStop(camera.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition"
            >
              <Square size={11} />
              Stop
            </button>
          ) : (
            <button
              onClick={() => onStart(camera.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition"
            >
              <Play size={11} />
              Start
            </button>
          )}

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => onEdit(camera)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Edit kamera"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => onDelete(camera.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Hapus kamera"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function CameraManagementPage() {
  const { data: camerasData, isLoading, error, refetch } = useCameras();
  const createCamera = useCreateCamera();
  const updateCamera = useUpdateCamera();
  const deleteCamera = useDeleteCamera();
  const { start, stop } = useCameraControl();
  const { addToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const cameras = useMemo(() => {
    const raw = Array.isArray(camerasData)
      ? camerasData
      : camerasData?.data || [];
    return raw;
  }, [camerasData]);

  // Stats
  const stats = useMemo(() => {
    const online = cameras.filter(
      (c) => getCameraStatus(c) === "online",
    ).length;
    const offline = cameras.filter(
      (c) => getCameraStatus(c) === "offline",
    ).length;
    const err = cameras.filter((c) => getCameraStatus(c) === "error").length;
    return { total: cameras.length, online, offline, error: err };
  }, [cameras]);

  // Filtered list
  const filteredCameras = useMemo(() => {
    return cameras.filter((cam) => {
      const name = (cam.name || cam.camera_name || "").toLowerCase();
      const location = (cam.location || "").toLowerCase();
      const matchesSearch =
        !search ||
        name.includes(search.toLowerCase()) ||
        location.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || getCameraStatus(cam) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cameras, search, statusFilter]);

  // ── Handlers ──
  const handleCreate = (data) => {
    createCamera.mutate(data, {
      onSuccess: () => {
        addToast({ type: "success", message: "Kamera berhasil ditambahkan!" });
        closeModal();
      },
      onError: (err) => {
        addToast({
          type: "error",
          message: err.response?.data?.message || "Gagal menambah kamera",
        });
      },
    });
  };

  const handleUpdate = (data) => {
    updateCamera.mutate(
      { id: editingCamera.id, data },
      {
        onSuccess: () => {
          addToast({ type: "success", message: "Kamera berhasil diperbarui!" });
          closeModal();
        },
        onError: (err) => {
          addToast({
            type: "error",
            message: err.response?.data?.message || "Gagal memperbarui kamera",
          });
        },
      },
    );
  };

  const handleDelete = (id) => {
    if (!window.confirm("Yakin ingin menghapus kamera ini?")) return;
    deleteCamera.mutate(id, {
      onSuccess: () => addToast({ type: "success", message: "Kamera dihapus" }),
      onError: () =>
        addToast({ type: "error", message: "Gagal menghapus kamera" }),
    });
  };

  const handleStart = (id) => {
    start.mutate(id, {
      onSuccess: () =>
        addToast({ type: "success", message: "Kamera berhasil diaktifkan" }),
      onError: () =>
        addToast({ type: "error", message: "Gagal memulai kamera" }),
    });
  };

  const handleStop = (id) => {
    stop.mutate(id, {
      onSuccess: () => addToast({ type: "info", message: "Kamera dihentikan" }),
      onError: () =>
        addToast({ type: "error", message: "Gagal menghentikan kamera" }),
    });
  };

  const openEdit = (camera) => {
    setEditingCamera(camera);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCamera(null);
  };

  // ── Render ──
  if (isLoading) return <LoadingSpinner message="Memuat daftar kamera..." />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  const isSubmitting = editingCamera
    ? updateCamera.isPending
    : createCamera.isPending;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Manajemen Kamera
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Kelola, konfigurasi, dan pantau semua kamera CCTV yang terhubung.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-sm"
          >
            <Plus size={16} />
            Tambah Kamera
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          label="Total Kamera"
          value={stats.total}
          icon={Camera}
          colorClass="bg-slate-100 text-slate-600"
        />
        <StatCard
          label="Online"
          value={stats.online}
          icon={Wifi}
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Offline"
          value={stats.offline}
          icon={WifiOff}
          colorClass="bg-slate-100 text-slate-500"
        />
        <StatCard
          label="Error"
          value={stats.error}
          icon={AlertTriangle}
          colorClass="bg-rose-50 text-rose-500"
        />
      </div>

      {/* ── Toolbar: search + filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau lokasi kamera..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none transition bg-white"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition",
                statusFilter === f.key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              {f.label}
              {f.key !== "all" && (
                <span
                  className={cn(
                    "ml-1.5 text-[10px] font-bold tabular-nums",
                    f.key === "online" && "text-emerald-500",
                    f.key === "error" && "text-rose-500",
                  )}
                >
                  {stats[f.key] ?? 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Camera Grid ── */}
      {filteredCameras.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-14 flex flex-col items-center justify-center text-center">
          <div className="bg-slate-100 p-4 rounded-2xl mb-4">
            <Camera size={32} className="text-slate-400" />
          </div>
          <p className="text-slate-700 font-semibold">
            {cameras.length === 0
              ? "Belum ada kamera"
              : "Tidak ada kamera ditemukan"}
          </p>
          <p className="text-slate-400 text-sm mt-1 max-w-xs">
            {cameras.length === 0
              ? "Tambah kamera pertama Anda untuk mulai monitoring."
              : "Coba ubah kata kunci pencarian atau filter status."}
          </p>
          {cameras.length === 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-5 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition"
            >
              <Plus size={15} />
              Tambah Kamera
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCameras.map((cam) => (
            <CameraCard
              key={cam.id}
              camera={cam}
              onStart={handleStart}
              onStop={handleStop}
              onDelete={handleDelete}
              onEdit={openEdit}
            />
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      <CameraFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingCamera ? handleUpdate : handleCreate}
        defaultValues={editingCamera}
        isLoading={isSubmitting}
      />
    </div>
  );
}
