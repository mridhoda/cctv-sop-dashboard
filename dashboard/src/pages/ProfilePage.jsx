import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Clock,
  Calendar,
  Pencil,
  Check,
  X,
  Loader2,
  KeyRound,
  Crown,
  BadgeCheck,
  UserCog,
} from "lucide-react";
import Card from "../components/ui/Card";
import { useProfile } from "../hooks/useProfile";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/ui/Toast";
import { supabase } from "../lib/supabase";
import { cn } from "../utils/cn";

const PLAN_STYLES = {
  defense: {
    label: "Defense",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: Shield,
  },
  guardian: {
    label: "Guardian",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    icon: BadgeCheck,
  },
  protector: {
    label: "Protector",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: Crown,
  },
};

const ROLE_STYLES = {
  superadmin: {
    label: "Super Admin",
    color: "bg-rose-100 text-rose-700 border-rose-200",
  },
  admin: {
    label: "Admin",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  operator: {
    label: "Operator",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  viewer: {
    label: "Viewer",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

function InfoRow({
  icon: Icon,
  label,
  value,
  editable,
  editValue,
  onEditChange,
  isEditing,
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        {isEditing && editable ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            className="mt-0.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
          />
        ) : (
          <p className="mt-0.5 text-sm font-medium text-slate-800 truncate">
            {value || (
              <span className="text-slate-400 italic">Belum diisi</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const { addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Sync edit fields when profile loads
  useEffect(() => {
    if (profile) {
      setEditName(profile.name || "");
      setEditPhone(profile.phone || "");
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile({ name: editName, phone: editPhone });
      setIsEditing(false);
      addToast({ type: "success", message: "Profil berhasil diperbarui" });
    } catch (err) {
      addToast({
        type: "error",
        message: err.message || "Gagal memperbarui profil",
      });
    }
  };

  const handleCancel = () => {
    setEditName(profile?.name || "");
    setEditPhone(profile?.phone || "");
    setIsEditing(false);
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) throw error;
      addToast({
        type: "success",
        message: `Link reset password telah dikirim ke ${user.email}`,
      });
    } catch (err) {
      addToast({
        type: "error",
        message: err.message || "Gagal mengirim email reset",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const tenant = profile?.tenants;
  const plan = PLAN_STYLES[tenant?.plan_tier] || PLAN_STYLES.defense;
  const PlanIcon = plan.icon;
  const roleStyle = ROLE_STYLES[profile?.role] || ROLE_STYLES.viewer;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "Belum pernah login";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ── Profile Header Card ── */}
      <Card className="relative overflow-hidden" animate={false}>
        {/* Decorative gradient band */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900" />

        <div className="relative px-6 pb-6 pt-14">
          {/* Avatar + Name */}
          <div className="flex flex-col items-center sm:flex-row sm:items-end sm:gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-lg ring-4 ring-white">
              <User size={36} strokeWidth={1.5} />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <h1 className="text-xl font-bold text-slate-900">
                {profile?.name || "User"}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {/* Role badge */}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                    roleStyle.color,
                  )}
                >
                  <Shield size={10} />
                  {profile?.role_label || roleStyle.label}
                </span>
                {/* Plan badge */}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                    plan.bg,
                    plan.text,
                    plan.border,
                  )}
                >
                  <PlanIcon size={10} />
                  {plan.label}
                </span>
                {/* Active status */}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                    profile?.is_active
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      profile?.is_active ? "bg-emerald-500" : "bg-rose-500",
                    )}
                  />
                  {profile?.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>

            {/* Edit toggle */}
            <div className="mt-3 sm:mt-0 sm:ml-auto">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    Simpan
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                  >
                    <X size={14} /> Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                  <Pencil size={14} /> Edit Profil
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Content Grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <Card className="p-5" animate={false}>
          <h3 className="mb-1 text-sm font-bold text-slate-800">
            Informasi Personal
          </h3>
          <p className="mb-4 text-[11px] text-slate-500">Data diri pengguna</p>

          <div className="divide-y divide-slate-100">
            <InfoRow
              icon={User}
              label="Nama Lengkap"
              value={profile?.name}
              editable
              editValue={editName}
              onEditChange={setEditName}
              isEditing={isEditing}
            />
            <InfoRow icon={User} label="Username" value={profile?.username} />
            <InfoRow
              icon={Mail}
              label="Email"
              value={profile?.email || user?.email}
            />
            <InfoRow
              icon={Phone}
              label="Nomor Telepon"
              value={profile?.phone}
              editable
              editValue={editPhone}
              onEditChange={setEditPhone}
              isEditing={isEditing}
            />
          </div>
        </Card>

        {/* Company & Role */}
        <Card className="p-5" animate={false}>
          <h3 className="mb-1 text-sm font-bold text-slate-800">
            Perusahaan & Peran
          </h3>
          <p className="mb-4 text-[11px] text-slate-500">
            Informasi organisasi
          </p>

          <div className="divide-y divide-slate-100">
            <InfoRow
              icon={Building2}
              label="Nama Perusahaan"
              value={tenant?.name}
            />
            <InfoRow
              icon={Shield}
              label="Paket Langganan"
              value={
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                    plan.bg,
                    plan.text,
                    plan.border,
                  )}
                >
                  <PlanIcon size={10} />
                  {plan.label}
                </span>
              }
            />
            <InfoRow
              icon={Shield}
              label="Role"
              value={
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                    roleStyle.color,
                  )}
                >
                  {profile?.role_label || roleStyle.label}
                </span>
              }
            />
            <InfoRow
              icon={Clock}
              label="Timezone"
              value={tenant?.timezone || "Asia/Jakarta"}
            />
          </div>
        </Card>

        {/* Account Info */}
        <Card className="p-5" animate={false}>
          <h3 className="mb-1 text-sm font-bold text-slate-800">
            Informasi Akun
          </h3>
          <p className="mb-4 text-[11px] text-slate-500">
            Status dan riwayat akun
          </p>

          <div className="divide-y divide-slate-100">
            <InfoRow
              icon={Calendar}
              label="Tanggal Bergabung"
              value={formatDate(profile?.created_at)}
            />
            <InfoRow
              icon={Clock}
              label="Login Terakhir"
              value={formatDateTime(profile?.last_login)}
            />
            <InfoRow
              icon={Shield}
              label="Status Akun"
              value={
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                    profile?.is_active
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      profile?.is_active ? "bg-emerald-500" : "bg-rose-500",
                    )}
                  />
                  {profile?.is_active ? "Aktif" : "Nonaktif"}
                </span>
              }
            />
          </div>
        </Card>

        {/* Security */}
        <Card className="p-5" animate={false}>
          <h3 className="mb-1 text-sm font-bold text-slate-800">Keamanan</h3>
          <p className="mb-4 text-[11px] text-slate-500">
            Kelola keamanan akun Anda
          </p>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                  <KeyRound size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    Ubah Password
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Kirim link reset password ke email Anda
                  </p>
                  <button
                    onClick={handleResetPassword}
                    disabled={isResettingPassword}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    {isResettingPassword ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Mail size={14} />
                    )}
                    Kirim Link Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <p className="text-xs font-semibold text-amber-800">
                💡 Tips Keamanan
              </p>
              <ul className="mt-1.5 space-y-1 text-[11px] text-amber-700">
                <li>• Gunakan password minimal 8 karakter</li>
                <li>• Kombinasikan huruf besar, kecil, angka, dan simbol</li>
                <li>• Jangan gunakan password yang sama di layanan lain</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Invite Code (Admin Only) */}
        {(profile?.role === "admin" || profile?.role === "superadmin") && (
          <InviteCodeSection />
        )}
      </div>
    </div>
  );
}

