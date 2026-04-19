"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

type RequireAuthProps = {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
};

export default function RequireAuth({
  children,
  redirectTo = "/login",
  fallback = null,
}: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, authChecked } = useAuthStore();

  useEffect(() => {
    if (!authChecked) {
      return;
    }

    if (!isAuthenticated || !user) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`${redirectTo}${next}`);
    }
  }, [authChecked, isAuthenticated, pathname, redirectTo, router, user]);

  if (!authChecked) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#1C1C1C] text-zinc-300">
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
