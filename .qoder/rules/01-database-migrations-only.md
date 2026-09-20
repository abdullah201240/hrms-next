---
trigger: always_on
---

# Database Schema Policy — Migrations Only

- `prisma db push` and `prisma db pull` are FULLY DISABLED in this project.
- Every schema change MUST be a versioned migration:
  1. Edit `prisma/schema.prisma`
  2. Run `npm run db:migrate` (which executes `prisma migrate dev --name <descriptive_name>`)
  3. The generated SQL file in `prisma/migrations/` is the single source of truth and must always be kept committed/runnable
- Never mutate the `hrms_next` PostgreSQL database manually (no psql DDL, no direct table edits, `prisma studio` may only be used for data browsing, never schema changes).
- `npm run db:push` / `db:pull` are intentionally wired to a guard script (`scripts/guard-no-db-push.mjs`) that exits 1 — do not restore or bypass it.
- In production/CI, apply schema with `prisma migrate deploy` only.
