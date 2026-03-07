
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const sections = await prisma.section.findMany();
    console.log('--- SECTIONS START ---');
    console.log(JSON.stringify(sections, null, 2));
    console.log('--- SECTIONS END ---');
}
main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
