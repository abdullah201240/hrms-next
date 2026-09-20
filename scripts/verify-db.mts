// End-to-end wiring test: Postgres via Prisma + Redis via ioredis
// Run with: node scripts/verify-db.mjs (after `npx tsx` or plain node with generated client)
import { PrismaPg } from '@prisma/adapter-pg';
import Redis from 'ioredis';
import 'dotenv/config';

const { PrismaClient } = await import('../src/generated/prisma/client.ts');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');

// --- Postgres / Prisma ---
const row = await prisma.healthCheck.create({ data: { message: 'ping from setup' } });
console.log('PG  WRITE ok  -> HealthCheck id =', row.id);
const rows = await prisma.healthCheck.findMany({ orderBy: { id: 'desc' }, take: 1 });
console.log('PG  READ  ok  -> message =', rows[0].message);

// --- Redis ---
await redis.set('hrms:setup:ping', 'pong', 'EX', 60);
const val = await redis.get('hrms:setup:ping');
console.log('REDIS WRITE ok -> hrms:setup:ping =', val);
const info = await redis.info('server');
console.log('REDIS version  ->', info.split('\n').find((l) => l.startsWith('redis_version')));

await prisma.$disconnect();
redis.disconnect();
console.log('\nALL CONNECTED: Prisma+PostgreSQL ✅  Redis ✅');
