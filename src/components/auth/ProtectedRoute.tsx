import { Navigate, useLocation } from "react-router";
import { useSession } from "../../lib/auth-client";
import Loading from "../common/Loading";
import Error from "../common/Error";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, isPending, error } = useSession();
  const isAuthenticated = Boolean(session?.user);
  const location = useLocation();

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <Error />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
