import { Server } from 'socket.io';
import { logger } from '../utils/logger.js';
import jwt from 'jsonwebtoken';

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

  // ==========================================
  // Auth middleware (JWT) + auto-join rooms
  // ==========================================
  io.use((socket, next) => {
    try {
      const token = socket.handshake?.auth?.token;
      if (!token) {
        return next(new Error('AUTH_REQUIRED'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded?.role === 'USER' && decoded?.userId) {
        socket.data.actor = { role: 'USER', id: decoded.userId };
        return next();
      }
      if (decoded?.role === 'DOCTOR' && decoded?.doctorId) {
        socket.data.actor = { role: 'DOCTOR', id: decoded.doctorId };
        return next();
      }

      return next(new Error('UNAUTHORIZED'));
    } catch (err) {
      return next(new Error('INVALID_TOKEN'));
    }
  });

  io.on('connection', (socket) => {
    const actor = socket.data?.actor;
    logger.info(`Client connected to Socket: ${socket.id} (${actor?.role || 'UNKNOWN'}:${actor?.id || 'unknown'})`);

    if (actor?.role === 'USER') {
      socket.join(`user-${actor.id}`);
      logger.info(`User ${actor.id} auto-joined their room`);
    }

    if (actor?.role === 'DOCTOR') {
      socket.join(`doctor-${actor.id}`);
      logger.info(`Doctor ${actor.id} auto-joined their room`);
    }

    // ==========================================
    // 1. Join Rooms (عشان نبعت لشخص بعينه)
    // ==========================================
    
    // اليوزر أول ما يفتح التطبيق بيبعت الـ ID بتاعه هنا
    socket.on('join-user', (userId) => {
      if (actor?.role !== 'USER' || actor?.id !== userId) return;
      socket.join(`user-${userId}`);
      logger.info(`User ${userId} joined their room`);
    });

    // الدكتور أول ما يفتح التطبيق بيبعت الـ ID بتاعه هنا
    socket.on('join-doctor', (doctorId) => {
      if (actor?.role !== 'DOCTOR' || actor?.id !== doctorId) return;
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
      logger.info(`Client disconnected: ${socket.id} (${actor?.role || 'UNKNOWN'}:${actor?.id || 'unknown'})`);
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