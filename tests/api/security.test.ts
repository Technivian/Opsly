/**
 * Security tests: helmet headers + rate limiting.
 *
 * Rate limiter design note
 * ─────────────────────────
 * createRateLimiters() is called inside registerAuthRoutes(), so each Express
 * app instance built in beforeEach gets an isolated MemoryStore.  Tests that
 * need to prove 429 behaviour pass a low max (e.g. 2) so they can hit the
 * limit within a handful of requests, while the rest of the suite never
 * approaches the production limits.
 *
 * IP detection behind Northflank
 * ──────────────────────────────
 * Production: trust proxy: 1 (set in setupAuth).  Northflank's load-balancer
 * appends the real client IP as the LAST value in X-Forwarded-For before the
 * request reaches Node.  With trust proxy: 1, express-rate-limit uses
 * req.ip = rightmost untrusted XFF entry (i.e. what Northflank added), so
 * a client-supplied prefix is ignored.
 *
 * In tests the loopback socket (127.0.0.1) takes the role of "trusted proxy".
 * Setting X-Forwarded-For: <ip> in supertest makes req.ip = <ip>, which lets
 * us prove per-IP isolation without a real proxy.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createServer } from 'http';
import { configureHelmet, createRateLimiters } from '../../server/security';
import { setupAuth, registerAuthRoutes } from '../../server/auth';
import { registerRoutes } from '../../server/routes';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Minimal Express app with a single POST /test endpoint protected by a
 * rate limiter configured to `max` requests per `windowMs`.  No DB needed.
 */
function buildLimiterApp(max: number, windowMs = 60_000) {
  const { signin } = createRateLimiters({ maxSignin: max, windowMsSignin: windowMs });
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json());
  app.post('/test', signin, (_req, res) => res.json({ ok: true }));
  return app;
}

/** Fire `n` POST /test requests from `ip` and return the response array. */
async function hit(app: express.Application, n: number, ip: string) {
  return Promise.all(
    Array.from({ length: n }, () =>
      request(app).post('/test').set('X-Forwarded-For', ip).send({})
    )
  );
}

// ─── Security headers ─────────────────────────────────────────────────────────

