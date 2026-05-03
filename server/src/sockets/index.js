import { Server } from 'socket.io';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import jwt from 'jsonwebtoken';
import User from '../modules/auth/user.model.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: config.client.url, methods: ['GET', 'POST'], credentials: true },
    pingTimeout: 60000,
  });

  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (token) {
        const decoded = jwt.verify(token, config.jwt.secret);
        socket.user = await User.findById(decoded.userId).select('-password');
      }
      next();
    } catch {
      next(); // Allow unauthenticated socket connections (for public rooms)
    }
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id} user=${socket.user?.username || 'guest'}`);

    // Join movie room (for live CinePulse + reviews)
    socket.on('join:movie', (movieId) => {
      socket.join(`movie:${movieId}`);
    });
    socket.on('leave:movie', (movieId) => {
      socket.leave(`movie:${movieId}`);
    });

    // Join personal notification channel
    if (socket.user) {
      socket.join(`user:${socket.user._id}`);
    }

    // Watch party room
    socket.on('join:party', (roomId) => {
      socket.join(`party:${roomId}`);
      socket.to(`party:${roomId}`).emit('party:user-joined', {
        userId: socket.user?._id,
        username: socket.user?.username,
      });
    });
    socket.on('party:reaction', ({ roomId, emoji }) => {
      socket.to(`party:${roomId}`).emit('party:reaction', { emoji, username: socket.user?.username });
    });
    socket.on('party:sync', ({ roomId, timestamp }) => {
      socket.to(`party:${roomId}`).emit('party:sync', { timestamp });
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  logger.info('Socket.io initialized');
  return io;
};

export const getIO = () => io;

// Helper to emit to a movie room
export const emitToMovie = (movieId, event, data) => {
  if (io) io.to(`movie:${movieId}`).emit(event, data);
};

// Helper to emit to a user
export const emitToUser = (userId, event, data) => {
  if (io) io.to(`user:${userId}`).emit(event, data);
};
