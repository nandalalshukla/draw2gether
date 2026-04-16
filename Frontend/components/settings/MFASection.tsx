"use client";

import React, { useState } from "react";
import {
  FiShield,
  FiShieldOff,
  FiRefreshCw,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import { useAuthStore } from "@/stores/auth.store";
import {
  useMFASetup,
  useMFAVerify,
  useMFADisable,
  useMFARegenerateBackupCodes,
} from "@/hooks/useAuth";
import type { MFASetupResponse } from "@/types/auth.types";

// ─── MFASection ───
// Handles the full MFA lifecycle:
//   1. Setup  → shows QR code + backup codes
//   2. Verify → user enters TOTP code to confirm setup
//   3. Disable → user enters current TOTP or backup code to turn off MFA
//   4. Regenerate backup codes → replaces all existing backup codes
// State is kept local — no global store needed for the setup flow.

export default function MFASection() {
  const user = useAuthStore((s) => s.user);
  const mfaEnabled = user?.mfaEnabled ?? false;

  if (mfaEnabled) {
    return <MFAEnabled />;
  }

  return <EnableMFA />;
}

// ─── Enable MFA Flow ───

function EnableMFA() {
  const [setupData, setSetupData] = useState<MFASetupResponse | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);

  const setupMutation = useMFASetup();
  const verifyMutation = useMFAVerify();

  const handleSetup = () => {
    setupMutation.mutate(undefined, {
      onSuccess: (data) => setSetupData(data),
    });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim()) return;
    verifyMutation.mutate(verifyCode, {
      onSuccess: () => {
        setSetupData(null);
        setVerifyCode("");
      },
    });
  };

  const handleCopySecret = async () => {
    if (!setupData?.secret) return;
    await navigator.clipboard.writeText(setupData.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  // Step 1: Show setup button
  if (!setupData) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-zinc-400">
          Add an extra layer of security to your account with a TOTP
          authenticator app.
        </p>
        <button
          onClick={handleSetup}
          disabled={setupMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <FiShield className="text-base" />
          {setupMutation.isPending ? "Setting up..." : "Enable MFA"}
        </button>
      </div>
    );
  }

  // Step 2: Show QR code, backup codes, and verification input
  return (
    <div className="space-y-5">
      {/* QR Code */}
      <div className="space-y-2">
        <p className="text-sm text-zinc-300">
          Scan this QR code with your authenticator app:
        </p>
        <div className="bg-white rounded-xl p-3 w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={setupData.qrCode}
            alt="MFA QR Code"
            width={200}
            height={200}
          />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-zinc-500">
            Or enter this secret manually:{" "}
            <code className="text-zinc-300 bg-white/[0.06] px-1.5 py-0.5 rounded text-xs">
              {setupData.secret}
            </code>
          </p>
          <button
            type="button"
            onClick={handleCopySecret}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Copy secret"
          >
            {copiedSecret ? (
              <FiCheck className="text-[#3ECF8E] text-xs" />
            ) : (
              <FiCopy className="text-xs" />
            )}
          </button>
        </div>
      </div>

      {/* Backup Codes */}
      <BackupCodesDisplay codes={setupData.backupCodes} />

      {/* Verify Code */}
      <form onSubmit={handleVerify} className="space-y-3">
        <label
          htmlFor="mfa-verify"
          className="block text-sm font-medium text-zinc-300"
        >
          Enter the 6-digit code from your app to confirm:
        </label>
        <input
          id="mfa-verify"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={verifyCode}
          onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          className="w-full bg-transparent border border-white/[0.06] rounded-lg px-3 py-2 text-white placeholder-zinc-500 outline-none focus:border-[#3ECF8E]/50 focus:ring-1 focus:ring-[#3ECF8E]/50 transition-all duration-300 tracking-[0.3em] text-center font-mono"
        />
        <button
          type="submit"
          disabled={verifyCode.length !== 6 || verifyMutation.isPending}
          className="w-full py-2 rounded-lg bg-[#3ECF8E] text-[#1C1C1C] font-semibold text-sm transition-all duration-200 hover:bg-[#4EEEA0] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {verifyMutation.isPending ? "Verifying..." : "Verify & Enable MFA"}
        </button>
      </form>
    </div>
  );
}

// ─── MFA Enabled State (Disable + Regenerate Backup Codes) ───

