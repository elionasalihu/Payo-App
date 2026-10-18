import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "./AuthProvider";

export function FullPageLoader() {
  return (
    <div className="payo-loader" role="status" aria-live="polite">
      <span className="payo-loader-dot" />
      <span>Loading Payo…</span>
    </div>
  );
}

/** Only signed-in users. Sends everyone else to /login and back afterwards. */
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

/** Only admins. Signed-in non-admins go back to their dashboard. */
export function RequireAdmin({ children }) {
  const { user, profile, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading || (user && !profile)) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!isAdmin) return <Navigate to="/client" replace />;
  return children;
}

/** Login/register pages: already signed-in users skip straight to the app. */
export function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;
  if (user) return <Navigate to={location.state?.from || "/client"} replace />;
  return children;
}
