"use client";

import { useEffect } from "react";
import { authApi } from "@/lib/auth.api";
import { useAuthStore } from "@/stores/auth.store";

export default function AuthBootstrap() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setAuthChecked = useAuthStore((state) => state.setAuthChecked);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      if (isAuthenticated && accessToken) {
        if (isMounted) {
          setAuthChecked(true);
        }
        return;
      }

      try {
        const refresh = await authApi.refreshToken();
        if (!isMounted || !refresh?.accessToken) {
          return;
        }

        setToken(refresh.accessToken);
        const user = await authApi.getMe();

        if (!isMounted) {
          return;
        }

        setUser(user);
      } catch {
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setAuthChecked(true);
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [
    accessToken,
    clearAuth,
    isAuthenticated,
    setAuthChecked,
    setToken,
    setUser,
  ]);

  return null;
}
