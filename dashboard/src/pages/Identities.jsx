import React, { useState } from "react";
import {
  User,
  UserPlus,
  Upload,
  Trash2,
  Cpu,
  Search,
  X,
  Check,
  Shield,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import {
  useIdentities,
  useCreateIdentity,
  useDeleteIdentity,
  useTriggerEncode,
} from "../hooks/useIdentities";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { useToast } from "../components/ui/Toast";
import { useFaceRecognition } from "../hooks/useFaceRecognition";

// Mock data kept as fallback
const FALLBACK_IDENTITIES = [
  {
    id: "ID001",
    nama: "Ahmad Riyanto",
    jabatan: "Operator",
    idKaryawan: "EMP001",
    terdaftar: "2024-01-15",
    status: "Active",
    avatar: null,
  },
  {
    id: "ID002",
    nama: "Siti Nurhaliza",
    jabatan: "Supervisor",
    idKaryawan: "EMP002",
    terdaftar: "2024-01-20",
    status: "Active",
    avatar: null,
  },
  {
    id: "ID003",
    nama: "Budi Santoso",
    jabatan: "HSE Officer",
    idKaryawan: "EMP003",
    terdaftar: "2024-02-01",
    status: "Active",
    avatar: null,
  },
];

export default function Identities() {
  const { data: apiData, isLoading, error, refetch } = useIdentities();
  const createIdentity = useCreateIdentity();
  const deleteIdentity = useDeleteIdentity();
  const triggerEncode = useTriggerEncode();
  const { addToast } = useToast();
  const { enabled: faceRecognitionEnabled, config } = useFaceRecognition();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    namaLengkap: "",
    jabatan: "",
    idKaryawan: "",
    foto: null,
  });

  // Normalize API response
  const rawIdentities = Array.isArray(apiData)
    ? apiData
    : apiData?.data || FALLBACK_IDENTITIES;
  const identities = rawIdentities.map((i) => ({
    id: i.id,
    nama: i.nama || i.name || "—",
    jabatan: i.jabatan || i.position || i.role || "—",
    idKaryawan: i.idKaryawan || i.employee_id || "—",
    terdaftar: i.terdaftar || i.created_at?.slice(0, 10) || "—",
    status: i.status || "Active",
    avatar: i.avatar || null,
  }));

  const filtered = identities.filter((identity) =>
    identity.nama.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalIdentitas = identities.length;
  const aktif = identities.filter((i) => i.status === "Active").length;
  const tidakAktif = identities.filter(
    (i) => i.status === "Inactive" || i.status !== "Active",
  ).length;

  const handleAddIdentity = () => {
    if (formData.namaLengkap && formData.jabatan && formData.idKaryawan) {
      createIdentity.mutate(
        {
          name: formData.namaLengkap,
          position: formData.jabatan,
          employee_id: formData.idKaryawan,
        },
        {
          onSuccess: () => {
            addToast({
              type: "success",
              message: "Identitas berhasil ditambahkan!",
            });
            setFormData({
              namaLengkap: "",
              jabatan: "",
              idKaryawan: "",
              foto: null,
            });
            setShowAddModal(false);
          },
          onError: () =>
            addToast({ type: "error", message: "Gagal menambah identitas" }),
        },
      );
    }
  };

  const handleDelete = (id) => {
    deleteIdentity.mutate(id, {
      onSuccess: () => {
        addToast({ type: "success", message: "Identitas dihapus" });
        setDeleteConfirm(null);
      },
      onError: () =>
        addToast({ type: "error", message: "Gagal menghapus identitas" }),
    });
  };

  const handleEncode = (id) => {
    triggerEncode.mutate(id, {
      onSuccess: () =>
        addToast({
          type: "success",
          message: "Encoding wajah berhasil dimulai!",
        }),
      onError: () =>
        addToast({ type: "error", message: "Gagal memulai encoding" }),
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, foto: e.target.files[0].name });
    }
  };

  if (isLoading) return <LoadingSpinner message="Memuat data identitas..." />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  // Block access if face recognition is disabled
  if (!faceRecognitionEnabled) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Fitur Tidak Tersedia
          </h2>
          <p className="text-slate-600 mb-6">
            Manajemen Identitas memerlukan Face Recognition yang aktif. Silakan
            aktifkan fitur ini di menu Pengaturan Sistem.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => (window.location.href = "/settings")}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition"
            >
              Ke Pengaturan
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header with Title and Button */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40">
        <div className="py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Manajemen Identitas
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Kelola data identitas dan wajah staff terdaftar
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <UserPlus size={18} />
              Tambah Identitas
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-slate-600 text-sm font-medium">
                Total Identitas
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {totalIdentitas}
              </p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <p className="text-emerald-700 text-sm font-medium">Aktif</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {aktif}
              </p>
            </div>
            <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
              <p className="text-rose-700 text-sm font-medium">Tidak Aktif</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">
                {tidakAktif}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Cari berdasarkan nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Identity Cards Grid */}
      <div className="py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <User size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">
              Tidak ada identitas yang ditemukan
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((identity) => (
              <div
                key={identity.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* Avatar Section */}
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 h-40 flex items-center justify-center border-b border-slate-200">
                  <div className="bg-slate-300 rounded-full p-4">
                    <User size={32} className="text-slate-600" />
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">
                    {identity.nama}
                  </h3>
                  <p className="text-slate-600 text-xs mb-3">
                    {identity.jabatan}
                  </p>

                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">ID Karyawan:</span>
                      <span className="font-medium text-slate-900">
                        {identity.idKaryawan}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Terdaftar:</span>
                      <span className="font-medium text-slate-900">
                        {identity.terdaftar}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-between items-center mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                        identity.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {identity.status === "Active" ? (
                        <Check size={12} />
                      ) : (
                        <Shield size={12} />
                      )}
                      {identity.status}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirm(identity.id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1"
                    >
                      <Trash2 size={14} />
                      Hapus
                    </button>
                    <button
                      onClick={() => handleEncode(identity.id)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1"
                    >
                      <Cpu size={14} />
                      Encode
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === identity.id && (
                  <div className="absolute inset-0 bg-white rounded-2xl border-2 border-red-300 bg-red-50 flex flex-col items-center justify-center gap-3 p-4">
                    <p className="text-slate-900 font-semibold text-center text-sm">
                      Yakin hapus{" "}
                      <span className="font-bold">{identity.nama}</span>?
                    </p>
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 py-2 rounded-lg text-xs font-medium transition"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleDelete(identity.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-xs font-medium transition"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Identity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                Tambah Identitas Baru
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    namaLengkap: "",
                    jabatan: "",
                    idKaryawan: "",
                    foto: null,
                  });
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={formData.namaLengkap}
                  onChange={(e) =>
                    setFormData({ ...formData, namaLengkap: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Jabatan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Operator, Supervisor"
                  value={formData.jabatan}
                  onChange={(e) =>
                    setFormData({ ...formData, jabatan: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  ID Karyawan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: EMP001"
                  value={formData.idKaryawan}
                  onChange={(e) =>
                    setFormData({ ...formData, idKaryawan: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Upload Foto
                </label>
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition">
                  <div className="text-center">
                    <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-900">
                      {formData.foto || "Pilih file foto"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      PNG, JPG hingga 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    namaLengkap: "",
                    jabatan: "",
                    idKaryawan: "",
                    foto: null,
                  });
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-2 rounded-lg font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={handleAddIdentity}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