function MFAEnabled() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FiShield className="text-[#3ECF8E]" />
        <span className="text-sm text-[#3ECF8E] font-medium">
          MFA is currently enabled
        </span>
      </div>

      <RegenerateBackupCodes />

      <div className="border-t border-white/[0.06] pt-4">
        <DisableMFA />
      </div>
    </div>
  );
}

// ─── Regenerate Backup Codes ───

function RegenerateBackupCodes() {
  const [code, setCode] = useState("");
  const [newCodes, setNewCodes] = useState<string[] | null>(null);
  const regenMutation = useMFARegenerateBackupCodes();

  const handleRegenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    regenMutation.mutate(code, {
      onSuccess: (data) => {
        setNewCodes(data.backupCodes);
        setCode("");
      },
    });
  };

  if (newCodes) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-zinc-300 font-medium">
          Your new backup codes (save these — old codes no longer work):
        </p>
        <BackupCodesDisplay codes={newCodes} />
        <button
          type="button"
          onClick={() => setNewCodes(null)}
          className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          Done — I&apos;ve saved my codes
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegenerate} className="space-y-3">
      <p className="text-sm text-zinc-400">
        Lost your backup codes? Generate new ones (this invalidates old codes).
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="TOTP code"
          className="flex-1 bg-transparent border border-white/[0.06] rounded-lg px-3 py-2 text-white placeholder-zinc-500 outline-none focus:border-[#3ECF8E]/50 focus:ring-1 focus:ring-[#3ECF8E]/50 transition-all duration-300 tracking-[0.3em] text-center font-mono text-sm"
        />
        <button
          type="submit"
          disabled={code.length !== 6 || regenMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
        >
          <FiRefreshCw
            className={`text-base ${regenMutation.isPending ? "animate-spin" : ""}`}
          />
          {regenMutation.isPending ? "Regenerating..." : "Regenerate"}
        </button>
      </div>
    </form>
  );
}

// ─── Disable MFA Flow ───

function DisableMFA() {
  const [code, setCode] = useState("");
  const [isBackupMode, setIsBackupMode] = useState(false);
  const disableMutation = useMFADisable();

  const handleDisable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    disableMutation.mutate(code, {
      onSuccess: () => setCode(""),
    });
  };

  const maxLength = isBackupMode ? 8 : 6;
  const expectedLength = isBackupMode ? 8 : 6;

  return (
    <div className="space-y-3">
      <form onSubmit={handleDisable} className="space-y-3">
        <label
          htmlFor="mfa-disable"
          className="block text-sm font-medium text-zinc-300"
        >
          {isBackupMode
            ? "Enter a backup code to disable MFA:"
            : "Enter your current TOTP code to disable MFA:"}
        </label>
        <input
          id="mfa-disable"
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
          className="w-full bg-transparent border border-white/[0.06] rounded-lg px-3 py-2 text-white placeholder-zinc-500 outline-none focus:border-[#3ECF8E]/50 focus:ring-1 focus:ring-[#3ECF8E]/50 transition-all duration-300 tracking-[0.3em] text-center font-mono"
        />
        <button
          type="submit"
          disabled={code.length !== expectedLength || disableMutation.isPending}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <FiShieldOff className="text-base" />
          {disableMutation.isPending ? "Disabling..." : "Disable MFA"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setIsBackupMode(!isBackupMode);
          setCode("");
        }}
        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
      >
        {isBackupMode
          ? "Use authenticator code instead"
          : "Use a backup code instead"}
      </button>
    </div>
  );
}

// ─── Shared: Backup Codes Display ───

function BackupCodesDisplay({ codes }: { codes: string[] }) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-300 font-medium">
          Backup codes (save these somewhere safe):
        </p>
        <button
          type="button"
          onClick={handleCopyAll}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <FiCheck className="text-[#3ECF8E]" />
              <span className="text-[#3ECF8E]">Copied!</span>
            </>
          ) : (
            <>
              <FiCopy />
              <span>Copy all</span>
            </>
          )}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {codes.map((code) => (
          <code
            key={code}
            className="text-xs text-zinc-300 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 text-center font-mono"
          >
            {code}
          </code>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Each code can only be used once. Keep them safe — they&apos;re your
        fallback if you lose access to your authenticator app.
      </p>
    </div>
  );
}
