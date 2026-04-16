import api from "./axios";
import type {
  RegisterResponse,
  LoginResponse,
  LoginMFAResponse,
  PublicUser,
  ApiResponse,
  MFASetupResponse,
  MFAChallengeResponse,
  MFABackupCodesResponse,
  OAuthExchangeResponse,
  MessageResponse,
} from "@/types/auth.types";
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  VerifyEmailInput,
  DeactivateAccountInput,
  DeleteAccountInput,
  ReactivateAccountInput,
} from "./validators/auth.schema";

// ─── Auth API functions ───
// Each function is a thin, typed wrapper around the axios instance.
// They return the *data* directly (unwrapping AxiosResponse) so consumers
// never have to deal with `response.data`.

export const authApi = {
  register: async (data: RegisterInput) => {
    const res = await api.post<ApiResponse<RegisterResponse>>(
      "/auth/register",
      data,
    );
    return res.data.data;
  },

  login: async (data: LoginInput) => {
    const res = await api.post<ApiResponse<LoginResponse | LoginMFAResponse>>(
      "/auth/login",
      data,
    );
    return res.data.data;
  },

  getMe: async () => {
    const res = await api.get<ApiResponse<PublicUser>>("/auth/me");
    return res.data.data;
  },

  forgotPassword: async (data: ForgotPasswordInput) => {
    const res = await api.post<{ message: string }>(
      "/auth/forgot-password",
      data,
    );
    return res.data;
  },

  resetPassword: async (data: ResetPasswordInput) => {
    const res = await api.post<{ message: string }>(
      "/auth/reset-password",
      data,
    );
    return res.data;
  },

  verifyEmail: async (data: VerifyEmailInput) => {
    const res = await api.post<{ message: string }>("/auth/verify-email", data);
    return res.data;
  },

  changePassword: async (data: ChangePasswordInput) => {
    const res = await api.post<{ message: string }>(
      "/auth/change-password",
      data,
    );
    return res.data;
  },

  refreshToken: async () => {
    const res = await api.post<ApiResponse<{ accessToken: string }>>(
      "/auth/refresh-token",
    );
    return res.data.data;
  },

  logout: async () => {
    const res = await api.post<{ message: string }>("/auth/logout");
    return res.data;
  },

  logoutAll: async () => {
    const res = await api.post<{ message: string }>("/auth/logout-all");
    return res.data;
  },

  // ─── MFA ───

  mfaSetup: async () => {
    const res =
      await api.post<ApiResponse<MFASetupResponse>>("/auth/mfa/setup");
    return res.data.data;
  },

  mfaVerify: async (token: string) => {
    const res = await api.post<{ message: string }>("/auth/mfa/verify", {
      token,
    });
    return res.data;
  },

  mfaDisable: async (code: string) => {
    const res = await api.post<{ message: string }>("/auth/mfa/disable", {
      code,
    });
    return res.data;
  },

  mfaChallenge: async (data: { tempToken: string; code: string }) => {
    const res = await api.post<ApiResponse<MFAChallengeResponse>>(
      "/auth/mfa/challenge",
      data,
    );
    return res.data.data;
  },

  mfaRegenerateBackupCodes: async (code: string) => {
    const res = await api.post<ApiResponse<MFABackupCodesResponse>>(
      "/auth/mfa/regenerate-backup-codes",
      { code },
    );
    return res.data.data;
  },

  // ─── OAuth ───
  // Exchange the one-time code from the OAuth redirect for real tokens.
  // The backend consumes (deletes) the code on first use.
  exchangeOAuthCode: async (code: string) => {
    const res = await api.post<OAuthExchangeResponse>("/auth/oauth/exchange", {
      code,
    });
    return res.data.data;
  },

  // ─── Account Actions ───

  deactivateAccount: async (data: DeactivateAccountInput) => {
    const res = await api.post<MessageResponse>("/auth/deactivate", data);
    return res.data;
  },

  deleteAccount: async (data: DeleteAccountInput) => {
    const res = await api.post<MessageResponse>("/auth/delete-account", data);
    return res.data;
  },

  reactivateAccount: async (data: ReactivateAccountInput) => {
    const res = await api.post<MessageResponse>("/auth/reactivate", data);
    return res.data;
  },
} as const;
