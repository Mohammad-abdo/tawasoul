import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProduct() {
  const productId = '25bef030-4967-4dc0-9985-5b5b3f9e7049';
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (product) {
      console.log('Product images type:', typeof product.images);
      console.log('Product images content:', product.images);
    } else {
      console.log('Product not found.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProduct();
