# Security

This document describes the security controls active in production as of commit `67db57366e4481d56716f5249faf7217efc31e8a` (2026-06-27).

---

## Security headers (Helmet)

Helmet v8.2.0 is applied in `server/security.ts` via `configureHelmet(app)`, called before any route registration in `server/index.ts`.

### Active headers (verified on aurivian.nl)

| Header | Value |
|---|---|
| `Content-Security-Policy` | see below |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` (overridden by CSP `frame-ancestors 'none'` in modern browsers) |
| `Referrer-Policy` | `no-referrer` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |
| `X-DNS-Prefetch-Control` | `off` |
| `X-XSS-Protection` | `0` (deprecated header explicitly disabled) |
| `X-Powered-By` | **absent** (disabled via `app.disable('x-powered-by')`) |

### Content Security Policy

```
default-src        'self'
script-src         'self'
style-src          'self' 'unsafe-inline' https://fonts.googleapis.com
font-src           'self' https://fonts.gstatic.com
img-src            'self' data: https:
connect-src        'self' wss://aurivian.nl
object-src         'none'
base-uri           'self'
frame-ancestors    'none'
form-action        'self'
script-src-attr    'none'
upgrade-insecure-requests
```

In development (`NODE_ENV !== 'production'`) the `connect-src` directive additionally includes `ws://localhost:*` and `ws://127.0.0.1:*` for Vite's HMR WebSocket.

**Design decisions:**
- `'unsafe-inline'` in `style-src` is required by Radix UI / shadcn dynamic styles.
- `https://fonts.googleapis.com` and `https://fonts.gstatic.com` are required for Inter and JetBrains Mono (loaded via Google Fonts).
- `wss://aurivian.nl` is required for the run-log WebSocket stream.
- HSTS (`Strict-Transport-Security`) is **not set by the application** — it is applied by Cloudflare's ingress. Setting it here would result in a duplicate header.
- `crossOriginEmbedderPolicy: false` — COEP is disabled because it would block certain third-party embeds.

---

## Rate limiting (express-rate-limit)

Rate limiters are created in `server/security.ts` via `createRateLimiters(opts?)` and applied in `server/auth.ts` via `registerAuthRoutes(app, opts?)`.

### Production limits

| Endpoint | Max requests | Window | Per |
|---|---|---|---|
| `POST /api/auth/signin` | 10 | 15 minutes | IP |
| `POST /api/auth/signup` | 5 | 60 minutes | IP |
| `POST /api/auth/magic-link` | 5 | 15 minutes | IP |
| `POST /api/auth/demo` | 10 | 60 minutes | IP |

### Response headers on limit (RFC 9110 draft-7)

When a request is blocked (HTTP 429), the response includes:

```
RateLimit:        limit=10, remaining=0, reset=893
RateLimit-Policy: 10;w=900
Retry-After:      893
```

The combined `RateLimit` header is draft-7 format (not the draft-6 `RateLimit-Limit` / `RateLimit-Remaining` split). Legacy `X-RateLimit-*` headers are not sent (`legacyHeaders: false`).

### IP detection (trust proxy)

```
app.set('trust proxy', 1)   // set in setupAuth()
```

With `trust proxy: 1`, Express reads `req.ip` from the rightmost untrusted entry in the `X-Forwarded-For` header. Northflank's load-balancer appends the real client IP as the last XFF value, so a client-supplied XFF prefix cannot spoof a different rate-limit bucket.

Verified by tests in `tests/api/security.test.ts`:
- Requests below the limit → 200
- Request N+1 → 429 with RFC 9110 headers
- Different IPs have independent counters
- Spoofed XFF prefix does not bypass the real IP's limit

### Testability

`createRateLimiters()` uses a fresh `MemoryStore` per call. Tests call `registerAuthRoutes(app, { maxSignin: 2 })` to inject low limits into a fresh Express instance. There is no global `skip` callback in `NODE_ENV=test` — tests prove real 429 behaviour.

---

## Authentication

- **Strategy:** Passport.js local strategy (email + password)
- **Password hashing:** bcrypt with 10 salt rounds
- **Sessions:** PostgreSQL-backed via `connect-pg-simple` (`sessions` table)
- **Cookie:** `httpOnly: true`, `secure: true` in production, `SameSite` inherits Express default
- **Session TTL:** 7 days
- **Demo accounts:** read-only — `isDemoReadOnly` middleware blocks all `POST`/`PUT`/`PATCH`/`DELETE` for demo users

### Auth endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/signup` | POST | Create account + auto-signin |
| `/api/auth/signin` | POST | Passport local authenticate |
| `/api/auth/magic-link` | POST | Generate magic-link token (email delivery: **TODO**) |
| `/api/auth/magic-link/:token` | GET | Verify token + redirect to `/app` |
| `/api/auth/demo` | POST | Create / reuse demo account + signin |
| `/api/auth/user` | GET | Return sanitized user if authenticated |
| `/api/logout` | POST | `req.logout()` |

> **Magic link email delivery** — the token is currently logged to the server console (`console.log`). No email is sent. This is an open item before any production use of the magic-link flow.

---

## Authorization (RBAC)

All `/api/*` endpoints require the `isAuthenticated` middleware. Data is always filtered by `orgId` — no cross-org data leakage is possible at the query level. Role-based access control is enforced server-side via `checkRole()`.

---

## Transport security

TLS is terminated by Cloudflare (Full strict mode). HSTS with `max-age=31536000; includeSubDomains` is applied by Cloudflare's ingress header rules. The application does not set HSTS directly.

---

## Known open items

| Item | Severity | Notes |
|---|---|---|
| `www.aurivian.nl` redirect | ~~P1~~ **Resolved** | Cloudflare Redirect Rule `www.aurivian.nl → https://aurivian.nl` (301) is live as of 2026-06-27. Path and query string are preserved. |
| Magic link email delivery | High | Token is logged to server console (`console.log`), not emailed. The magic-link flow must not be promoted to users until email delivery is implemented. |
| `SameSite` cookie attribute | Medium | Not explicitly set; inherits Express default |
| Contact form server-side validation | Low | Current transport is `mailto:` |

---

## Responsible disclosure

Report security issues to `security@aurivian.nl`.
