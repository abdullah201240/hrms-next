<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Hard Rules

- **Database: migrations only.** `prisma db push`/`db pull` are disabled and guarded. All schema changes go through `npm run db:migrate`. See `.qoder/rules/01-database-migrations-only.md`.
- **UI: shadcn-only + flat.** Only shadcn/ui components; no other UI libs. No shadows and no rounded corners anywhere (globally enforced in globals.css). See `.qoder/rules/02-shadcn-flat-ui.md`.
