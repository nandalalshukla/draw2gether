"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiShield } from "react-icons/fi";
import { useAuthStore } from "@/stores/auth.store";
import { useMFAChallenge } from "@/hooks/useAuth";

// ─── MFA Challenge Page ───
// Shown after login when the user has MFA enabled.
// The user enters their 6-digit TOTP code (or an 8-char backup code)
// along with the tempToken stored during login to complete authentication.

export default function MFAChallengePage() {
  const router = useRouter();
  const mfaTempToken = useAuthStore((s) => s.mfaTempToken);
  const challengeMutation = useMFAChallenge();

  const [code, setCode] = useState("");
  const [isBackupMode, setIsBackupMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Redirect if there's no temp token (user navigated here directly)
  useEffect(() => {
    if (!mfaTempToken) {
      router.replace("/login");
    }
  }, [mfaTempToken, router]);

  // Auto-focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [isBackupMode]);

  if (!mfaTempToken) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    challengeMutation.mutate({ tempToken: mfaTempToken, code });
  };

  const maxLength = isBackupMode ? 8 : 6;
  const expectedLength = isBackupMode ? 8 : 6;
  const isValidLength = code.length === expectedLength;

  return (
    <div className="page-grid relative min-h-screen w-full flex items-center justify-center bg-[#1C1C1C] overflow-y-auto pt-24 pb-10">
      <div className="relative z-10 flex flex-col justify-center items-center rounded-lg border border-[#222] bg-[#161616] h-fit max-w-sm w-[90vw] mx-auto px-6 py-8 text-white my-auto">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl border border-[#222] bg-[#3ECF8E]/10 flex items-center justify-center mb-4">
          <FiShield className="text-2xl text-[#3ECF8E]" />
        </div>

        <h1 className="text-white text-center mb-2 text-xl font-medium tracking-tight">
          Two-Factor Authentication
        </h1>
        <p className="text-gray-400 text-sm text-center mb-6">
          {isBackupMode
            ? "Enter one of your backup codes to sign in."
            : "Enter the 6-digit code from your authenticator app."}
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <input
              ref={inputRef}
              type="text"
              inputMode={isBackupMode ? "text" : "numeric"}
              maxLength={maxLength}
              value={code}
              onChange={(e) => {
                const val = isBackupMode
                  ? e.target.value.replace(/[^a-fA-F0-9]/g, "").toLowerCase()
                  : e.target.value.replace(/\D/g, "");
                setCode(val);
              }}
              placeholder={isBackupMode ? "a1b2c3d4" : "000000"}
              autoComplete="one-time-code"
              className="w-full bg-transparent border border-white/[0.06] rounded-xl px-3 py-3 text-white placeholder-zinc-500 outline-none focus:border-[#3ECF8E]/50 focus:ring-1 focus:ring-[#3ECF8E]/50 transition-all duration-300 tracking-[0.3em] text-center font-mono text-lg"
            />
          </div>

          <button
            type="submit"
            disabled={!isValidLength || challengeMutation.isPending}
            className="w-full py-2.5 rounded-lg border border-white/[0.06] bg-[#3ECF8E] text-[#1C1C1C] font-semibold text-md transition-all duration-200 hover:bg-[#4EEEA0] hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {challengeMutation.isPending ? "Verifying..." : "Verify"}
          </button>
        </form>

        {/* Toggle between TOTP and backup code mode */}
        <button
          type="button"
          onClick={() => {
            setIsBackupMode(!isBackupMode);
            setCode("");
          }}
          className="mt-4 text-sm text-zinc-400 hover:text-[#3ECF8E] transition-colors cursor-pointer"
        >
          {isBackupMode
            ? "Use authenticator app instead"
            : "Use a backup code instead"}
        </button>

        {/* Back to login */}
        <Link
          href="/login"
          className="mt-3 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
