import app from './app';
import http from 'http';
import winston from 'winston';
import { config } from 'dotenv';

// Load environment variables (if not already loaded in app.ts)
config();

// Use PORT from environment or default to 5000
const PORT = process.env.PORT || 5000;

// Create HTTP server using the Express app
const server = http.createServer(app);

// Basic logger setup
const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

// Start the server
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown on SIGTERM and SIGINT signals
const gracefulShutdown = () => {
  logger.info('Shutdown signal received. Closing server gracefully...');
  server.close(() => {
    logger.info('Server closed. Process terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
