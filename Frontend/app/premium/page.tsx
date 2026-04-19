"use client";

import RequireAuth from "@/components/auth/RequireAuth";

export default function PremiumPage() {
  return (
    <RequireAuth>
      <main className="min-h-screen w-full flex items-center justify-center bg-[#1C1C1C] text-zinc-100">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-5 text-center backdrop-blur-md">
          <h1 className="text-xl font-semibold">Premium</h1>
          <p className="mt-2 text-sm text-zinc-300">
            You can access this page only when logged in.
          </p>
        </section>
      </main>
    </RequireAuth>
  );
}
