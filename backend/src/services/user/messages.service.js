import * as messagesRepo from '../../repositories/user/messages.repository.js';

const formatMessage = (message, userId) => ({
  id: message.id, sender: message.sender, receiver: message.receiver,
  content: message.content, messageType: message.messageType,
  imageUrl: message.imageUrl, videoUrl: message.videoUrl,
  fileUrl: message.fileUrl, fileName: message.fileName,
  voiceUrl: message.voiceUrl, voiceDuration: message.voiceDuration,
  isRead: message.isRead, isFromMe: message.senderId === userId,
  createdAt: message.createdAt
});

export const getUserMessages = async (userId, { page = 1, limit = 50 }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);
  const where = { OR: [{ senderId: userId }, { receiverId: userId }] };

  const [messages, total] = await Promise.all([
    messagesRepo.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    messagesRepo.count(where)
  ]);

  return {
    messages: messages.map(m => formatMessage(m, userId)),
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
  };
};

export const getConversation = async (userId, otherUserId, { page = 1, limit = 50 }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);
  const where = {
    OR: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId }
    ]
  };

  const [messages, total] = await Promise.all([
    messagesRepo.findMany({ where, skip, take, orderBy: { createdAt: 'asc' } }),
    messagesRepo.count(where)
  ]);

  await messagesRepo.markRead(otherUserId, userId);

  return {
    messages: messages.map(m => formatMessage(m, userId)),
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
  };
};

export const sendMessage = async (userId, body) => {
  const { receiverId, content, messageType = 'TEXT', imageUrl, videoUrl, fileUrl, fileName, voiceUrl, voiceDuration } = body;

  if (!receiverId) {
    const err = new Error('Receiver ID is required'); err.code = 'VALIDATION_ERROR'; err.status = 400; throw err;
  }

  if (!['TEXT', 'IMAGE', 'VIDEO', 'FILE', 'VOICE'].includes(messageType)) {
    const err = new Error('Invalid message type'); err.code = 'VALIDATION_ERROR'; err.status = 400; throw err;
  }

  if (messageType === 'TEXT' && (!content || content.trim().length === 0)) {
    const err = new Error('Content is required for text messages'); err.code = 'VALIDATION_ERROR'; err.status = 400; throw err;
  }
  if (messageType === 'IMAGE' && !imageUrl) {
    const err = new Error('Image URL is required for image messages'); err.code = 'VALIDATION_ERROR'; err.status = 400; throw err;
  }
  if (messageType === 'VIDEO' && !videoUrl) {
    const err = new Error('Video URL is required for video messages'); err.code = 'VALIDATION_ERROR'; err.status = 400; throw err;
  }
  if (messageType === 'FILE' && (!fileUrl || !fileName)) {
    const err = new Error('File URL and file name are required for file messages'); err.code = 'VALIDATION_ERROR'; err.status = 400; throw err;
  }
  if (messageType === 'VOICE' && !voiceUrl) {
    const err = new Error('Voice URL is required for voice messages'); err.code = 'VALIDATION_ERROR'; err.status = 400; throw err;
  }

  if (userId === receiverId) {
    const err = new Error('Cannot send message to yourself'); err.code = 'INVALID_RECEIVER'; err.status = 400; throw err;
  }

  const receiver = await messagesRepo.findReceiver(receiverId);
  if (!receiver) {
    const err = new Error('Receiver not found'); err.code = 'USER_NOT_FOUND'; err.status = 404; throw err;
  }
  if (!receiver.allowPrivateMsg) {
    const err = new Error('This user does not allow private messages'); err.code = 'MESSAGES_DISABLED'; err.status = 403; throw err;
  }

  const message = await messagesRepo.createMessage({
    senderId: userId, receiverId,
    content: content ? content.trim() : null,
    messageType, imageUrl: imageUrl || null, videoUrl: videoUrl || null,
    fileUrl: fileUrl || null, fileName: fileName || null,
    voiceUrl: voiceUrl || null, voiceDuration: voiceDuration ? parseInt(voiceDuration) : null
  });

  await messagesRepo.createNotification({
    userId: receiverId, type: 'NEW_MESSAGE',
    title: 'رسالة جديدة',
    message: `لديك رسالة جديدة من ${message.sender.username}`
  });

  return {
    id: message.id, sender: message.sender, receiver: message.receiver,
    content: message.content, messageType: message.messageType,
    imageUrl: message.imageUrl, videoUrl: message.videoUrl,
    fileUrl: message.fileUrl, fileName: message.fileName,
    voiceUrl: message.voiceUrl, voiceDuration: message.voiceDuration,
    isRead: message.isRead, createdAt: message.createdAt
  };
};
