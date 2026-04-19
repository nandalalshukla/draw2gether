import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PublicUser } from "@/types/auth.types";

// ─── Auth Store ───
// Holds ONLY client-side auth state: the current user and a convenience flag.
// Server data (login, register responses) flows through TanStack Query mutations;
// this store is updated as a *side-effect* of those mutations succeeding.

interface AuthState {
  user: PublicUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  authChecked: boolean;
  /** Temporary token for MFA challenge (short-lived, cleared after use) */
  mfaTempToken: string | null;
}

interface AuthActions {
  setUser: (user: PublicUser) => void;
  setToken: (token: string) => void;
  setAuthChecked: (checked: boolean) => void;
  setMFATempToken: (token: string) => void;
  clearMFATempToken: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      authChecked: false,
      mfaTempToken: null,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (accessToken) => set({ accessToken }),
      setAuthChecked: (authChecked) => set({ authChecked }),
      setMFATempToken: (mfaTempToken) => set({ mfaTempToken }),
      clearMFATempToken: () => set({ mfaTempToken: null }),
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          authChecked: true,
          mfaTempToken: null,
        }),
    }),
    {
      name: "auth-storage", // localStorage key (matches your axios interceptor)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
