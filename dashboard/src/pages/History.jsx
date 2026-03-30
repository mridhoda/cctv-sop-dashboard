import React, { useState, useMemo, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  Clock,
  MapPin,
  User,
  Loader2,
  Camera,
  ChevronDown,
} from "lucide-react";
import { useEventsRealtime } from "../hooks/useEventsRealtime";
import { exportEventsCSV, getPhotoSignedUrl } from "../services/events";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { useToast } from "../components/ui/Toast";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { cn } from "../utils/cn";
import RefreshButton from "../components/ui/RefreshButton";
import { useFaceRecognition } from "../hooks/useFaceRecognition";

const PERIOD_OPTIONS = [
  { value: "hari_ini", label: "Hari Ini" },
  { value: "minggu_ini", label: "Minggu Ini" },
  { value: "bulan_ini", label: "Bulan Ini" },
  { value: "tahun_ini", label: "Tahun Ini" },
  { value: "semua", label: "Semua Waktu" },
];

const getPeriodDates = (period) => {
  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  if (period === "hari_ini") {
    return {
      date_from: startOfDay.toISOString(),
      date_to: endOfDay.toISOString(),
    };
  } else if (period === "minggu_ini") {
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    return { date_from: monday.toISOString(), date_to: endOfDay.toISOString() };
  } else if (period === "bulan_ini") {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    return {
      date_from: firstDay.toISOString(),
      date_to: endOfDay.toISOString(),
    };
  } else if (period === "tahun_ini") {
    const firstDay = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    return {
      date_from: firstDay.toISOString(),
      date_to: endOfDay.toISOString(),
    };
  } else {
    return {};
  }
};

