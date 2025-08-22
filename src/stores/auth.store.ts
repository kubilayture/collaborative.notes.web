import { create } from "zustand";
import type { User } from "../types/index";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  expiresAt: Date | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (accessToken: string, user: User) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  isTokenExpired: () => boolean;
  shouldRefresh: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  expiresAt: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (accessToken: string, user: User) => {
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    const expiresAt = new Date(payload.exp * 1000);

    set({
      accessToken,
      user,
      expiresAt,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  clearAuth: () => {
    set({
      accessToken: null,
      user: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  isTokenExpired: () => {
    const { expiresAt } = get();
    if (!expiresAt) return true;
    return new Date() >= expiresAt;
  },

  shouldRefresh: () => {
    const { expiresAt } = get();
    if (!expiresAt) return false;
    // Refresh token 5 minutes before expiration
    const refreshThreshold = new Date(expiresAt.getTime() - 5 * 60 * 1000);
    return new Date() >= refreshThreshold;
  },
}));
