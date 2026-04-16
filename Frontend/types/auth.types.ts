// ─── Types mirrored from authhero-server/src/modules/auth/auth.types.ts ───
// Keep these in sync with the server. If the server changes, update here.

export interface PublicUser {
  id: string;
  fullname: string;
  email: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  hasPassword: boolean;
}

export interface RegisterResponse {
  user: PublicUser;
  verificationToken: string;
}

export interface LoginResponse {
  mfaRequired: false;
  accessToken: string;
}

export interface LoginMFAResponse {
  mfaRequired: true;
  tempToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  errorCode?: string;
  errors?: Record<string, string[]>;
}

// ─── API wrapper that the server wraps every response in ───
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── MFA ───
export interface MFASetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface MFAChallengeResponse {
  accessToken: string;
}

export interface MFABackupCodesResponse {
  backupCodes: string[];
}

// ─── OAuth ───
export interface OAuthExchangeResponse {
  success: boolean;
  message: string;
  data:
    | { mfaRequired: false; accessToken: string }
    | { mfaRequired: true; tempToken: string };
}

// ─── Account Actions ───
export interface MessageResponse {
  message: string;
}
