import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { authApi } from "@/lib/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiErrorResponse, PublicUser } from "@/types/auth.types";

// ─── Helpers ───

/** Extract a human-readable message from any API error */
function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

/** Extract the machine-readable error code from an API error (if any) */
function getErrorCode(error: unknown): string | undefined {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.errorCode;
  }
  return undefined;
}

/** Shared post-login logic: save token, fetch user profile, update store */
async function handleLoginSuccess(
  accessToken: string,
  setToken: (token: string) => void,
  setUser: (user: PublicUser) => void,
) {
  setToken(accessToken);
  const user = await authApi.getMe();
  setUser(user);
}

/** Refresh user profile in the store (used after MFA enable/disable) */
async function refreshUserProfile(setUser: (user: PublicUser) => void) {
  const user = await authApi.getMe();
  setUser(user);
}

/** Store the MFA temp token and redirect to the challenge page */
function handleMFARequired(
  tempToken: string,
  setMFATempToken: (token: string) => void,
  router: ReturnType<typeof useRouter>,
) {
  setMFATempToken(tempToken);
  toast.info("MFA verification required. Please enter your code.");
  router.push("/mfa");
}

// ─── Mutations ───
// Each hook wraps a single API call with loading/error/success handling.
// Pages just call `mutate(data)` — no manual try/catch needed.

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success("Account created! Check your email to verify.");
      router.push("/verify-email");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useLogin() {
  const router = useRouter();
  const { setUser, setToken, setMFATempToken } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      if (data.mfaRequired) {
        handleMFARequired(data.tempToken, setMFATempToken, router);
        return;
      }

      try {
        await handleLoginSuccess(data.accessToken, setToken, setUser);
        toast.success("Logged in successfully!");
        router.push("/");
      } catch {
        toast.error("Login succeeded but failed to fetch user details.");
      }
    },
    onError: (error) => {
      const code = getErrorCode(error);

      if (code === "ACCOUNT_DEACTIVATED") {
        toast.error("Your account is deactivated.", {
          action: {
            label: "Reactivate",
            onClick: () => router.push("/reactivate"),
          },
        });
        return;
      }

      if (code === "ACCOUNT_DELETED") {
        toast.error("This account has been permanently deleted.");
        return;
      }

      toast.error(getErrorMessage(error));
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast.success("If that email exists, a reset link has been sent.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success("Password reset successfully! Please log in.");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      toast.success("Email verified! You can now log in.");
      // No auto-redirect — the verify-email page shows a success screen
      // with a "Go to Login" button so the user sees confirmation.
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useOAuthExchange() {
  const router = useRouter();
  const { setUser, setToken, setMFATempToken } = useAuthStore();

  return useMutation({
    mutationFn: authApi.exchangeOAuthCode,
    onSuccess: async (data) => {
      if (data.mfaRequired) {
        handleMFARequired(data.tempToken, setMFATempToken, router);
        return;
      }

      try {
        await handleLoginSuccess(data.accessToken, setToken, setUser);
        toast.success("Logged in successfully!");
        router.push("/");
      } catch {
        toast.error("Login succeeded but failed to fetch user details.");
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
      router.push("/login");
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      toast.success("Logged out.");
      router.push("/login");
    },
    onError: (error) => {
      // Even if the API fails, clear local state
      clearAuth();
      toast.error(getErrorMessage(error));
      router.push("/login");
    },
  });
}

export function useLogoutAll() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logoutAll,
    onSuccess: () => {
      clearAuth();
      toast.success("All sessions revoked.");
      router.push("/login");
    },
    onError: (error) => {
      clearAuth();
      toast.error(getErrorMessage(error));
      router.push("/login");
    },
  });
}

export function useChangePassword() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: async () => {
      toast.success("Password changed successfully.");
      // Refresh user profile so hasPassword updates in the store
      // (important when an OAuth-only user sets a password for the first time)
      await refreshUserProfile(setUser);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useMFASetup() {
  return useMutation({
    mutationFn: authApi.mfaSetup,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useMFAVerify() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: authApi.mfaVerify,
    onSuccess: async () => {
      toast.success("MFA enabled successfully.");
      await refreshUserProfile(setUser);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useMFADisable() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: authApi.mfaDisable,
    onSuccess: async () => {
      toast.success("MFA disabled successfully.");
      await refreshUserProfile(setUser);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useMFAChallenge() {
  const router = useRouter();
  const { setUser, setToken, clearMFATempToken } = useAuthStore();

  return useMutation({
    mutationFn: authApi.mfaChallenge,
    onSuccess: async (data) => {
      try {
        clearMFATempToken();
        await handleLoginSuccess(data.accessToken, setToken, setUser);
        toast.success("Logged in successfully!");
        router.push("/");
      } catch {
        toast.error("MFA passed but failed to fetch user details.");
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useMFARegenerateBackupCodes() {
  return useMutation({
    mutationFn: authApi.mfaRegenerateBackupCodes,
    onSuccess: () => {
      toast.success("Backup codes regenerated. Save them somewhere safe!");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeactivateAccount() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.deactivateAccount,
    onSuccess: () => {
      clearAuth();
      toast.success("Account deactivated. You can reactivate anytime.");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteAccount() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.deleteAccount,
    onSuccess: () => {
      clearAuth();
      toast.success("Account deleted permanently.");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useReactivateAccount() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.reactivateAccount,
    onSuccess: () => {
      toast.success("Account reactivated! You can now log in.");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
