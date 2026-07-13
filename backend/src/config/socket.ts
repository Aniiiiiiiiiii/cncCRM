import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from './logger';

export const userSockets = new Map<string, string>(); // Maps userId -> socketId

export const initSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`🔌 Socket connected: ${socket.id}`);

    socket.on('register', (userId: string) => {
      userSockets.set(userId, socket.id);
      logger.info(`🔌 User registered: ${userId} at socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          logger.info(`🔌 User offline: ${userId}`);
          break;
        }
      }
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const sendRealTimeNotification = (io: Server, userId: string, payload: any) => {
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit('notification', payload);
    logger.debug(`💬 Dispatched notification to User: ${userId}`);
  }
};

export const sendChatMessage = (io: Server, receiverId: string, payload: any) => {
  const socketId = userSockets.get(receiverId);
  if (socketId) {
    io.to(socketId).emit('chat_message', payload);
    logger.debug(`💬 Dispatched chat message to User: ${receiverId}`);
  }
};
