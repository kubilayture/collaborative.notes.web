import { Navigate } from "react-router";
import { useSession } from "../../lib/auth-client";
import Loading from "../common/Loading";
import Error from "../common/Error";

interface AuthenticatedRouteProps {
  children: React.ReactNode;
}

export function AuthenticatedRoute({ children }: AuthenticatedRouteProps) {
  const { data: session, isPending, error } = useSession();
  const isAuthenticated = Boolean(session?.user);

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <Error />;
  }

  if (isAuthenticated) {
    return <Navigate to={"/"} replace />;
  }

  return <>{children}</>;
}
