import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:4000",
});

export const {
  useSession,
  signIn,
  signOut,
  signUp,
  refreshToken,
  requestPasswordReset,
} = authClient;
