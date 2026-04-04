
[2026-04-04] Found the bug in auth.ts:45 — null check missing on token
[2026-04-04] Fixed by adding: if (!token) throw new AuthError()