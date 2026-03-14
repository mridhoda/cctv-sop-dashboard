import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "../../components/ui/Button";

const step2Schema = z.object({
  companyName: z.string().min(3, "Nama perusahaan harus minimal 3 karakter"),
});

export default function Step2CompanyData({
  onBack,
  onSubmit,
  personalData,
  isLoading,
  error,
  onSwitchMode,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step2Schema),
  });

  const handleFormSubmit = (data) => {
    onSubmit({
      ...personalData,
      companyName: data.companyName,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Kembali ke data pribadi</span>
      </button>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">
            Langkah 2 dari 2
          </span>
          <span className="text-sm text-slate-500">Data Perusahaan</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full">
          <div className="h-2 bg-blue-600 rounded-full w-full" />
        </div>
      </div>

      {/* Welcome Message */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Buat Perusahaan Baru
            </h2>
          </div>
        </div>
        <p className="text-slate-600 text-sm">
          Selamat datang,{" "}
          <span className="font-medium">{personalData.fullName}</span>! Silakan
          masukkan nama perusahaan Anda untuk memulai.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nama Perusahaan <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              {...register("companyName")}
              type="text"
              placeholder="Contoh: PT Maju Jaya Indonesia"
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              disabled={isLoading}
            />
          </div>
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.companyName.message}
            </p>
          )}
        </div>

        {/* Checkbox Invite Code Toggle */}
        <div className="pt-2">
          <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer">
            <input
              type="checkbox"
              checked={false}
              onChange={(e) =>
                onSwitchMode(e.target.checked ? "member" : "owner")
              }
              className="mt-0.5 w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-slate-700">
                Saya punya kode undangan (Invite Code)
              </span>
              <p className="text-sm text-slate-500 mt-1">
                Centang kotak ini jika Anda diundang untuk bergabung ke
                perusahaan yang sudah ada
              </p>
            </div>
          </label>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Yang akan Anda dapatkan:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Dashboard CCTV untuk perusahaan Anda</li>
                <li>• Role Administrator dengan akses penuh</li>
                <li>• Kemampuan mengundang tim karyawan</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" className="w-full py-3" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span>Membuat akun...</span>
            </>
          ) : (
            <span>Buat Akun & Perusahaan</span>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
