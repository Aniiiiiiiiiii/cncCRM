import http from 'http';
import app from './app';
import { initSocket } from './config/socket';
import { logger } from './config/logger';
import { env } from './config/env';
import { prisma } from './config/database';

const server = http.createServer(app);

// Initialize Socket Server
export const io = initSocket(server);

// Verify database connection on startup
// async function startServer() {
//   try {
//     await prisma.$connect();
//     logger.info('🔌 Database connection established successfully.');

//     const PORT = env.PORT || 5000;
//     server.listen(PORT, () => {
//       logger.info(`🚀 Code N Clicks CRM server running on port ${PORT} in ${env.NODE_ENV} mode.`);
//     });
//   } catch (error) {
//     logger.error('💥 Database connection failed:', error);
//     process.exit(1);
//   }
// }

async function startServer() {
  try {
    // await prisma.$connect();   // <-- temporarily comment

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log("SERVER STARTED");
    });

  } catch (err) {
    console.error(err);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('💥 UNHANDLED REJECTION! Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('💥 UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

startServer();
