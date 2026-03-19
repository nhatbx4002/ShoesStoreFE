import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";

interface ProtectedRouteProps {
  /** Route content to render when authorized */
  children: ReactNode;
  /**
   * Required role. If set, the user must have this exact role.
   * Defaults to allowing any authenticated user.
   */
  requiredRole?: "USER" | "ADMIN";
  /** Override the redirect destination for unauthenticated users. Defaults to /login */
  redirectTo?: string;
}

/**
 * Guards routes that require authentication.
 *
 * - Unauthenticated → redirects to /login (or `redirectTo`)
 * - Wrong role      → redirects to /
 * - Authenticated   → renders children
 */
export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  // ── Not logged in ───────────────────────────────────────────────────────────
  if (!token) {
    // Preserve where the user was trying to go, so we can send them back
    // after login. Only do this when redirecting to /login (not custom paths).
    return (
      <Navigate
        to={redirectTo}
        state={{ from: redirectTo === "/login" ? location : undefined }}
        replace
      />
    );
  }

  // ── Role check ─────────────────────────────────────────────────────────────
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // ── Authorized ─────────────────────────────────────────────────────────────
  return <>{children}</>;
}
