import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import Step1PersonalData from "./Step1PersonalData";
import Step2CompanyData from "./Step2CompanyData";
import Step2InviteCode from "./Step2InviteCode";
import { signUp } from "../../services/auth";
import { useAuth } from "../../contexts/AuthContext";
import Badge from "../../components/ui/Badge";

export default function SignUpPage({ onSwitchView }) {
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [signupMode, setSignupMode] = useState(null); // 'owner' | 'member'
  const [personalData, setPersonalData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Redirect if already logged in (handled by App.jsx, but double check)
  useEffect(() => {
    if (user && !authLoading) {
      // User will be redirected by App.jsx automatically
    }
  }, [user, authLoading]);

  const handleStep1Complete = (data) => {
    setPersonalData(data);
    setSignupMode("owner"); // Default mode
    setCurrentStep(2);
    setError(null);
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setSignupMode(null);
    setError(null);
  };

  const handleSignupComplete = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare signup parameters based on mode
      const signupParams = {
        email: data.email,
        password: data.password,
        name: data.fullName,
      };

      if (signupMode === "owner" && data.companyName) {
        signupParams.company_name = data.companyName;
      } else if (signupMode === "member" && data.inviteCode) {
        signupParams.invite_code = data.inviteCode;
      }

      const result = await signUp(signupParams);

      if (result.user) {
        setSuccess(true);
        // Auto redirect after success - App.jsx will handle the user state change
        setTimeout(() => {
          // The user state will update automatically from AuthContext
        }, 1500);
      }
    } catch (err) {
      console.error("[SignUp] Error:", err);

      // Handle specific error messages
      let errorMessage =
        "Terjadi kesalahan saat membuat akun. Silakan coba lagi.";

      if (err.message?.includes("already registered")) {
        errorMessage =
          "Email sudah terdaftar. Silakan login atau gunakan email lain.";
      } else if (err.message?.includes("Invalid invite code")) {
        errorMessage = "Kode undangan tidak valid atau sudah expired.";
      } else if (err.message?.includes("User already registered")) {
        errorMessage = "Email sudah terdaftar. Silakan login.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Show success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center border border-slate-200"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Pendaftaran Berhasil!
          </h2>
          <p className="text-slate-600 mb-8">
            {signupMode === "owner"
              ? "Perusahaan dan akun admin Anda berhasil dibuat."
              : "Anda berhasil bergabung ke perusahaan."}
          </p>
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Mengalihkan ke dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

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

      {/* ── Right panel: signup form ── */}
      <div className="flex items-center justify-center p-6 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 pb-4">
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

            {/* Back to Login (Only on Step 1) */}
            {currentStep === 1 && (
              <button
                onClick={() => onSwitchView("login")}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-semibold">Kembali ke Login</span>
              </button>
            )}

            <Badge tone="slate">
              {currentStep === 1
                ? "Langkah 1: Data Pribadi"
                : signupMode === "owner"
                  ? "Langkah 2: Buat Perusahaan"
                  : "Langkah 2: Gabung Perusahaan"}
            </Badge>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              Daftar Akun Baru
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Buat akun untuk mengelola atau mengakses sistem CCTV AI.
            </p>
          </div>

          {/* Form Content */}
          <div className="px-8 pb-8 pt-2">
            <AnimatePresence mode="wait">
              {currentStep === 1 ? (
                <Step1PersonalData
                  key="step1"
                  onNext={handleStep1Complete}
                  initialData={personalData}
                />
              ) : signupMode === "owner" ? (
                <Step2CompanyData
                  key="step2-owner"
                  onBack={handleBackToStep1}
                  onSubmit={handleSignupComplete}
                  personalData={personalData}
                  isLoading={isLoading}
                  error={error}
                  onSwitchMode={(mode) => {
                    setSignupMode(mode);
                    setError(null);
                  }}
                />
              ) : (
                <Step2InviteCode
                  key="step2-member"
                  onBack={handleBackToStep1}
                  onSubmit={handleSignupComplete}
                  personalData={personalData}
                  isLoading={isLoading}
                  error={error}
                  onSwitchMode={(mode) => {
                    setSignupMode(mode);
                    setError(null);
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Footer for Step 1 */}
          {currentStep === 1 && (
            <div className="bg-slate-50 p-6 text-center border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={() => onSwitchView("login")}
                  className="font-bold text-slate-900 transition hover:underline"
                >
                  Masuk di sini
                </button>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
