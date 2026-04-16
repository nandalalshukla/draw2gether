"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FiUser, FiLogOut, FiMonitor, FiLock, FiShield } from "react-icons/fi";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout, useLogoutAll } from "@/hooks/useAuth";

// ─── ProfileDropdown ───
// Shows a user avatar with initials. On click, opens a dropdown with
// account actions that map 1:1 to backend endpoints.
// Closes on outside click (useEffect + ref pattern).

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { mutate: logoutAll, isPending: isLoggingOutAll } = useLogoutAll();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!user) return null;

  // Generate initials from fullname (e.g. "John Doe" → "JD")
  const initials = user.fullname
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-[#3ECF8E]/10 border border-[#3ECF8E]/20 text-[#3ECF8E] text-sm font-semibold hover:bg-[#3ECF8E]/20 transition-all duration-200 cursor-pointer select-none"
        aria-label="Open profile menu"
      >
        {initials}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/6 bg-surface-light backdrop-blur-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-white/6">
            <p className="text-sm font-medium text-white truncate">
              {user.fullname}
            </p>
            <p className="text-xs text-zinc-400 truncate">{user.email}</p>
          </div>

          {/* Navigation Items */}
          <div className="py-1">
            <DropdownLink
              href="/settings"
              icon={<FiUser className="text-base" />}
              label="Account Settings"
              onClick={() => setOpen(false)}
            />
            <DropdownLink
              href="/settings#password"
              icon={<FiLock className="text-base" />}
              label="Change Password"
              onClick={() => setOpen(false)}
            />
            <DropdownLink
              href="/settings#mfa"
              icon={<FiShield className="text-base" />}
              label={user.mfaEnabled ? "Manage MFA" : "Enable MFA"}
              onClick={() => setOpen(false)}
            />
          </div>

          {/* Destructive Actions */}
          <div className="py-1 border-t border-white/6">
            <DropdownButton
              icon={<FiMonitor className="text-base" />}
              label="Logout All Devices"
              onClick={() => logoutAll()}
              disabled={isLoggingOutAll}
              variant="warning"
            />
            <DropdownButton
              icon={<FiLogOut className="text-base" />}
              label="Logout"
              onClick={() => logout()}
              disabled={isLoggingOut}
              variant="danger"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dropdown Sub-components ───
// Extracted for readability. Not exported — they exist only for this dropdown.

interface DropdownLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function DropdownLink({ href, icon, label, onClick }: DropdownLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/4 transition-colors duration-150"
    >
      {icon}
      {label}
    </Link>
  );
}

interface DropdownButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant: "warning" | "danger";
}

function DropdownButton({
  icon,
  label,
  onClick,
  disabled,
  variant,
}: DropdownButtonProps) {
  const colorClass =
    variant === "danger"
      ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
      : "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${colorClass}`}
    >
      {icon}
      {disabled ? "Please wait..." : label}
    </button>
  );
}
