import type { Express, RequestHandler, ErrorRequestHandler } from "express";
import type { Router } from "express";
import { logger } from "./lib/logger";
import { prisma } from "./config/prisma";
import app from "./app";
import authRoutes from "./modules/auth/auth.routes";
import oauthRoutes from "./modules/auth/oauth/oauth.routes";
import mfaRoutes from "./modules/auth/mfa/mfa.routes";
import projectRoutes from "./modules/project/project.routes";
import { authenticate } from "./middlewares/auth.middleware";
import { requireMFA } from "./middlewares/mfa.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";

export interface AuthHero {
  app: Express;
  routes: {
    auth: Router;
    oauth: Router;
    mfa: Router;
    projects: Router;
  };
  authenticate: RequestHandler;
  requireMFA: RequestHandler;
  errorMiddleware: ErrorRequestHandler;
  prisma: typeof prisma;
  shutdown: () => Promise<void>;
}

export async function createAuthHero(): Promise<AuthHero> {
  async function shutdown() {
    logger.info("Shutting down AuthHero...");
    await prisma.$disconnect();
    logger.info("Database connection closed");
  }

  return {
    app,
    routes: {
      auth: authRoutes,
      oauth: oauthRoutes,
      mfa: mfaRoutes,
      projects: projectRoutes,
    },
    authenticate,
    requireMFA,
    errorMiddleware,
    prisma,
    shutdown,
  };
}
