import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Basic health check endpoint
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check MongoDB connection
    const dbStatus = mongoose.connection.readyState === 1 
      ? { status: 'healthy', connectionState: 'connected' }
      : { status: 'unhealthy', connectionState: mongoose.connection.readyState };
    
    // Return system health information
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      database: dbStatus,
      memory: {
        usage: process.memoryUsage(),
        free: process.memoryUsage().heapTotal - process.memoryUsage().heapUsed
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
    });
  }
});

// Detailed health check for internal monitoring
router.get('/details', async (req: Request, res: Response) => {
  try {
    // Check all system components
    const mongoStatus = mongoose.connection.readyState === 1;
    
    // Add more service checks here as needed
    // Example: Redis, external APIs, etc.
    
    const allHealthy = mongoStatus; // && redisStatus && etc.
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: {
          status: mongoStatus ? 'healthy' : 'unhealthy',
          details: {
            connectionState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            name: mongoose.connection.name
          }
        },
        // Add other service checks here
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      }
    });
  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(500).json({ 
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed'
    });
  }
});

export default router;
