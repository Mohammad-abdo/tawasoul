import * as messagesRepo from '../../repositories/doctor/messages.repository.js';
import * as conversationsRepo from '../../repositories/doctor/conversations.repository.js';
import { createHttpError } from '../../utils/httpError.js';

export const getMessageById = async (messageId) => {
  return await messagesRepo.findMessageById({ id: messageId });
};

export const updateMessage = async (messageId, doctorId, data) => {
  const message = await messagesRepo.findMessageById({ id: messageId });
  if (!message) {
    throw createHttpError(404, 'MESSAGE_NOT_FOUND', 'Message not found');
  }
  if (message.senderId !== doctorId || message.senderRole !== 'DOCTOR') {
    throw createHttpError(403, 'FORBIDDEN', 'You can only edit your own messages');
  }
  if (data.content !== undefined) {
    data.content = data.content.trim();
  }
  return await messagesRepo.updateMessage({ where: { id: messageId }, data });
};

export const deleteMessage = async (messageId, doctorId) => {
  const message = await messagesRepo.findMessageById({ id: messageId });
  if (!message) {
    throw createHttpError(404, 'MESSAGE_NOT_FOUND', 'Message not found');
  }
  if (message.senderId !== doctorId || message.senderRole !== 'DOCTOR') {
    throw createHttpError(403, 'FORBIDDEN', 'You can only delete your own messages');
  }
  return await messagesRepo.deleteMessage({ id: messageId });
};

export const sendMessageToUser = async (doctorId, body) => {
  const { userId, content, messageType = 'TEXT', imageUrl, videoUrl, fileUrl, fileName, voiceUrl, voiceDuration } = body;

  if (!userId) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'User ID is required');
  }

  if (!['TEXT', 'IMAGE', 'VIDEO', 'FILE', 'VOICE'].includes(messageType)) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Invalid message type');
  }

  if (messageType === 'TEXT' && (!content || !content.trim())) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Content is required for TEXT messages');
  }

  const user = await messagesRepo.findUserById(userId);
  if (!user) {
    throw createHttpError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const conversation = await conversationsRepo.upsertConversation({
    where: { userId_doctorId: { userId, doctorId } },
    update: { updatedAt: new Date() },
    create: { userId, doctorId }
  });

  const message = await messagesRepo.createMessage({
    conversationId: conversation.id,
    senderId: doctorId,
    senderRole: 'DOCTOR',
    content: content ? content.trim() : null,
    messageType,
    imageUrl: imageUrl || null,
    videoUrl: videoUrl || null,
    fileUrl: fileUrl || null,
    fileName: fileName || null,
    voiceUrl: voiceUrl || null,
    voiceDuration: voiceDuration ? parseInt(voiceDuration) : null
  });

  return message;
};