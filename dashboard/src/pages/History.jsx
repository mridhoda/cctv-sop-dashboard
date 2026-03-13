import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { useEvents } from "../hooks/useEvents";
import { exportEventsCSV } from "../services/events";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { useToast } from "../components/ui/Toast";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { cn } from "../utils/cn";
import { useFaceRecognition } from "../hooks/useFaceRecognition";

// Mock data kept as fallback when API is unreachable
const FALLBACK_INCIDENTS = [
  {
    id: 1,
    waktu: "2024-01-15 14:32:15",
    lokasi: "Koridor Utama",
    namaStaff: "Budi Santoso",
    jenisPeranggaran: "Tanpa Helm Keselamatan",
    status: "Pelanggaran",
    foto: "https://via.placeholder.com/400x300?text=Bukti+Pelanggaran+1",
    deskripsiAI:
      "Deteksi individu tanpa helm keselamatan di area koridor utama. Tingkat kepercayaan: 92%. Rekomendasi: Tindakan disiplin",
  },
  {
    id: 2,
    waktu: "2024-01-15 13:45:42",
    lokasi: "Ruang Server",
    namaStaff: "Siti Nurhaliza",
    jenisPeranggaran: "Akses Tanpa Otorisasi",
    status: "Valid",
    foto: "https://via.placeholder.com/400x300?text=Bukti+Pelanggaran+2",
    deskripsiAI:
      "Akses ke ruang server terdeteksi. Verifikasi: Staff terotorisasi dengan badge ID yang valid",
  },
  {
    id: 3,
    waktu: "2024-01-15 12:20:18",
    lokasi: "Area Gudang",
    namaStaff: "Ahmad Wijaya",
    jenisPeranggaran: "Material Berbahaya Terbuka",
    status: "Pelanggaran",
    foto: "https://via.placeholder.com/400x300?text=Bukti+Pelanggaran+3",
    deskripsiAI:
      "Material berbahaya terdeteksi tidak dalam kondisi aman. Tingkat kepercayaan: 87%. Rekomendasi: Pengecekan keamanan segera",
  },
  {
    id: 4,
    waktu: "2024-01-15 11:15:33",
    lokasi: "Pintu Masuk",
    namaStaff: "Dewi Kusuma",
    jenisPeranggaran: "Lalu Lintas Tanpa Protokol",
    status: "Valid",
    foto: "https://via.placeholder.com/400x300?text=Bukti+Pelanggaran+4",
    deskripsiAI:
      "Lalu lintas normal melalui pintu masuk. Semua protokol keselamatan terpenuhi",
  },
  {
    id: 5,
    waktu: "2024-01-15 10:00:55",
    lokasi: "Area Parkir",
    namaStaff: "Edi Gunawan",
    jenisPeranggaran: "Parkir di Area Larangan",
    status: "Pelanggaran",
    foto: "https://via.placeholder.com/400x300?text=Bukti+Pelanggaran+5",
    deskripsiAI:
      "Kendaraan terdeteksi di area parkir terlarang. Tingkat kepercayaan: 95%. Rekomendasi: Tindakan administratif",
  },
  {
    id: 6,
    waktu: "2024-01-14 16:42:10",
    lokasi: "Ruang Rapat",
    namaStaff: "Fatimah Zahra",
    jenisPeranggaran: "Penggunaan Perangkat Terlarang",
    status: "Valid",
    foto: "https://via.placeholder.com/400x300?text=Bukti+Pelanggaran+6",
    deskripsiAI:
      "Perangkat terdeteksi adalah peralatan rapat resmi yang tersertifikasi. Tidak ada pelanggaran",
  },
  {
    id: 7,
    waktu: "2024-01-14 15:28:47",
    lokasi: "Koridor Utama",
    namaStaff: "Gita Permata",
    jenisPeranggaran: "Area Terlarang",
    status: "Pelanggaran",
    foto: "https://via.placeholder.com/400x300?text=Bukti+Pelanggaran+7",
    deskripsiAI:
      "Akses ke area terlarang terdeteksi tanpa otorisasi. Tingkat kepercayaan: 89%. Rekomendasi: Investigasi lebih lanjut",
  },
  {
    id: 8,
    waktu: "2024-01-14 14:05:22",
    lokasi: "Pintu Masuk",
    namaStaff: "Hendra Suryanto",
    jenisPeranggaran: "Protokol Keselamatan Terpenuhi",
    status: "Valid",
    foto: "https://via.placeholder.com/400x300?text=Bukti+Pelanggaran+8",
    deskripsiAI:
      "Akses normal melalui pintu masuk dengan protokol keselamatan lengkap",
  },
  {
    id: 9,
    waktu: "2024-01-14 12:33:09",
    lokasi: "Area Gudang",
    namaStaff: "Indah Kusuma",
    jenisPeranggaran: "Keamanan Penyimpanan Tidak Memadai",
    status: "Pelanggaran",
    foto: "https://via.placeholder.com/400x300?text=Bukti+Pelanggaran+9",
    deskripsiAI:
      "Penyimpanan material tidak sesuai standar keamanan. Tingkat kepercayaan: 91%. Rekomendasi: Reorganisasi penyimpanan",
  },
  {
    id: 10,
    wakti: "2024-01-14 11:10:45",
    lokasi: "Ruang Server",
    namaStaff: "Joko Susilo",
    jenisPeranggaran: "Verifikasi Akses Berhasil",
    status: "Valid",
    foto: "https://via.placeholder.com/400x300?text=Bukti+Pelanggaran+10",
    deskripsiAI:
      "Akses ke ruang server terverifikasi dengan credential yang valid",
  },
];