export default function History() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [period, setPeriod] = useState("hari_ini");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const { addToast } = useToast();
  const { enabled: faceRecognitionEnabled } = useFaceRecognition();

  const PAGE_SIZE_OPTIONS = [10, 25, 50];

  // Load photo URL when selected incident changes
  useEffect(() => {
    async function loadPhotoUrl() {
      if (selectedIncident?.foto) {
        const url = await getPhotoSignedUrl(selectedIncident.foto, 3600);
        setPhotoUrl(url);
      } else {
        setPhotoUrl(null);
      }
    }
    loadPhotoUrl();
  }, [selectedIncident]);

  const { date_from, date_to } = useMemo(
    () => getPeriodDates(period),
    [period],
  );

  // Fetch events via Supabase Realtime (replaces React Query polling)
  const {
    data: eventsData,
    isLoading,
    error,
    refetch,
  } = useEventsRealtime({
    page: currentPage,
    limit: itemsPerPage,
    status:
      statusFilter === "Pelanggaran"
        ? "violation"
        : statusFilter === "Valid"
          ? "valid"
          : undefined,
    search: searchQuery || undefined,
    date_from,
    date_to,
  });

  // Normalize API response — support various shapes
  const rawEvents = Array.isArray(eventsData)
    ? eventsData
    : eventsData?.data || eventsData?.events || [];

  // Map API fields to UI fields (handle both local and API naming)
  const filteredIncidents = rawEvents.map((e) => ({
    id: e.id,
    waktu: (() => {
      // Re-implemented inline formating since formatWITA was removed accidentally,
      // but standard formats work locally anyway via direct Date API to mirror what we want.
      if (!e.waktu && !e.timestamp && !e.time) return "—";
      const dt = e.waktu || e.timestamp || e.time;
      if (dt === "—") return dt;
      try {
        const d = new Date(dt);
        if (isNaN(d.getTime())) return dt;
        return new Intl.DateTimeFormat("id-ID", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Makassar",
          timeZoneName: "short",
        }).format(d);
      } catch (err) {
        return dt;
      }
    })(),
    lokasi:
      e.lokasi ||
      e.cameras?.location ||
      e.cameras?.name ||
      e.location ||
      e.camera_name ||
      "—",
    namaStaff: e.namaStaff || e.staff_name || e.name || "—",
    jenisPeranggaran:
      e.jenisPeranggaran || e.violation_type || e.event_type || e.type || "—",
    status:
      e.status === "violation"
        ? "Pelanggaran"
        : e.status === "valid" || e.status === "compliant"
          ? "Valid"
          : e.status || "Pelanggaran",
    foto: e.foto || e.photo_url || e.photo_path || "",
    deskripsiAI:
      e.deskripsiAI || e.ai_description || e.description || e.detail || "",
  }));

  // Pagination from API or client-side
  const totalPages =
    eventsData?.totalPages ||
    eventsData?.total_pages ||
    Math.ceil(filteredIncidents.length / itemsPerPage) ||
    1;
  const paginatedIncidents = eventsData?.totalPages
    ? filteredIncidents
    : filteredIncidents.slice(0, itemsPerPage);

  const totalEntries = eventsData?.total ?? filteredIncidents.length;

  const handleRowClick = (incident) => {
    setSelectedIncident(incident);
    setShowModal(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusBadgeColor = (status) => {
    return status === "Pelanggaran"
      ? "bg-rose-100 text-rose-700 border-rose-200"
      : "bg-emerald-100 text-emerald-700 border-emerald-200";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-slate-100">
            <AlertTriangle className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Riwayat Insiden
            </h1>
            <p className="text-sm text-slate-500">
              Catatan lengkap deteksi pelanggaran SOP keselamatan
            </p>
          </div>
        </div>
        <RefreshButton onRefresh={refetch} />
      </div>

      {/* Filter Bar */}
      <Card className="p-4" animate={false}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Status Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="All">Semua Status</option>
              <option value="Pelanggaran">Pelanggaran</option>
              <option value="Valid">Valid</option>
            </select>
          </div>

          {/* Period Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="md:col-span-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Cari staff, lokasi..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>

          {/* Per-Page Dropdown */}
          <div className="md:col-span-2 flex items-center gap-2 justify-end">
            <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
              View
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-3 text-sm text-slate-600">
          Menampilkan{" "}
          <span className="font-semibold text-slate-900">
            {paginatedIncidents.length}
          </span>{" "}
          dari{" "}
          <span className="font-semibold text-slate-900">{totalEntries}</span>{" "}
          insiden
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0" animate={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Lokasi
                </th>
                {faceRecognitionEnabled && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Nama Staff
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Jenis Pelanggaran
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedIncidents.length > 0 ? (
                paginatedIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    onClick={() => handleRowClick(incident)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-900">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {incident.waktu}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {incident.lokasi}
                      </div>
                    </td>
                    {faceRecognitionEnabled && (
                      <td className="px-6 py-4 text-sm text-slate-900">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          {incident.namaStaff}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {incident.jenisPeranggaran}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                          incident.status,
                        )}`}
                      >
                        {incident.status === "Pelanggaran" ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(incident);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                      >
                        Detail
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={faceRecognitionEnabled ? 6 : 5}
                    className="px-6 py-8 text-center text-slate-600"
                  >
                    <p className="text-sm">
                      Tidak ada insiden yang sesuai dengan filter
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </button>

          <div className="text-sm text-slate-600">
            Halaman{" "}
            <span className="font-semibold text-slate-900">{currentPage}</span>{" "}
            dari{" "}
            <span className="font-semibold text-slate-900">
              {totalPages || 1}
            </span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Selanjutnya
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* Detail Modal */}
      {showModal && selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Detail Insiden
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Waktu
                  </p>
                  <p className="text-sm text-slate-900 mt-1 font-medium">
                    {selectedIncident.waktu}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Lokasi
                  </p>
                  <p className="text-sm text-slate-900 mt-1 font-medium">
                    {selectedIncident.lokasi}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Nama Staff
                  </p>
                  <p className="text-sm text-slate-900 mt-1 font-medium">
                    {selectedIncident.namaStaff}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Jenis Pelanggaran
                  </p>
                  <p className="text-sm text-slate-900 mt-1 font-medium">
                    {selectedIncident.jenisPeranggaran}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Status
                </p>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusBadgeColor(
                    selectedIncident.status,
                  )}`}
                >
                  {selectedIncident.status === "Pelanggaran" ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {selectedIncident.status}
                </span>
              </div>

              {/* Photo Evidence */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Foto Bukti
                </p>
                <div className="rounded-lg overflow-hidden bg-slate-100 aspect-video flex items-center justify-center">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Bukti Pelanggaran"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <Camera size={48} />
                      <span className="text-sm mt-2">Foto tidak tersedia</span>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Description */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Deskripsi AI
                </p>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-sm text-slate-700">
                    {selectedIncident.deskripsiAI}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 p-6 border-t border-slate-200 bg-slate-50 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-white transition-colors"
              >
                Tutup
              </button>
              <button className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors">
                Ambil Tindakan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
