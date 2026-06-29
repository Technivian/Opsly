# Database migrations

Drizzle-managed schema migrations live in this directory (`drizzle-kit`).
Historically the project applied schema changes with `drizzle-kit push`
(`npm run db:push`). From this release onward, schema is versioned.

## Scripts

- `npm run db:generate` — generate a new migration from `shared/schema.ts` diffs
- `npm run db:migrate`  — apply pending migrations (`drizzle.__drizzle_migrations` tracks state)
- `npm run db:push`     — (legacy) push schema directly; avoid for tracked environments

## Staging / production release runbook (ordered)

Do NOT change staging or production without an explicit instruction. When
authorised, run these steps in order against the target database:

1. **Back-up first.** Take a full backup before any change:
   ```bash
   pg_dump "$DATABASE_URL" -Fc -f opsly_backup_$(date +%Y%m%d_%H%M%S).dump
   ```
   Confirm the dump file exists and is non-empty before continuing.
2. **Baseline** the existing push-managed database (see section below) using the
   full SHA-256 hash of `0000_baseline_schema.sql`.
3. **Run `npm run db:migrate`** and **confirm it is a no-op**
   (`[✓] migrations applied successfully!` with no DDL executed, because `0000`
   is already recorded).
4. **Run the locale data migration** `0001_locale_en_to_nl.sql`.
5. **Check counts before and after** the data migration (see that section).

## New / empty databases

```bash
DATABASE_URL=... npm run db:migrate
```

Applies `0000_baseline_schema.sql` (full schema, incl. `users.google_id` and
`user_preferences.locale DEFAULT 'nl'`). Verified to build an empty database
from scratch.

## Existing databases (previously push-managed)

These already contain every table, so running `db:migrate` naively FAILS
(it tries to re-create existing objects, e.g. `type "backlog_type" already exists`).
They must be **baselined**: mark `0000` as already applied without running it.

Run once per existing environment (dev, test, staging, production):

```sql
CREATE SCHEMA IF NOT EXISTS drizzle;
CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL,
  created_at bigint
);
-- hash = sha256 of migrations/0000_baseline_schema.sql
-- created_at = "when" from migrations/meta/_journal.json (entry idx 0)
INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
SELECT '3963d996df9c5c45505a68d574eb53660afa917ef12d172f385178de80138be4', 1782717244693
WHERE NOT EXISTS (
  SELECT 1 FROM drizzle.__drizzle_migrations
  WHERE hash = '3963d996df9c5c45505a68d574eb53660afa917ef12d172f385178de80138be4'
);
```

If the schema source file ever changes, recompute the hash:
`shasum -a 256 migrations/0000_baseline_schema.sql`.

After baselining, `npm run db:migrate` is a no-op and any future `00xx_*`
migration applies normally. Verified on a throwaway copy: pre-baseline migrate
errors, post-baseline migrate succeeds.

## Data migrations (`migrations/data/`)

One-off data migrations that are NOT schema changes. Run manually as a release
step against the target database.

### `0001_locale_en_to_nl.sql` — Dutch-first default (release 2026-06-29)

`user_preferences.locale` previously defaulted to `'en'` (an unintended dev
default). The default is now `'nl'`. This migrates existing rows that were never
deliberately changed:

Check counts **before**, run the migration, then verify **after**:

```bash
# BEFORE — note how many rows are 'en' / 'nl'
psql "$DATABASE_URL" -c "SELECT locale, count(*) FROM user_preferences GROUP BY locale;"

# RUN
psql "$DATABASE_URL" -f migrations/data/0001_locale_en_to_nl.sql

# AFTER — eligible 'en' rows (updated_at = created_at) should now be 'nl';
# any remaining 'en' rows are deliberate choices that were intentionally kept
psql "$DATABASE_URL" -c "SELECT locale, count(*) FROM user_preferences GROUP BY locale;"
```

Release decision: migrate `'en' -> 'nl'` **only** where `updated_at = created_at`
(row never modified after creation ⇒ no deliberate preference). Rows touched via
`PATCH /api/preferences` (`updated_at != created_at`) are left untouched to
preserve a genuine explicit English choice. Trade-off: a user who changed only
their theme is also skipped and keeps `'en'`; they can switch via the in-app
language switcher (which records an explicit choice client-side). Idempotent.
