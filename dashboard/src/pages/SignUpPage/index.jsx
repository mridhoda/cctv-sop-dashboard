import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import Step1PersonalData from "./Step1PersonalData";
import Step2CompanyData from "./Step2CompanyData";
import Step2InviteCode from "./Step2InviteCode";
import { signUp } from "../../services/auth";
import { useAuth } from "../../contexts/AuthContext";

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
    setSignupMode(data.hasInviteCode ? "member" : "owner");
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Show success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Pendaftaran Berhasil!
          </h2>
          <p className="text-slate-600 mb-6">
            {signupMode === "owner"
              ? "Perusahaan dan akun admin Anda berhasil dibuat."
              : "Anda berhasil bergabung ke perusahaan."}
          </p>
          <p className="text-sm text-slate-500">Mengalihkan ke dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          {/* Back to Login */}
          <button
            onClick={() => onSwitchView("login")}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Kembali ke Login</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">VisionGuard AI</h1>
              <p className="text-blue-100 text-sm">CCTV-SOP Dashboard</p>
            </div>
          </div>
          <p className="text-blue-100 text-sm mt-4">
            {currentStep === 1
              ? "Langkah 1: Data Pribadi"
              : signupMode === "owner"
                ? "Langkah 2: Buat Perusahaan"
                : "Langkah 2: Gabung Perusahaan"}
          </p>
        </div>

        {/* Form Content */}
        <div className="p-6">
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
              />
            ) : (
              <Step2InviteCode
                key="step2-member"
                onBack={handleBackToStep1}
                onSubmit={handleSignupComplete}
                personalData={personalData}
                isLoading={isLoading}
                error={error}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Sudah punya akun?{" "}
            <button
              onClick={() => onSwitchView("login")}
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Masuk di sini
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
