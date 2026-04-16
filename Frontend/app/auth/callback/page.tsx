"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useOAuthExchange } from "@/hooks/useAuth";

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const exchangeMutation = useOAuthExchange();

  // Prevent double-fire in React StrictMode
  const hasRun = useRef(false);

  useEffect(() => {
    if (code && !hasRun.current) {
      hasRun.current = true;
      exchangeMutation.mutate(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // ─── No code in URL ───
  if (!code) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-white/20 backdrop-blur-3xl shadow-2xl max-w-sm w-[90vw] mx-auto px-6 py-10 text-white">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-semibold mb-3">Invalid Callback</h1>
        <p className="text-gray-300 text-center text-sm mb-6">
          No authorization code found. Please try signing in again.
        </p>
        <Link
          href="/login"
          className="px-6 py-2 rounded-xl border border-white/20 hover:bg-white/10 text-white font-medium transition-all duration-200"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  // ─── Exchanging code for tokens ───
  if (exchangeMutation.isPending) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-white/20 backdrop-blur-3xl shadow-2xl max-w-sm w-[90vw] mx-auto px-6 py-10 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Signing you in...</h1>
        <p className="text-gray-300 text-sm">
          Please wait while we complete authentication.
        </p>
      </div>
    );
  }

  // ─── Error ───
  if (exchangeMutation.isError) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-white/20 backdrop-blur-3xl shadow-2xl max-w-sm w-[90vw] mx-auto px-6 py-10 text-white">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-2xl font-semibold mb-3">Authentication Failed</h1>
        <p className="text-gray-300 text-center text-sm mb-6">
          The login link may have expired or is invalid. Please try again.
        </p>
        <Link
          href="/login"
          className="px-6 py-2 rounded-xl border border-white/20 hover:bg-white/10 text-white font-medium transition-all duration-200"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  // ─── Success (briefly visible before redirect) ───
  return (
    <div className="flex flex-col items-center rounded-3xl border border-white/20 backdrop-blur-3xl shadow-2xl max-w-sm w-[90vw] mx-auto px-6 py-10 text-white">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-2xl font-semibold mb-3">Authenticated!</h1>
      <p className="text-gray-300 text-center text-sm">Redirecting...</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <Suspense
        fallback={
          <div className="flex items-center justify-center rounded-3xl border border-white/20 backdrop-blur-3xl shadow-2xl max-w-sm w-[90vw] mx-auto h-64 text-white">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
          </div>
        }
      >
        <OAuthCallbackContent />
      </Suspense>
    </div>
  );
}
