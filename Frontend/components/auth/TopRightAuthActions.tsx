"use client";

import Link from "next/link";
import ProfileDropdown from "@/components/ProfileDropdown";
import type { PublicUser } from "@/types/auth.types";

type TopRightAuthActionsProps = {
  user: PublicUser | null;
};

export default function TopRightAuthActions({
  user,
}: TopRightAuthActionsProps) {
  return (
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
  );
}
