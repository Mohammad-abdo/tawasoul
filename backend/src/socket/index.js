import { Server } from 'socket.io';
import { logger } from '../utils/logger.js';

let io; // هنحفظ فيها الـ instance عشان نقدر نستخدمه من بره

export const initSocket = (httpServer) => {
  const corsOriginsForSocket = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

  io = new Server(httpServer, {
    cors: {
      origin: corsOriginsForSocket,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected to Socket: ${socket.id}`);

    // ==========================================
    // 1. Join Rooms (عشان نبعت لشخص بعينه)
    // ==========================================
    
    // اليوزر أول ما يفتح التطبيق بيبعت الـ ID بتاعه هنا
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
      logger.info(`User ${userId} joined their room`);
    });

    // الدكتور أول ما يفتح التطبيق بيبعت الـ ID بتاعه هنا
    socket.on('join-doctor', (doctorId) => {
      socket.join(`doctor-${doctorId}`);
      logger.info(`Doctor ${doctorId} joined their room`);
    });

    socket.on('join-admin-room', () => {
      socket.join('admin-room');
    });

    // ==========================================
    // 2. Chat Real-time Events (Typing...)
    // ==========================================

    // لما حد يكتب
    socket.on('typing', ({ senderId, receiverId, senderRole }) => {
      // لو اللي بيكتب يوزر، هنبعت للدكتور.. والعكس
      const targetRoom = senderRole === 'USER' ? `doctor-${receiverId}` : `user-${receiverId}`;
      socket.to(targetRoom).emit('user-typing', { senderId, isTyping: true });
    });

    // لما حد يوقف كتابة
    socket.on('stop-typing', ({ senderId, receiverId, senderRole }) => {
      const targetRoom = senderRole === 'USER' ? `doctor-${receiverId}` : `user-${receiverId}`;
      socket.to(targetRoom).emit('user-typing', { senderId, isTyping: false });
    });

    // ==========================================
    // 3. Disconnect
    // ==========================================
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
      // هنا ممكن مستقبلاً نعمل logic عشان نخلي حالة اليوزر Offline
    });
  });

  return io;
};

// الدالة دي هنستخدمها جوه الـ Controllers عشان نبعت رسايل
export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return io;
};