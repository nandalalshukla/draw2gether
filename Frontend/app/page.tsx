//just a simple home page with hello
"use client";
import Link from "next/link";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useAuthStore } from "@/stores/auth.store";
import dynamic from "next/dynamic";
const Excalidraw = dynamic(
  () => import("../components/draw/ExcalidrawWrapper"),
  {
    ssr: false,
  },
);

export default function Home() {
  const user = useAuthStore((state) => state.user);
  return (
    <main className="relative w-full h-screen">
      <Excalidraw />
      <div className="fixed top-5 right-40 z-100 flex items-center gap-2">
        {user ? (
          <ProfileDropdown />
        ) : (
          <div className="flex items-center gap-5">
            <Link href="/login" className="excalidraw-ink-link">
              Login
            </Link>
            <Link href="/register" className="excalidraw-ink-link">
              Register
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
