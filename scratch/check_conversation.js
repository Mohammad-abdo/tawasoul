import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConversation() {
  const conversationId = '39701b05-1bcc-4980-85b7-8ad0d3df3e42';
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user: true,
        doctor: true
      }
    });

    if (conversation) {
      console.log('Conversation found:');
      console.log(JSON.stringify(conversation, null, 2));
    } else {
      console.log('Conversation not found in database.');
      
      // Check if it's possible it's under a different ID or something
      const allConversations = await prisma.conversation.findMany({
        take: 5
      });
      console.log('Last 5 conversations:', JSON.stringify(allConversations, null, 2));
    }
  } catch (error) {
    console.error('Error checking conversation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConversation();
