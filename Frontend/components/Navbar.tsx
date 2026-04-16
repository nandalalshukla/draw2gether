"use client";

import { useState } from "react";
import Link from "next/link";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useAuthStore } from "@/stores/auth.store";

// Add nav links here — they'll appear on both desktop and mobile automatically
const NAV_LINKS: { href: string; label: string }[] = [];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  return (
    <nav className="w-full border-b border-[#222] bg-[#161616]">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-sm font-medium tracking-tight text-white hover:text-[#3ECF8E] transition-colors shrink-0"
        >
          App
        </Link>

        {/* Desktop nav links */}
        {NAV_LINKS.length > 0 && (
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Desktop auth area */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <ProfileDropdown />
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md border border-[#3ECF8E]/40 bg-[#3ECF8E]/10 px-4 py-2 text-sm font-medium text-[#3ECF8E] hover:bg-[#3ECF8E]/20 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 rounded-md hover:bg-white/5 transition-colors"
          style={{ gap: "5px" }}
          aria-label="Toggle menu"
        >
          <span
            className="block h-0.5 w-5 bg-white rounded-full transition-transform duration-200"
            style={
              open ? { transform: "translateY(7px) rotate(45deg)" } : undefined
            }
          />
          <span
            className={`block h-0.5 w-5 bg-white rounded-full transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
          />
          <span
            className="block h-0.5 w-5 bg-white rounded-full transition-transform duration-200"
            style={
              open
                ? { transform: "translateY(-7px) rotate(-45deg)" }
                : undefined
            }
          />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#222] bg-[#161616] px-4 pb-4 pt-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            {user ? (
              <div className="pt-1">
                <ProfileDropdown />
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-[#3ECF8E]/40 bg-[#3ECF8E]/10 px-3 py-2.5 text-sm font-medium text-[#3ECF8E] hover:bg-[#3ECF8E]/20 transition-colors text-center"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
