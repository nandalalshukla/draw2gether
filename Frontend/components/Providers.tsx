"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";

// ─── QueryClient defaults ───
// These are sensible defaults for an auth app.
// - staleTime: 5 min — prevents refetching data that's unlikely to change quickly.
// - retry: 1 — retries once on failure (the axios interceptor handles 401 refresh).
// - refetchOnWindowFocus: false — avoids surprise refetches while developing / using the app.

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

// Ensure we create the QueryClient only once on the client (React 19 / Next 16 safe).
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{ duration: 4000 }}
      />
    </QueryClientProvider>
  );
}
