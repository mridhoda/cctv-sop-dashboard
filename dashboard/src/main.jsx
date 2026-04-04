import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import * as Sentry from "@sentry/react";
import App from "./App.jsx";
import "./index.css";

// Inisialisasi Sentry — hanya aktif jika DSN tersedia
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,          // "development" | "production"
    enabled: !!import.meta.env.VITE_SENTRY_DSN, // Aktif selama DSN ada
    tracesSampleRate: 0.2,
    replaysOnErrorSampleRate: 0.5,
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Sentry.ErrorBoundary
        fallback={({ resetError }) => (
          <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Terjadi Kesalahan Sistem
              </h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Aplikasi mengalami gangguan tak terduga. Tim kami telah
                diberitahu secara otomatis.
              </p>
              <button
                onClick={resetError}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition w-full"
              >
                Muat Ulang Aplikasi
              </button>
            </div>
          </div>
        )}
      >
        <App />
      </Sentry.ErrorBoundary>
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>,
);
