"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiMail, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { useVerifyEmail } from "@/hooks/useAuth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const verifyMutation = useVerifyEmail();

  // Prevent double-fire in React StrictMode
  const hasRun = useRef(false);

  useEffect(() => {
    if (token && !hasRun.current) {
      hasRun.current = true;
      verifyMutation.mutate({ token });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ─── No token in URL ───
  if (!token) {
    return (
      <div className="page-grid relative min-h-screen w-full flex items-center justify-center bg-[#1C1C1C]">
        <div className="relative z-10 flex flex-col items-center rounded-lg border border-[#222] bg-[#161616] max-w-sm w-[90vw] mx-auto px-6 py-10 text-white">
          <div className="w-12 h-12 rounded-lg bg-[#3ECF8E]/10 border border-[#3ECF8E]/20 flex items-center justify-center mb-4">
            <FiMail className="w-5 h-5 text-[#3ECF8E]" />
          </div>
          <h1 className="text-xl font-medium mb-3">Check your email</h1>
          <p className="text-zinc-400 text-center text-sm mb-6">
            We&apos;ve sent a verification link to your email address. Click the
            link to verify your account.
          </p>
          <Link
            href="/login"
            className="text-sm text-zinc-400 hover:text-[#3ECF8E] transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ─── Verifying ───
  if (verifyMutation.isPending) {
    return (
      <div className="page-grid relative min-h-screen w-full flex items-center justify-center bg-[#1C1C1C]">
        <div className="relative z-10 flex flex-col items-center rounded-lg border border-[#222] bg-[#161616] max-w-sm w-[90vw] mx-auto px-6 py-10 text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3ECF8E] mb-4" />
          <h1 className="text-xl font-medium mb-2">Verifying...</h1>
          <p className="text-zinc-400 text-sm">
            Please wait while we verify your email.
          </p>
        </div>
      </div>
    );
  }

  // ─── Error ───
  if (verifyMutation.isError) {
    return (
      <div className="page-grid relative min-h-screen w-full flex items-center justify-center bg-[#1C1C1C]">
        <div className="relative z-10 flex flex-col items-center rounded-lg border border-[#222] bg-[#161616] max-w-sm w-[90vw] mx-auto px-6 py-10 text-white">
          <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <FiAlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <h1 className="text-xl font-medium mb-3">Verification Failed</h1>
          <p className="text-zinc-400 text-center text-sm mb-6">
            The link may have expired or is invalid. Please try registering
            again or request a new verification email.
          </p>
          <Link
            href="/register"
            className="px-6 py-2 rounded-lg border border-white/[0.06] bg-[#3ECF8E] text-[#1C1C1C] font-medium transition-all duration-200 hover:bg-[#4EEEA0]"
          >
            Back to Register
          </Link>
        </div>
      </div>
    );
  }

  // ─── Success ───
  return (
    <div className="page-grid relative min-h-screen w-full flex items-center justify-center bg-[#1C1C1C]">
      <div className="relative z-10 flex flex-col items-center rounded-lg border border-[#222] bg-[#161616] max-w-sm w-[90vw] mx-auto px-6 py-10 text-white">
        <div className="w-12 h-12 rounded-lg bg-[#3ECF8E]/10 border border-[#3ECF8E]/20 flex items-center justify-center mb-4">
          <FiCheckCircle className="w-5 h-5 text-[#3ECF8E]" />
        </div>
        <h1 className="text-xl font-medium mb-3">Email Verified!</h1>
        <p className="text-zinc-400 text-center text-sm mb-6">
          Your email has been verified successfully. You can now log in.
        </p>
        <Link
          href="/login"
          className="px-6 py-2 rounded-lg bg-[#3ECF8E] text-[#1C1C1C] font-medium transition-all duration-200 hover:bg-[#4EEEA0]"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="page-grid relative min-h-screen w-full flex items-center justify-center bg-[#1C1C1C]">
          <div className="relative z-10 animate-spin rounded-full h-12 w-12 border-b-2 border-[#3ECF8E]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
