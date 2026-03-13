import React, { useState } from "react";
import {
  Camera,
  Image,
  Download,
  Filter,
  X,
  AlertTriangle,
  CheckCircle,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react";
import { useEvents } from "../hooks/useEvents";
import { exportEventsCSV } from "../services/events";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { useToast } from "../components/ui/Toast";

// Fallback data for when API is unreachable
const FALLBACK_REPORTS = [
  {
    id: "RPT001",
    filename: "RPT-2024-03-15-001.jpg",
    timestamp: "2024-03-15 09:30:45",
    location: "Area Produksi A",
    type: "pelanggaran",
    jenis: "Operator tanpa helm",
    confidenceScore: 0.92,
  },
  {
    id: "RPT002",
    filename: "RPT-2024-03-15-002.jpg",
    timestamp: "2024-03-15 10:15:20",
    location: "Area Parkir",
    type: "valid",
    jenis: "Verifikasi SOP Compliance",
    confidenceScore: 0.88,
  },
];

export default function Reports() {
  const [filterType, setFilterType] = useState("ALL");
  const [selectedReport, setSelectedReport] = useState(null);
  const { addToast } = useToast();

  // Fetch reports (events with photos)
  const {
    data: apiData,
    isLoading,
    error,
    refetch,
  } = useEvents({ has_photo: true, limit: 50 });

  const rawReports = Array.isArray(apiData)
    ? apiData
    : apiData?.data || FALLBACK_REPORTS;
  const allReports = rawReports.map((r) => ({
    id: r.id,
    filename: r.filename || r.photo_path || `RPT-${r.id}.jpg`,
    timestamp: r.timestamp || r.time || r.created_at || "—",
    location: r.location || r.camera_name || "—",
    type:
      r.type ||
      (r.status === "Valid" || r.status === "valid" ? "valid" : "pelanggaran"),
    jenis: r.jenis || r.event_type || r.name || "—",
    confidenceScore:
      r.confidenceScore || r.confidence || r.confidence_score || 0,
  }));

  const filtered = allReports.filter((report) => {
    if (filterType === "ALL") return true;
    if (filterType === "PELANGGARAN") return report.type === "pelanggaran";
    if (filterType === "VALID") return report.type === "valid";
    return true;
  });

  const totalLaporan = allReports.length;
  const pelanggaran = allReports.filter((r) => r.type === "pelanggaran").length;
  const sopValid = allReports.filter((r) => r.type === "valid").length;

  const handleExportCSV = async () => {
    try {
      const blob = await exportEventsCSV({ has_photo: true });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `reports-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      addToast({ type: "success", message: "Export CSV berhasil!" });
    } catch {
      addToast({ type: "error", message: "Gagal export CSV" });
    }
  };

  if (isLoading) return <LoadingSpinner message="Memuat laporan..." />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  return (
    <div className="flex-1 overflow-auto">
      {/* Header with Title and Button */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40">
        <div className="py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Laporan & Bukti Foto
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Riwayat deteksi pelanggaran dan verifikasi kepatuhan SOP
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-slate-600 text-sm font-medium">
                Total Laporan
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {totalLaporan}
              </p>
            </div>
            <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
              <p className="text-rose-700 text-sm font-medium">Pelanggaran</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">
                {pelanggaran}
              </p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <p className="text-emerald-700 text-sm font-medium">SOP Valid</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {sopValid}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                <div>
                  <p className="text-blue-700 text-sm font-medium">Periode</p>
                  <p className="text-sm font-bold text-blue-600 mt-1">
                    Hari Ini
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {[
              { label: "SEMUA", value: "ALL" },
              { label: "PELANGGARAN", value: "PELANGGARAN" },
              { label: "SOP VALID", value: "VALID" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterType(tab.value)}
                className={`px-6 py-2 rounded-lg font-medium text-sm transition ${
                  filterType === tab.value
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      <div className="py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Image size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">
              Tidak ada laporan untuk kategori ini
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden text-left"
              >
                {/* Photo Placeholder */}
                <div className="bg-gradient-to-br from-slate-200 to-slate-300 h-48 flex items-center justify-center border-b border-slate-200 relative group">
                  <Camera size={40} className="text-slate-500" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition flex items-center justify-center">
                    <Image
                      size={32}
                      className="text-white opacity-0 group-hover:opacity-100 transition"
                    />
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 text-sm truncate mb-2">
                    {report.filename}
                  </h3>

                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex items-start gap-2">
                      <Calendar
                        size={14}
                        className="text-slate-400 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-slate-600">{report.timestamp}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText
                        size={14}
                        className="text-slate-400 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-slate-600">{report.location}</span>
                    </div>
                  </div>

                  {/* Type Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                        report.type === "pelanggaran"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {report.type === "pelanggaran" ? (
                        <AlertTriangle size={12} />
                      ) : (
                        <CheckCircle size={12} />
                      )}
                      {report.type === "pelanggaran" ? "Pelanggaran" : "Valid"}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">
                Detail Laporan
              </h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Photo Preview */}
              <div className="bg-gradient-to-br from-slate-200 to-slate-300 h-96 rounded-xl flex items-center justify-center border border-slate-300 mb-6">
                <Camera size={64} className="text-slate-500" />
              </div>

              {/* Details Grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-slate-600 text-sm font-medium mb-1">
                      Filename
                    </p>
                    <p className="text-slate-900 font-mono text-sm break-all">
                      {selectedReport.filename}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-slate-600 text-sm font-medium mb-1">
                      ID Laporan
                    </p>
                    <p className="text-slate-900 font-mono text-sm">
                      {selectedReport.id}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-slate-600 text-sm font-medium mb-1">
                      Waktu
                    </p>
                    <p className="text-slate-900 text-sm">
                      {selectedReport.timestamp}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-slate-600 text-sm font-medium mb-1">
                      Lokasi
                    </p>
                    <p className="text-slate-900 text-sm">
                      {selectedReport.location}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-slate-600 text-sm font-medium mb-1">
                      Jenis
                    </p>
                    <p className="text-slate-900 text-sm font-medium">
                      {selectedReport.jenis}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-slate-600 text-sm font-medium mb-1">
                      Confidence Score
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${selectedReport.confidenceScore * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-slate-900 font-bold text-sm">
                        {(selectedReport.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="pt-2">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
                      selectedReport.type === "pelanggaran"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {selectedReport.type === "pelanggaran" ? (
                      <AlertTriangle size={16} />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    {selectedReport.type === "pelanggaran"
                      ? "Status: Pelanggaran"
                      : "Status: Sesuai SOP"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-200 sticky bottom-0 bg-white">
              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-2 rounded-lg font-medium transition"
              >
                Tutup
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2">
                <Download size={16} />
                Download Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
