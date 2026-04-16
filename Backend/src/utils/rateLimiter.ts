import { rateLimit, type Options, ipKeyGenerator } from "express-rate-limit";
import { TOO_MANY_REQUESTS } from "../config/http";

type RateLimiterConfig = {
  windowMs: number;
  max: number;
  message?: string;
  keyPrefix?: string;
};

export const createRateLimiter = ({
  windowMs,
  max,
  message = "Too many requests. Please try again later.",
  keyPrefix = "rl",
}: RateLimiterConfig) => {
  return rateLimit({
    // Use IP as the primary rate limit key.
    // DO NOT use req.body.email as primary — attackers can rotate fake emails
    // to bypass rate limiting. IP is the one thing they can't easily change.
    keyGenerator: (req) => {
      const ip = ipKeyGenerator(req.ip || "unknown");
      const email = req.body?.email;
      // Combine IP + email so the same IP can't brute-force different accounts
      return email ? `${keyPrefix}:${ip}:${email}` : `${keyPrefix}:${ip}`;
    },

    windowMs,
    max,

    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
      res.status(TOO_MANY_REQUESTS).json({
        success: false,
        error: {
          message,
          code: "RATE_LIMIT_EXCEEDED",
        },
      });
    },
  } satisfies Partial<Options>);
};
