import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTables() {
    try {
        console.log('Creating home content tables...');

        // Create home_sliders table
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`home_sliders\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`titleAr\` VARCHAR(191) NOT NULL,
        \`titleEn\` VARCHAR(191) NULL,
        \`descriptionAr\` TEXT NULL,
        \`descriptionEn\` TEXT NULL,
        \`image\` VARCHAR(191) NOT NULL,
        \`buttonText\` VARCHAR(191) NULL,
        \`buttonLink\` VARCHAR(191) NULL,
        \`order\` INTEGER NOT NULL DEFAULT 0,
        \`isActive\` BOOLEAN NOT NULL DEFAULT true,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
        console.log('✓ Created home_sliders table');

        // Create home_services table
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`home_services\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`titleAr\` VARCHAR(191) NOT NULL,
        \`titleEn\` VARCHAR(191) NULL,
        \`descriptionAr\` TEXT NULL,
        \`descriptionEn\` TEXT NULL,
        \`image\` VARCHAR(191) NOT NULL,
        \`link\` VARCHAR(191) NULL,
        \`order\` INTEGER NOT NULL DEFAULT 0,
        \`isActive\` BOOLEAN NOT NULL DEFAULT true,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
        console.log('✓ Created home_services table');

        // Create home_articles table
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`home_articles\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`titleAr\` VARCHAR(191) NOT NULL,
        \`titleEn\` VARCHAR(191) NULL,
        \`descriptionAr\` TEXT NULL,
        \`descriptionEn\` TEXT NULL,
        \`image\` VARCHAR(191) NOT NULL,
        \`link\` VARCHAR(191) NULL,
        \`order\` INTEGER NOT NULL DEFAULT 0,
        \`isActive\` BOOLEAN NOT NULL DEFAULT true,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
        console.log('✓ Created home_articles table');

        // Create faqs table
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`faqs\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`questionAr\` VARCHAR(191) NOT NULL,
        \`questionEn\` VARCHAR(191) NULL,
        \`answerAr\` TEXT NOT NULL,
        \`answerEn\` TEXT NULL,
        \`category\` VARCHAR(191) NULL,
        \`order\` INTEGER NOT NULL DEFAULT 0,
        \`isActive\` BOOLEAN NOT NULL DEFAULT true,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
        console.log('✓ Created faqs table');

        console.log('\\n✅ All tables created successfully!');

    } catch (error) {
        console.error('❌ Error creating tables:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTables();