describe('Security headers (helmet)', () => {
  let httpServer: ReturnType<typeof createServer>;

  beforeEach(async () => {
    const app = express();
    httpServer = createServer(app);
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    configureHelmet(app);
    await registerRoutes(httpServer, app);
  });

  it('sets X-Content-Type-Options: nosniff', async () => {
    const res = await request(httpServer).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('sets X-Frame-Options', async () => {
    const res = await request(httpServer).get('/api/health');
    expect(res.headers['x-frame-options']).toBeDefined();
  });

  it('does not expose x-powered-by', async () => {
    const res = await request(httpServer).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('sets Content-Security-Policy with core directives', async () => {
    const res = await request(httpServer).get('/api/health');
    const csp = res.headers['content-security-policy'] as string;
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
  });

  it('CSP connect-src includes wss://aurivian.nl (WebSocket origin)', async () => {
    const res = await request(httpServer).get('/api/health');
    expect(res.headers['content-security-policy']).toContain('wss://aurivian.nl');
  });

  it('CSP includes Google Fonts origins for style and font loading', async () => {
    const res = await request(httpServer).get('/api/health');
    const csp = res.headers['content-security-policy'] as string;
    expect(csp).toContain('fonts.googleapis.com');
    expect(csp).toContain('fonts.gstatic.com');
  });
});

// ─── Rate limiter: unit behaviour (no DB) ─────────────────────────────────────

describe('Rate limiter — unit behaviour (no DB required)', () => {
  it('allows every request while below the limit', async () => {
    const app = buildLimiterApp(3);
    const responses = await hit(app, 3, '10.0.0.1');
    responses.forEach(r => expect(r.status).toBe(200));
  });

  it('returns 429 on the first request that exceeds the limit', async () => {
    const app = buildLimiterApp(2);
    // 2 allowed
    await hit(app, 2, '10.0.0.1');
    // 3rd must be blocked
    const blocked = await request(app).post('/test')
      .set('X-Forwarded-For', '10.0.0.1').send({});
    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toMatch(/Too many/i);
  });

  it('returns RFC 9110 draft-7 RateLimit headers on the 429 response', async () => {
    // draft-7 sends a single combined "RateLimit: limit=N, remaining=0, reset=T" header
    // plus a "RateLimit-Policy" header — NOT the individual draft-6 headers.
    const app = buildLimiterApp(1);
    await request(app).post('/test').set('X-Forwarded-For', '10.0.0.1').send({});
    const blocked = await request(app).post('/test')
      .set('X-Forwarded-For', '10.0.0.1').send({});
    expect(blocked.status).toBe(429);
    // Combined RateLimit header (RFC 9110 draft-7)
    expect(blocked.headers['ratelimit']).toBeDefined();
    expect(blocked.headers['ratelimit']).toContain('remaining=0');
    // Policy header
    expect(blocked.headers['ratelimit-policy']).toBeDefined();
    // Retry-After hint
    expect(blocked.headers['retry-after']).toBeDefined();
  });

  it('different IPs have independent counters', async () => {
    const app = buildLimiterApp(2);
    // Exhaust IP A
    await hit(app, 2, '10.1.0.1');
    const blockedA = await request(app).post('/test')
      .set('X-Forwarded-For', '10.1.0.1').send({});
    expect(blockedA.status).toBe(429);
    // IP B is completely unaffected
    const okB = await request(app).post('/test')
      .set('X-Forwarded-For', '10.1.0.2').send({});
    expect(okB.status).toBe(200);
  });

  it('trust proxy: X-Forwarded-For determines the rate-limit key', async () => {
    // Proves that req.ip (the RL key) is read from X-Forwarded-For, not from
    // the socket address.  Both requests come from the same socket (127.0.0.1
    // via supertest), but different XFF headers → different buckets.
    const app = buildLimiterApp(1);
    // Exhaust the limit for ip-A
    await request(app).post('/test').set('X-Forwarded-For', '20.0.0.1').send({});
    const blockedA = await request(app).post('/test')
      .set('X-Forwarded-For', '20.0.0.1').send({});
    expect(blockedA.status).toBe(429);
    // Same socket origin, different XFF → fresh bucket
    const freshIP = await request(app).post('/test')
      .set('X-Forwarded-For', '20.0.0.2').send({});
    expect(freshIP.status).toBe(200);
  });

  it('spoofed XFF prefix does not allow the real IP to bypass its limit', async () => {
    // Simulates the Northflank production scenario:
    //   • Client sends:      X-Forwarded-For: <fake>
    //   • Northflank appends: X-Forwarded-For: <fake>, <real-client-ip>
    //   • trust proxy: 1 → req.ip = <real-client-ip> (rightmost, set by proxy)
    //
    // The fake prefix does not affect the bucket — the rate limiter always
    // uses the real client IP regardless of what the client injected.
    const app = buildLimiterApp(1);
    const realIp = '30.0.0.1';

    // First request with spoofed prefix (simulates Northflank appending realIp)
    await request(app).post('/test')
      .set('X-Forwarded-For', `spoofed-fake, ${realIp}`).send({});

    // Same real IP, different spoofed prefix — still blocked
    const blocked = await request(app).post('/test')
      .set('X-Forwarded-For', `other-fake, ${realIp}`).send({});
    expect(blocked.status).toBe(429);

    // No XFF prefix, just the real IP — still blocked (same bucket)
    const alsoBlocked = await request(app).post('/test')
      .set('X-Forwarded-For', realIp).send({});
    expect(alsoBlocked.status).toBe(429);

    // A truly different real IP is not affected
    const ok = await request(app).post('/test')
      .set('X-Forwarded-For', '30.0.0.2').send({});
    expect(ok.status).toBe(200);
  });
});

// ─── Rate limiter: auth route integration (uses DB) ───────────────────────────

describe('Rate limiter — auth routes integration', () => {
  const MAX = 2; // deliberately low so we can prove 429 quickly

  async function buildAuthApp(opts: Parameters<typeof createRateLimiters>[0]) {
    const app = express();
    const server = createServer(app);
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    await setupAuth(app);          // sets trust proxy: 1, sessions, passport
    registerAuthRoutes(app, opts); // fresh limiters with test opts
    return { app, server };
  }

  it('POST /api/auth/signin returns 429 after the limit', async () => {
    const { server } = await buildAuthApp({ maxSignin: MAX, windowMsSignin: 60_000 });
    for (let i = 0; i < MAX; i++) {
      await request(server).post('/api/auth/signin')
        .set('X-Forwarded-For', '1.1.1.1')
        .send({ email: 'ratelimit-signin@test.local', password: 'wrong' });
    }
    const blocked = await request(server).post('/api/auth/signin')
      .set('X-Forwarded-For', '1.1.1.1')
      .send({ email: 'ratelimit-signin@test.local', password: 'wrong' });
    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toMatch(/Too many sign-in/i);
  });

  it('POST /api/auth/signup returns 429 after the limit', async () => {
    const { server } = await buildAuthApp({ maxSignup: MAX, windowMsSignup: 60_000 });
    for (let i = 0; i < MAX; i++) {
      await request(server).post('/api/auth/signup')
        .set('X-Forwarded-For', '2.2.2.2')
        .send({ email: `rl-signup-${i}@test.local`, password: 'password123' });
    }
    const blocked = await request(server).post('/api/auth/signup')
      .set('X-Forwarded-For', '2.2.2.2')
      .send({ email: 'rl-signup-overflow@test.local', password: 'password123' });
    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toMatch(/Too many sign-up/i);
  });

  it('POST /api/auth/magic-link returns 429 after the limit', async () => {
    const { server } = await buildAuthApp({ maxMagicLink: MAX, windowMsMagicLink: 60_000 });
    for (let i = 0; i < MAX; i++) {
      await request(server).post('/api/auth/magic-link')
        .set('X-Forwarded-For', '3.3.3.3')
        .send({ email: 'rl-magic@test.local' });
    }
    const blocked = await request(server).post('/api/auth/magic-link')
      .set('X-Forwarded-For', '3.3.3.3')
      .send({ email: 'rl-magic@test.local' });
    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toMatch(/Too many magic link/i);
  });

  it('different IPs have independent signin limits', async () => {
    const { server } = await buildAuthApp({ maxSignin: MAX, windowMsSignin: 60_000 });
    // Exhaust IP A
    for (let i = 0; i < MAX; i++) {
      await request(server).post('/api/auth/signin')
        .set('X-Forwarded-For', '4.4.4.1')
        .send({ email: 'x@test.local', password: 'wrong' });
    }
    const blockedA = await request(server).post('/api/auth/signin')
      .set('X-Forwarded-For', '4.4.4.1')
      .send({ email: 'x@test.local', password: 'wrong' });
    expect(blockedA.status).toBe(429);

    // IP B still has its full limit — gets 401 (bad creds), not 429
    const ipB = await request(server).post('/api/auth/signin')
      .set('X-Forwarded-For', '4.4.4.2')
      .send({ email: 'x@test.local', password: 'wrong' });
    expect(ipB.status).toBe(401);
    expect(ipB.status).not.toBe(429);
  });
});
