import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { getDefaultDashboardPath } from "../utils/dashboardRoutes";

export default function ProtectedRoute({ children, permission = null }) {
  const location = useLocation();
  const { user, loading, hasPermission, getAllowedTabs } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <LoadingSpinner message="Memverifikasi sesi..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (permission && !hasPermission(permission)) {
    const allowedTabs = getAllowedTabs();
    const fallbackPath =
      allowedTabs.length > 0 ? getDefaultDashboardPath(allowedTabs) : "/login";

    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}
