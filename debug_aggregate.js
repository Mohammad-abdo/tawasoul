import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing aggregate...');
        const maxOrder = await prisma.homeSlider.aggregate({
            _max: { order: true }
        });
        console.log('Aggregate result:', JSON.stringify(maxOrder, null, 2));

        // Simulate the logic in controller
        // "order" variable from req.body would be undefined in the failing case
        const order = undefined;

        // Original logic:
        // order: order !== undefined ? order : (maxOrder._max.order || 0) + 1,

        try {
            const nextOrder = order !== undefined ? order : (maxOrder._max.order || 0) + 1;
            console.log('Next order:', nextOrder);
        } catch (e) {
            console.error('Logic failed:', e.message);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
