import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { Express } from "express";

const isTest = process.env.NODE_ENV === "test";
const isProd = process.env.NODE_ENV === "production";

export function configureHelmet(app: Express): void {
  app.disable("x-powered-by");

  // Additional connect-src origins allowed in non-production (Vite HMR WebSocket)
  const devConnectSrc = isProd
    ? []
    : ["ws://localhost:*", "ws://127.0.0.1:*"];

  app.use(
    helmet({
      // HSTS is handled by the Cloudflare/ingress layer; avoid double-setting it.
      strictTransportSecurity: false,
      // COEP breaks some embedded resources; disable it.
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          // 'unsafe-inline' needed for Radix UI / shadcn dynamic styles;
          // Google Fonts stylesheet is loaded from fonts.googleapis.com.
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          // data: for inline images (avatars, icons); https: for OG images.
          imgSrc: ["'self'", "data:", "https:"],
          // Same-origin fetch/XHR plus the production WebSocket endpoint.
          connectSrc: [
            "'self'",
            "wss://aurivian.nl",
            ...devConnectSrc,
          ],
          // Prevent <object>/<embed> completely.
          objectSrc: ["'none'"],
          // Prevent <base> injection.
          baseUri: ["'self'"],
          // Prevent the page being framed anywhere (clickjacking).
          frameAncestors: ["'none'"],
        },
      },
    })
  );
}

// 10 sign-in attempts per 15 min per IP.
export const signinRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many sign-in attempts, please try again later" },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => isTest,
});

// 5 registrations per hour per IP.
export const signupRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: "Too many sign-up attempts, please try again later" },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => isTest,
});

// 5 magic-link requests per 15 min per IP — limits email flooding.
export const magicLinkRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many magic link requests, please try again later" },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => isTest,
});

// 10 demo-login attempts per hour per IP.
export const demoRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: "Too many demo requests, please try again later" },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => isTest,
});
