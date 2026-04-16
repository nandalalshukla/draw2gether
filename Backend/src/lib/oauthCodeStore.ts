type OAuthCodePayload =
  | {
      mfaRequired: true;
      tempToken: string;
    }
  | {
      mfaRequired: false;
      accessToken: string;
      refreshToken: string;
    };

type StoreEntry = {
  payload: OAuthCodePayload;
  expiresAt: number;
};

const oauthCodeStore = new Map<string, StoreEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of oauthCodeStore) {
    if (entry.expiresAt <= now) {
      oauthCodeStore.delete(key);
    }
  }
}, 60_000).unref();

export const setOAuthCode = (
  code: string,
  payload: OAuthCodePayload,
  ttlSeconds: number,
): void => {
  oauthCodeStore.set(code, {
    payload,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

export const consumeOAuthCode = (code: string): OAuthCodePayload | null => {
  const entry = oauthCodeStore.get(code);
  if (!entry) {
    return null;
  }

  oauthCodeStore.delete(code);

  if (entry.expiresAt <= Date.now()) {
    return null;
  }

  return entry.payload;
};
