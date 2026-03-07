import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testHomeSliders() {
    try {
        console.log('Testing home sliders operations...\n');

        // Test 1: Count sliders
        console.log('1. Counting sliders...');
        const count = await prisma.homeSlider.count();
        console.log(`   Found ${count} sliders\n`);

        // Test 2: Get all sliders
        console.log('2. Getting all sliders...');
        const sliders = await prisma.homeSlider.findMany();
        console.log(`   Retrieved ${sliders.length} sliders\n`);

        // Test 3: Test aggregate (the operation that was failing)
        console.log('3. Testing aggregate operation...');
        const maxOrder = await prisma.homeSlider.aggregate({
            _max: { order: true }
        });
        console.log(`   Max order:`, maxOrder._max.order);
        const nextOrder = (maxOrder?._max?.order != null ? maxOrder._max.order : 0) + 1;
        console.log(`   Next order would be: ${nextOrder}\n`);

        console.log('✅ All tests passed! The home sliders table is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testHomeSliders();