// Sub-component for generating invite codes
function InviteCodeSection() {
  const { addToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [selectedRole, setSelectedRole] = useState("viewer");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Import on demand to avoid circular deps or heavy initial load
      const { createInviteCode } = await import("../services/invite");
      const roleLabel = selectedRole === "operator" ? "Operator" : "Viewer";
      const result = await createInviteCode({
        role: selectedRole,
        role_label: roleLabel,
        max_uses: 1, // Default single use for profile generation
      });
      setGeneratedCode(result.code);
      addToast({ type: "success", message: "Kode undangan berhasil dibuat" });
    } catch (err) {
      addToast({
        type: "error",
        message: err.message || "Gagal membuat kode undangan",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    addToast({ type: "success", message: "Kode disalin ke clipboard" });
  };

  return (
    <Card className="p-5" animate={false}>
      <h3 className="mb-1 text-sm font-bold text-indigo-900 border-b border-indigo-100 pb-2 flex items-center gap-2">
        <Crown size={16} className="text-indigo-600" />
        Undang Anggota Tim
      </h3>
      <p className="mt-4 mb-4 text-[11px] text-slate-500">
        Buat kode undangan untuk menambahkan anggota tim baru. Kode hanya
        berlaku untuk 1 kali penggunaan.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Pilih Role:
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="inviteRole"
                value="viewer"
                checked={selectedRole === "viewer"}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">Viewer</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="inviteRole"
                value="operator"
                checked={selectedRole === "operator"}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">Operator</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Crown size={16} />
          )}
          Generate Kode Undangan
        </button>

        {generatedCode && (
          <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 animate-in fade-in slide-in-from-bottom-2">
            <p className="text-xs font-semibold text-indigo-800 mb-2">
              Berikan kode ini kepada pendaftar:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm font-mono text-center tracking-widest text-indigo-700 font-bold select-all">
                {generatedCode}
              </code>
              <button
                onClick={copyToClipboard}
                className="shrink-0 rounded-lg bg-white border border-indigo-200 p-2 text-indigo-600 hover:bg-indigo-100 transition shadow-sm"
                title="Salin Kode"
              >
                <Check size={16} className="hidden" />
                <span className="text-xs font-bold uppercase">Copy</span>
              </button>
            </div>
            <p className="mt-2 text-[10px] text-indigo-600 text-center">
              Arahkan ke halaman Sign Up untuk menggunakan kode ini
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
