-- Production data migration — release: Dutch-first dashboard
-- Date: 2026-06-29
--
-- Context:
--   The `user_preferences.locale` column previously defaulted to 'en'. That was
--   an unintended development default, not a language deliberately offered to
--   the Dutch SME pilot users. The default is now 'nl' (schema + auto-create).
--   This one-off data migration brings EXISTING rows in line with Dutch-first.
--
-- Release decision:
--   Migrate locale 'en' -> 'nl' ONLY for rows that were never modified after
--   creation (updated_at = created_at). A row whose updated_at differs from
--   created_at was changed via PATCH /api/preferences (the only write path),
--   which means the user deliberately touched their preferences — those are
--   left untouched so a genuine explicit English choice is preserved.
--
--   Trade-off (documented): a user who changed only their THEME (also a PATCH)
--   but never their language will have updated_at != created_at and is therefore
--   NOT migrated; they keep 'en'. This is the safe direction — we never override
--   a preference that the user may have set on purpose. Such users can switch to
--   Dutch via the in-app language switcher (which now records an explicit choice).
--
-- Idempotent: re-running changes nothing once no eligible 'en' rows remain.

UPDATE user_preferences
SET locale = 'nl',
    updated_at = now()
WHERE locale = 'en'
  AND updated_at = created_at;
