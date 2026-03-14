import { useState } from "react";
import { motion } from "framer-motion";
import {
  KeyRound,
  ArrowLeft,
  Search,
  CheckCircle2,
  Building2,
  UserCircle,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "../../components/ui/Button";
import { validateInviteCode } from "../../services/invite";

const step2Schema = z.object({
  inviteCode: z.string().min(5, "Kode undangan minimal 5 karakter"),
});

export default function Step2InviteCode({
  onBack,
  onSubmit,
  personalData,
  isLoading,
  error: submitError,
}) {
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step2Schema),
  });

  const inviteCode = watch("inviteCode");

  const handleValidate = async (data) => {
    setIsValidating(true);
    setValidationError(null);
    setValidationResult(null);

    try {
      const result = await validateInviteCode(data.inviteCode);

      if (result.valid) {
        setValidationResult(result);
      } else {
        setValidationError(result.error_message || "Kode undangan tidak valid");
      }
    } catch (err) {
      setValidationError("Terjadi kesalahan saat memvalidasi kode");
      console.error("[Invite] Validation error:", err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleJoinCompany = () => {
    onSubmit({
      ...personalData,
      inviteCode: inviteCode,
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
          <span className="text-sm text-slate-500">Gabung Perusahaan</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full">
          <div className="h-2 bg-blue-600 rounded-full w-full" />
        </div>
      </div>

      {/* Welcome Message */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Masukkan Kode Undangan
            </h2>
          </div>
        </div>
        <p className="text-slate-600 text-sm">
          Selamat datang,{" "}
          <span className="font-medium">{personalData.fullName}</span>! Masukkan
          kode undangan dari admin perusahaan Anda.
        </p>
      </div>

      <div className="space-y-5">
        {/* Invite Code Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Kode Undangan <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              {...register("inviteCode")}
              type="text"
              placeholder="Contoh: INV-2024-ABC123"
              className="w-full pl-10 pr-32 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
              disabled={isValidating || isLoading}
            />
            <button
              type="button"
              onClick={handleSubmit(handleValidate)}
              disabled={isValidating || !inviteCode || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 text-sm font-medium rounded-md transition-colors flex items-center gap-1"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Verifikasi</span>
                </>
              )}
            </button>
          </div>
          {errors.inviteCode && (
            <p className="mt-1 text-sm text-red-500">
              {errors.inviteCode.message}
            </p>
          )}
        </div>

        {/* Validation Result */}
        {validationResult && validationResult.valid && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Kode Valid</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs text-green-600">Perusahaan</p>
                  <p className="text-sm font-medium text-green-800">
                    {validationResult.tenant?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <UserCircle className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs text-green-600">
                    Role yang akan diberikan
                  </p>
                  <p className="text-sm font-medium text-green-800">
                    {validationResult.role_label || validationResult.role}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-green-200">
              <p className="text-sm text-green-700">
                Anda akan bergabung sebagai{" "}
                <span className="font-medium">
                  {validationResult.role_label || validationResult.role}
                </span>{" "}
                di perusahaan ini.
              </p>
            </div>
          </motion.div>
        )}

        {/* Validation Error */}
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <p className="text-sm text-red-600">{validationError}</p>
          </motion.div>
        )}

        {/* Submit Error */}
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleJoinCompany}
          className="w-full py-3"
          disabled={!validationResult?.valid || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span>Bergabung...</span>
            </>
          ) : (
            <span>Gabung ke Perusahaan</span>
          )}
        </Button>

        {/* Alternative Option */}
        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Ingin membuat perusahaan baru sendiri?{" "}
            <span className="font-medium underline">Klik di sini</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
