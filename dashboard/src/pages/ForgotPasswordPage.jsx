import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { resetPassword } from "../services/auth";

const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export default function ForgotPasswordPage({ onSwitchView }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await resetPassword(data.email);
      setIsSuccess(true);
    } catch (error) {
      addToast({
        type: "error",
        message: error.message || "Gagal mengirim email reset. Coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
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

      {/* ── Right panel: forgot password ── */}
      <div className="flex items-center justify-center p-6 lg:p-10 relative">
        <button
          onClick={() => onSwitchView("login")}
          className="absolute top-6 left-6 lg:top-10 lg:left-10 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Login
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden mt-12 lg:mt-0"
        >
          {/* Mobile logo */}
          <div className="px-8 pt-8 lg:hidden hidden">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-emerald-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">VisionGuard AI</p>
                <p className="text-xs text-slate-500">CCTV-SOP Dashboard</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {!isSuccess ? (
              <>
                <div className="mb-8">
                  <div className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-slate-50 border border-slate-100 shadow-sm text-slate-900">
                    <ShieldCheck className="h-8 w-8 text-emerald-500" />
                  </div>

                  <Badge tone="slate">Keamanan Akun</Badge>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                    Lupa Password?
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Masukkan email yang terdaftar untuk menerima petunjuk reset
                    password.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600">
                      Alamat Email
                    </span>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <input
                        {...register("email")}
                        placeholder="nama@perusahaan.com"
                        type="email"
                        className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-rose-500">
                        {errors.email.message}
                      </p>
                    )}
                  </label>

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isLoading ? "Mengirim..." : "Kirim Link Reset"}
                  </Button>
                </form>
              </>
            ) : (
              <div className="py-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600"
                >
                  <CheckCircle2 className="h-10 w-10" />
                </motion.div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
                  Cek Email Anda
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-8">
                  Kami telah mengirimkan instruksi untuk me-reset password ke
                  email yang Anda masukkan. Silakan periksa kotak masuk atau
                  folder spam.
                </p>
                <Button
                  onClick={() => onSwitchView("login")}
                  variant="outline"
                  className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
                >
                  Kembali ke Halaman Login
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
