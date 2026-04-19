import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_BACKEND_URL: z
    .string()
    .trim()
    .url("NEXT_PUBLIC_BACKEND_URL must be a valid URL")
    .min(1, "NEXT_PUBLIC_BACKEND_URL is required"),
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

if (!parsed.success) {
  const message = parsed.error.issues.map((issue) => issue.message).join(", ");
  throw new Error(`Invalid frontend environment: ${message}`);
}

export const env = {
  backendUrl: parsed.data.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, ""),
} as const;
