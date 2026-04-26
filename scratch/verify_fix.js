import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyFix() {
  const userIdAsId = '39701b05-1bcc-4980-85b7-8ad0d3df3e42';
  const doctorId = 'da5925ba-d73a-4ca8-9c73-598dd564d0df'; // from previous check

  console.log(`Verifying fix for userId: ${userIdAsId} and doctorId: ${doctorId}`);

  try {
    // Simulate getConversationById logic
    let conversation = await prisma.conversation.findUnique({
      where: { id: userIdAsId },
      include: { user: true, doctor: true, messages: true }
    });

    if (!conversation) {
      console.log('Not found by ID, trying userId_doctorId fallback...');
      conversation = await prisma.conversation.findUnique({
        where: { userId_doctorId: { userId: userIdAsId, doctorId } },
        include: { user: true, doctor: true, messages: true }
      });
    }

    if (conversation) {
      console.log('SUCCESS: Conversation found via fallback!');
      console.log(`Conversation ID: ${conversation.id}`);
      console.log(`User Name: ${conversation.user.fullName || conversation.user.username}`);
    } else {
      console.log('FAILURE: Conversation still not found.');
    }
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyFix();
