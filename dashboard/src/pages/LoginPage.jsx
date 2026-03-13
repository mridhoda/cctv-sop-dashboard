import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Eye as EyeIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/ui/Toast";

const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export default function LoginPage({ onSwitchView }) {
  const { login } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data);
      addToast({ type: "success", message: "Login berhasil! Selamat datang." });
    } catch (error) {
      addToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Login gagal. Periksa username dan password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (username, password) => {
    setValue("username", username);
    setValue("password", password);
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-slate-100 lg:grid-cols-2">
      {/* ── Left panel: branding ── */}
      <div className="hidden border-r border-slate-200 bg-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Logo */}
        <div>
          <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                VisionGuard AI
              </p>
              <p className="text-sm text-slate-500">
                Foodinesia CCTV-SOP Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl"
        >
          <Badge tone="blue">AI-Powered Monitoring</Badge>
          <h1 className="mt-5 text-5xl font-bold tracking-tight text-slate-900">
            Monitoring SOP yang lebih cerdas dan real-time
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Deteksi otomatis kepatuhan karyawan terhadap SOP menggunakan
            teknologi AI dan CCTV terintegrasi.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              ["4 Kamera", "AI Detection"],
              ["42 Alert", "Hari ini"],
              ["85.4%", "Compliance"],
            ].map(([a, b]) => (
              <div
                key={a}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-2xl font-bold text-slate-900">{a}</p>
                <p className="mt-1 text-sm text-slate-500">{b}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="text-sm text-slate-500">
          Background #f1f5f9 • Card #ffffff • Sidebar #0f172a
        </div>
      </div>

      {/* ── Right panel: login form ── */}
      <div className="flex items-center justify-center p-6 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
        >
          <div className="mb-8">
            {/* Mobile logo */}
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-emerald-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">VisionGuard AI</p>
                <p className="text-xs text-slate-500">CCTV-SOP Dashboard</p>
              </div>
            </div>

            <Badge tone="slate">Secure Access</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              Masuk ke Dashboard
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Akses live monitoring, insiden, dan pengaturan AI.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">
                Username
              </span>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200">
                <User className="h-4 w-4 text-slate-400" />
                <input
                  {...register("username")}
                  placeholder="Masukkan username"
                  className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.username.message}
                </p>
              )}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">
                Password
              </span>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 transition hover:text-slate-600 shrink-0"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="mt-1 flex justify-between items-center">
                {errors.password ? (
                  <p className="text-xs text-rose-500">
                    {errors.password.message}
                  </p>
                ) : (
                  <div></div>
                )}
                <button
                  type="button"
                  onClick={() => onSwitchView?.("forgot_password")}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                >
                  Lupa password?
                </button>
              </div>
            </label>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-8 text-center text-sm">
             <p className="text-slate-500">
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => onSwitchView?.("signup")}
                  className="font-bold text-slate-900 transition hover:underline"
                >
                  Daftar di sini
                </button>
             </p>
          </div>

          {/* Demo accounts */}
          <div className="mt-6 space-y-2">
            <p className="text-center text-xs font-medium uppercase tracking-wider text-slate-400">
              Akun Demo — Klik untuk isi otomatis
            </p>

            <button
              onClick={() => fillCredentials("superadmin", "admin123")}
              type="button"
              className="flex w-full items-start gap-3 rounded-2xl border-2 border-blue-100 bg-blue-50 p-4 text-left transition hover:border-blue-300"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500 text-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-blue-900">
                  Super Administrator
                </p>
                <p className="mt-0.5 text-sm text-slate-600">
                  superadmin / admin123 — Akses penuh semua fitur
                </p>
              </div>
            </button>

            <button
              onClick={() => fillCredentials("viewer", "viewer123")}
              type="button"
              className="flex w-full items-start gap-3 rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-4 text-left transition hover:border-emerald-300"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-emerald-900">Viewer</p>
                <p className="mt-0.5 text-sm text-slate-600">
                  viewer / viewer123 — Dashboard & Monitoring saja
                </p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
