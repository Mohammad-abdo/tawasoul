import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const r = await p.$queryRaw`SHOW VARIABLES LIKE 'datadir'`;
console.log(r);
await p.$disconnect();