export default function History() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useToast();
  const { enabled: faceRecognitionEnabled } = useFaceRecognition();

  const itemsPerPage = 5;

  // Fetch events from API
  const {
    data: eventsData,
    isLoading,
    error,
    refetch,
  } = useEvents({
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter !== "All" ? statusFilter : undefined,
    search: searchQuery || undefined,
  });

  // Normalize API response — support various shapes
  const rawEvents = Array.isArray(eventsData)
    ? eventsData
    : eventsData?.data || eventsData?.events || FALLBACK_INCIDENTS;

  // Map API fields to UI fields (handle both local and API naming)
  const filteredIncidents = rawEvents.map((e) => ({
    id: e.id,
    waktu: e.waktu || e.timestamp || e.time || "—",
    lokasi: e.lokasi || e.location || e.camera_name || "—",
    namaStaff: e.namaStaff || e.staff_name || e.name || "—",
    jenisPeranggaran: e.jenisPeranggaran || e.event_type || e.type || "—",
    status: e.status || "Pelanggaran",
    foto: e.foto || e.photo_url || e.photo_path || "",
    deskripsiAI: e.deskripsiAI || e.description || e.detail || "",
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
      </div>

      {/* Filter Bar */}
      <Card className="p-4" animate={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="All">Semua Status</option>
              <option value="Pelanggaran">Pelanggaran</option>
              <option value="Valid">Valid</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 md:col-span-2">
            <Search className="w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Cari berdasarkan staff, lokasi, atau jenis pelanggaran..."
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
        </div>

        {/* Results Summary */}
        <div className="mt-3 text-sm text-slate-600">
          Menampilkan{" "}
          <span className="font-semibold text-slate-900">
            {paginatedIncidents.length}
          </span>{" "}
          dari{" "}
          <span className="font-semibold text-slate-900">
            {filteredIncidents.length}
          </span>{" "}
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

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={async () => {
            try {
              const blob = await exportEventsCSV({
                status: statusFilter !== "All" ? statusFilter : undefined,
              });
              const url = window.URL.createObjectURL(new Blob([blob]));
              const a = document.createElement("a");
              a.href = url;
              a.download = `events-export-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
              addToast({ type: "success", message: "Export CSV berhasil!" });
            } catch {
              addToast({ type: "error", message: "Gagal export CSV" });
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

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
                  <img
                    src={selectedIncident.foto}
                    alt="Bukti Pelanggaran"
                    className="w-full h-full object-cover"
                  />
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
