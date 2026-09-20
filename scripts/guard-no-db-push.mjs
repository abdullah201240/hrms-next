// GUARD: `prisma db push` / `db pull` are BANNED in this project.
// Policy: ALL schema changes must go through versioned migrations (`npm run db:migrate`).
// db push mutates the database without creating a migration file -> schema and
// prisma/migrations drift apart -> unreproducible databases in staging/production.
console.error(`
❌ BLOCKED: "db push" / "db pull" are disabled by project policy.

   The ONLY approved way to change the database schema:

     1. Edit  prisma/schema.prisma
     2. Run   npm run db:migrate        (prisma migrate dev --name <change_name>)
     3. This creates a real SQL migration in prisma/migrations/ and applies it.

   Why: migrations are the single source of truth — reproducible across every
   environment, reviewable, and reversible. db push bypasses all of that.
`);
process.exit(1);
