import { prisma } from '../src/config/database.js';

async function verifyProductFix() {
  const productId = '25bef030-4967-4dc0-9985-5b5b3f9e7049';
  
  // Simulate getProductById logic
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (product) {
    console.log('Original images type:', typeof product.images);
    
    let parsedImages = product.images;
    if (product.images && typeof product.images === 'string') {
      try {
        parsedImages = JSON.parse(product.images);
      } catch (e) {
        parsedImages = [];
      }
    }
    
    console.log('Parsed images type:', typeof parsedImages);
    console.log('Is array?', Array.isArray(parsedImages));
    console.log('Content:', parsedImages);
  } else {
    console.log('Product not found.');
  }
}

verifyProductFix().then(() => process.exit(0));
