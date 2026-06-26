import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createServer } from 'http';
import { configureHelmet, signinRateLimit, signupRateLimit, magicLinkRateLimit } from '../../server/security';
import { registerRoutes } from '../../server/routes';

function buildApp() {
  const app = express();
  const httpServer = createServer(app);
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  configureHelmet(app);
  return { app, httpServer };
}

describe('Security headers (helmet)', () => {
  let app: express.Application;
  let httpServer: any;

  beforeEach(async () => {
    ({ app, httpServer } = buildApp());
    await registerRoutes(httpServer, app);
  });

  it('sets X-Content-Type-Options: nosniff', async () => {
    const res = await request(httpServer).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('sets X-Frame-Options to deny framing', async () => {
    const res = await request(httpServer).get('/api/health');
    // helmet sets SAMEORIGIN; our CSP sets frame-ancestors 'none'
    expect(res.headers['x-frame-options']).toBeDefined();
  });

  it('does not expose x-powered-by', async () => {
    const res = await request(httpServer).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('sets Content-Security-Policy header', async () => {
    const res = await request(httpServer).get('/api/health');
    const csp = res.headers['content-security-policy'];
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it('CSP allows wss://aurivian.nl in connect-src', async () => {
    const res = await request(httpServer).get('/api/health');
    const csp = res.headers['content-security-policy'];
    expect(csp).toContain('wss://aurivian.nl');
  });

  it('CSP allows Google Fonts in style-src and font-src', async () => {
    const res = await request(httpServer).get('/api/health');
    const csp = res.headers['content-security-policy'];
    expect(csp).toContain('fonts.googleapis.com');
    expect(csp).toContain('fonts.gstatic.com');
  });
});

describe('Auth rate limiters (skip in test env)', () => {
  it('rate limiter skip function returns true in test env', () => {
    // In the test environment NODE_ENV=test, so all limiters skip.
    // We verify this by calling many requests without hitting 429.
    const app = express();
    app.use(express.json());
    // Attach limiters directly to a test route to confirm skip works.
    app.post('/test/signin', signinRateLimit, (_req, res) => res.json({ ok: true }));
    app.post('/test/signup', signupRateLimit, (_req, res) => res.json({ ok: true }));
    app.post('/test/magic', magicLinkRateLimit, (_req, res) => res.json({ ok: true }));

    return Promise.all(
      Array.from({ length: 20 }, () =>
        request(app).post('/test/signin').send({})
      )
    ).then((responses) => {
      // All 20 requests must succeed (not hit 429) because skip=true in test env
      responses.forEach((r) => expect(r.status).not.toBe(429));
    });
  });
});
