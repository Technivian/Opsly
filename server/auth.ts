import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { seedDemoOrganization } from "./seed-demo";
import { createRateLimiters, type RateLimitConfig } from "./security";

const SALT_ROUNDS = 10;

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
  return result[0] || null;
}

export async function getUserById(id: string) {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0] || null;
}

export async function createUser(email: string, password: string, firstName?: string, lastName?: string) {
  const passwordHash = await hashPassword(password);
  const result = await db.insert(users).values({
    email: email.toLowerCase(),
    passwordHash,
    firstName,
    lastName,
    emailVerified: false,
  }).returning();
  return result[0];
}

export async function createDemoUser() {
  const existing = await getUserByEmail("demo@aurivian.nl");
  if (existing) {
    await seedDemoOrganization();
    return existing;
  }
  
  const result = await db.insert(users).values({
    id: "demo-user-id",
    email: "demo@aurivian.nl",
    passwordHash: await hashPassword("demo123"),
    firstName: "Demo",
    lastName: "User",
    emailVerified: true,
    isDemo: true,
  }).returning();
  
  await seedDemoOrganization();
  return result[0];
}

export async function findOrCreateGoogleUser(
  googleId: string,
  email: string,
  firstName?: string,
  lastName?: string,
  profileImageUrl?: string,
) {
  // Already linked by Google ID
  const byGoogle = await db.select().from(users).where(eq(users.googleId, googleId));
  if (byGoogle[0]) return byGoogle[0];

  // Existing account with same email → link Google to it
  const byEmail = await getUserByEmail(email);
  if (byEmail) {
    const updated = await db.update(users)
      .set({
        googleId,
        emailVerified: true,
        profileImageUrl: byEmail.profileImageUrl || profileImageUrl,
        firstName: byEmail.firstName || firstName,
        lastName: byEmail.lastName || lastName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, byEmail.id))
      .returning();
    return updated[0];
  }

  // Brand new user
  const result = await db.insert(users).values({
    email: email.toLowerCase(),
    googleId,
    firstName,
    lastName,
    profileImageUrl,
    emailVerified: true,
  }).returning();
  return result[0];
}

export async function generateMagicLinkToken(email: string): Promise<string | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;
  
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  await db.update(users)
    .set({ magicLinkToken: token, magicLinkExpires: expires })
    .where(eq(users.id, user.id));
  
  return token;
}

export async function verifyMagicLinkToken(token: string) {
  const result = await db.select().from(users).where(eq(users.magicLinkToken, token));
  const user = result[0];
  
  if (!user || !user.magicLinkExpires || new Date() > user.magicLinkExpires) {
    return null;
  }
  
  await db.update(users)
    .set({ magicLinkToken: null, magicLinkExpires: null, emailVerified: true })
    .where(eq(users.id, user.id));
  
  return user;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }
          if (!user.passwordHash) {
            return done(null, false, { message: "Please use magic link to sign in" });
          }
          const isValid = await verifyPassword(password, user.passwordHash);
          if (!isValid) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Google OAuth — only registered when credentials are configured.
  // Falls back to the existing Gmail OAuth client (same Google Cloud project).
  const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.GMAIL_CLIENT_SECRET;
  const googleCallbackUrl =
    process.env.GOOGLE_CALLBACK_URL ||
    `${process.env.BASE_URL || "http://localhost:3000"}/api/auth/google/callback`;

  if (googleClientId && googleClientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: googleCallbackUrl,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(null, false, { message: "Google account has no email" });
            }
            const user = await findOrCreateGoogleUser(
              profile.id,
              email,
              profile.name?.givenName,
              profile.name?.familyName,
              profile.photos?.[0]?.value,
            );
            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
    console.log("[auth] Google SSO enabled");
  } else {
    console.log("[auth] Google SSO disabled (no GOOGLE_CLIENT_ID/GMAIL_CLIENT_ID)");
  }

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await getUserById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export const isDemoReadOnly: RequestHandler = (req, res, next) => {
  const user = req.user as any;
  if (user?.isDemo && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return res.status(403).json({ message: "Demo account is read-only" });
  }
  return next();
};

export function registerAuthRoutes(app: Express, rateLimitOpts: RateLimitConfig = {}) {
  // Fresh limiters per call → each Express app instance (incl. test apps) gets
  // its own isolated MemoryStore.  Tests can pass low limits to prove 429 behaviour.
  const { signin, signup, magicLink, demo } = createRateLimiters(rateLimitOpts);

  app.post("/api/auth/signup", signup, async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      
      const existing = await getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const user = await createUser(email, password, firstName, lastName);
      
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to sign in after registration" });
        }
        return res.json({ 
          success: true, 
          user: sanitizeUser(user)
        });
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/auth/signin", signin, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ message: "Failed to sign in" });
        }
        return res.json({ 
          success: true, 
          user: sanitizeUser(user)
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/magic-link", magicLink, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const token = await generateMagicLinkToken(email);
      if (!token) {
        return res.json({ success: true, message: "If an account exists, a magic link has been sent" });
      }
      
      console.log(`Magic link token for ${email}: ${token}`);
      return res.json({ success: true, message: "If an account exists, a magic link has been sent" });
    } catch (error) {
      console.error("Magic link error:", error);
      res.status(500).json({ message: "Failed to send magic link" });
    }
  });

  app.get("/api/auth/magic-link/:token", async (req, res) => {
    try {
      const user = await verifyMagicLinkToken(req.params.token);
      if (!user) {
        return res.redirect("/auth/signin?error=invalid_token");
      }
      
      req.login(user, (err) => {
        if (err) {
          return res.redirect("/auth/signin?error=login_failed");
        }
        return res.redirect("/app");
      });
    } catch (error) {
      console.error("Magic link verification error:", error);
      res.redirect("/auth/signin?error=verification_failed");
    }
  });

  app.post("/api/auth/demo", demo, async (req, res) => {
    try {
      const demoUser = await createDemoUser();
      req.login(demoUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to start demo" });
        }
        return res.json({ 
          success: true, 
          user: sanitizeUser(demoUser)
        });
      });
    } catch (error) {
      console.error("Demo login error:", error);
      res.status(500).json({ message: "Failed to start demo" });
    }
  });

  // Google OAuth — start flow. Returns 404-style redirect if not configured.
  app.get("/api/auth/google", (req, res, next) => {
    if (!(passport as any)._strategy("google")) {
      return res.redirect("/auth/signin?error=google_not_configured");
    }
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });

  app.get("/api/auth/google/callback", (req, res, next) => {
    passport.authenticate("google", (err: any, user: any, info: any) => {
      if (err || !user) {
        console.error("[auth] Google callback failed:", err || info);
        return res.redirect("/auth/signin?error=google_failed");
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.redirect("/auth/signin?error=login_failed");
        }
        return res.redirect("/app");
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      return res.json(sanitizeUser(user));
    }
    return res.status(401).json({ message: "Not authenticated" });
  });
}

function sanitizeUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isDemo: user.isDemo || false,
  };
}
