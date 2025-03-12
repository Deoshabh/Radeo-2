import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { performance } from 'perf_hooks';
import { config } from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import healthRoutes from './routes/healthRoutes';
import firebaseAdmin from './services/firebaseService';
import { check, validationResult } from 'express-validator';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import Redis from 'ioredis';
import winston from 'winston';
import 'winston-daily-rotate-file';

// Load environment variables
config();

// Connect to MongoDB
connectDB().catch(err => {
  console.error('MongoDB connection error at startup:', err);
});

// Create the Express app
const app = express();

// ----- Logger Setup ----- //
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'radeo-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          info =>
            `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
        )
      )
    }),
    dailyRotateFileTransport
  ]
});

// ----- Middleware Setup ----- //

// Security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true); // Allow non-browser requests
    const allowedOrigins = [
      'http://localhost:3000',                     // Local development
      'https://radeo-frontend.vercel.app',         // Production frontend
      process.env.FRONTEND_URL                       // Additional allowed origin
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};

// Body parsing middleware (added twice to allow a limit; adjust if necessary)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(cors(corsOptions));

// Response compression
app.use(compression());

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => logger.http(message.trim())
      }
    })
  );
}

// Basic rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

// Performance monitoring middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  res.on('finish', () => {
    const duration = performance.now() - start;
    if (duration > 1000) {
      logger.warn(`Slow request: ${req.method} ${req.originalUrl} took ${duration.toFixed(2)}ms`);
    } else {
      logger.debug(`Request: ${req.method} ${req.originalUrl} took ${duration.toFixed(2)}ms`);
    }
  });
  next();
});

// ----- Third‑Party Service Initialization ----- //

// SendGrid initialization
let sendgridInitialized = false;
if (process.env.SENDGRID_API_KEY) {
  if (process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sendgridInitialized = true;
    logger.info('SendGrid API initialized successfully');
  } else {
    logger.error('Invalid SendGrid API key format');
  }
} else {
  logger.warn('SendGrid API key not found in environment variables');
}

// Legacy SMTP fallback
let smtpTransporter: nodemailer.Transporter | null = null;
if (!sendgridInitialized && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
  try {
    smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
    logger.info('SMTP transport initialized as fallback');
  } catch (error) {
    logger.error('Failed to initialize SMTP transport:', error);
  }
}

// Redis initialization
let redisClient: Redis | null = null;
if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        logger.info(`Retrying Redis connection in ${delay}ms...`);
        return delay;
      },
      maxRetriesPerRequest: 5
    });
    redisClient.on('connect', () => {
      logger.info('Redis client connected successfully');
    });
    redisClient.on('error', (error: Error) => {
      logger.error('Redis connection error:', error);
    });
  } catch (error) {
    logger.error('Failed to initialize Redis client:', error);
  }
}

// ----- Utility Functions ----- //

// Email sending utility
interface EmailResult {
  success: boolean;
  message: string;
}

const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string
): Promise<EmailResult> => {
  try {
    if (sendgridInitialized) {
      const msg = {
        to,
        from: process.env.EMAIL_FROM || 'no-reply@yourdomain.com',
        subject,
        text,
        html
      };
      await sgMail.send(msg);
      logger.info(`Email sent to ${to} via SendGrid`);
      return { success: true, message: 'Email sent successfully via SendGrid' };
    } else if (smtpTransporter) {
      const info = await smtpTransporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@yourdomain.com',
        to,
        subject,
        text,
        html
      });
      logger.info(`Email sent to ${to} via SMTP, Message ID: ${info.messageId}`);
      return { success: true, message: 'Email sent successfully via SMTP' };
    } else {
      throw new Error('No email transport configured');
    }
  } catch (error: any) {
    logger.error('Failed to send email:', error);
    return { success: false, message: `Failed to send email: ${error.message}` };
  }
};

// Cache middleware using Redis
const cacheMiddleware = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!redisClient) return next();
    const key = `cache:${req.originalUrl || req.url}`;
    try {
      const cachedResponse = await redisClient.get(key);
      if (cachedResponse) {
        logger.debug(`Cache hit for ${key}`);
        return res.status(200).json(JSON.parse(cachedResponse));
      } else {
        logger.debug(`Cache miss for ${key}`);
        const originalSend = res.send.bind(res);
        res.send = (body: any) => {
          try {
            if (res.statusCode === 200) {
              redisClient?.set(key, body, 'EX', duration);
              logger.debug(`Cached response for ${key}`);
            }
          } catch (error) {
            logger.error(`Failed to cache response for ${key}:`, error);
          }
          return originalSend(body);
        };
        next();
      }
    } catch (error) {
      logger.error(`Cache error for ${key}:`, error);
      next();
    }
  };
};

// ----- Routes ----- //

// Mount core routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/health', healthRoutes);

// Root welcome route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the backend!');
});

// Test email endpoint
app.post(
  '/api/test/email',
  [check('to').isEmail().withMessage('Valid email address is required')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      const { to } = req.body;
      const result = await sendEmail(
        to,
        'Radeo API - Test Email',
        'This is a test email from the Radeo API.',
        '<h1>Test Email</h1><p>This is a test email from the Radeo API.</p>'
      );
      if (result.success) {
        res.status(200).json({ status: 'OK', message: result.message });
      } else {
        res.status(500).json({ status: 'ERROR', message: result.message });
      }
    } catch (error: any) {
      logger.error('Test email endpoint error:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Failed to send test email',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
      });
    }
  }
);

// Firebase test endpoint
app.get('/api/test/firebase', async (req: Request, res: Response) => {
  try {
    if (firebaseAdmin.apps.length === 0) {
      return res.status(500).json({ status: 'ERROR', message: 'Firebase is not initialized' });
    }
    const listUsersResult = await firebaseAdmin.auth().listUsers(5);
    res.status(200).json({
      status: 'OK',
      message: 'Firebase connection test successful',
      userCount: listUsersResult.users.length
    });
  } catch (error: any) {
    logger.error('Firebase test endpoint error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Firebase connection test failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// Redis test endpoint
app.get('/api/test/redis', async (req: Request, res: Response) => {
  try {
    if (!redisClient) {
      return res.status(500).json({ status: 'ERROR', message: 'Redis client is not initialized' });
    }
    const testKey = 'test_' + Date.now();
    const testValue = 'Redis test at ' + new Date().toISOString();
    await redisClient.set(testKey, testValue, 'EX', 60);
    const retrievedValue = await redisClient.get(testKey);
    if (retrievedValue === testValue) {
      res.status(200).json({
        status: 'OK',
        message: 'Redis connection test successful',
        testValue,
        retrievedValue
      });
    } else {
      throw new Error('Retrieved value does not match test value');
    }
  } catch (error: any) {
    logger.error('Redis test endpoint error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Redis connection test failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// Fallback endpoints if no DB is available for products/categories
app.get('/api/products', cacheMiddleware(300), async (req: Request, res: Response) => {
  try {
    const products = [
      { id: 'prod-1', name: 'Stylish Hoodie', price: 49.99, imageUrl: 'https://images.unsplash.com/photo-1505751171710-1f6d0ace5a85', category: 'Clothing' },
      { id: 'prod-2', name: 'Wireless Headphones', price: 199.99, imageUrl: 'https://images.unsplash.com/photo-1505751171710-1f6d0ace5a85', category: 'Electronics' },
      { id: 'prod-3', name: 'Premium Watch', price: 299.99, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', category: 'Accessories' },
      { id: 'prod-4', name: 'Running Shoes', price: 89.99, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', category: 'Footwear' }
    ];
    res.status(200).json(products);
  } catch (error: any) {
    logger.error('Error fetching products:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

app.get('/api/categories', cacheMiddleware(600), async (req: Request, res: Response) => {
  try {
    const categories = [
      { id: 'mens', name: 'Men\'s', imageUrl: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e', description: 'Shop our collection of men\'s fashion, from casual to formal wear.' },
      { id: 'womens', name: 'Women\'s', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b', description: 'Explore the latest trends in women\'s fashion.' },
      { id: 'accessories', name: 'Accessories', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3', description: 'Complete your look with our stylish accessories.' },
      { id: 'electronics', name: 'Electronics', imageUrl: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e', description: 'Discover cutting-edge electronics and gadgets.' }
    ];
    res.status(200).json(categories);
  } catch (error: any) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

app.get('/api/admin/performance', async (req: Request, res: Response) => {
  try {
    const metrics = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      timestamp: new Date().toISOString()
    };
    res.status(200).json(metrics);
  } catch (error: any) {
    logger.error('Error fetching performance metrics:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch performance metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// ----- Error Handlers ----- //

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ status: 'ERROR', message: 'Route not found' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled application error:', err);
  res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

export default app;
