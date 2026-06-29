import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { Express } from "express";

const isProd = process.env.NODE_ENV === "production";

export function configureHelmet(app: Express): void {
  app.disable("x-powered-by");

  const devConnectSrc = isProd
    ? []
    : ["ws://localhost:*", "ws://127.0.0.1:*", "ws://0.0.0.0:*"];

  const devScriptSrc = isProd ? [] : ["'unsafe-inline'"];

  app.use(
    helmet({
      // HSTS is already set by the Cloudflare/ingress layer; avoid a duplicate header.
      strictTransportSecurity: false,
      // COEP breaks certain third-party embeds; disable it.
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", ...devScriptSrc],
          // 'unsafe-inline' for Radix UI / shadcn dynamic styles;
          // Google Fonts stylesheet served from fonts.googleapis.com.
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "wss://aurivian.nl", ...devConnectSrc],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
    })
  );
}

export interface RateLimitConfig {
  maxSignin?: number;
  windowMsSignin?: number;
  maxSignup?: number;
  windowMsSignup?: number;
  maxMagicLink?: number;
  windowMsMagicLink?: number;
  maxDemo?: number;
  windowMsDemo?: number;
}

function makeLimit(max: number, windowMs: number, msg: string) {
  return rateLimit({
    windowMs,
    max,
    message: { message: msg },
    // RFC 9110 draft-7 RateLimit-* headers only; no deprecated X-RateLimit-* headers.
    standardHeaders: "draft-7",
    legacyHeaders: false,
  });
}

/**
 * Returns a fresh set of rate limiters, each with an isolated MemoryStore.
 *
 * Call this once per Express app instance (i.e. inside registerAuthRoutes).
 * That guarantees tests that spin up their own Express app always start with
 * clean counters and can specify reduced limits without touching production
 * values — no global skip, no shared state.
 *
 * Production limits (when opts is omitted):
 *   signin     10 / 15 min / IP
 *   signup      5 / 60 min / IP
 *   magic-link  5 / 15 min / IP
 *   demo       10 / 60 min / IP
 *
 * IP detection: express-rate-limit reads req.ip, which Express derives from the
 * rightmost untrusted entry in X-Forwarded-For when trust proxy is set.  With
 * trust proxy: 1 (one Northflank hop), a client-supplied X-Forwarded-For prefix
 * is ignored — Northflank always appends the real client IP last.
 */
export function createRateLimiters(opts: RateLimitConfig = {}) {
  return {
    signin: makeLimit(
      opts.maxSignin ?? 10,
      opts.windowMsSignin ?? 15 * 60 * 1000,
      "Too many sign-in attempts, please try again later"
    ),
    signup: makeLimit(
      opts.maxSignup ?? 5,
      opts.windowMsSignup ?? 60 * 60 * 1000,
      "Too many sign-up attempts, please try again later"
    ),
    magicLink: makeLimit(
      opts.maxMagicLink ?? 5,
      opts.windowMsMagicLink ?? 15 * 60 * 1000,
      "Too many magic link requests, please try again later"
    ),
    demo: makeLimit(
      opts.maxDemo ?? 10,
      opts.windowMsDemo ?? 60 * 60 * 1000,
      "Too many demo requests, please try again later"
    ),
  };
}
