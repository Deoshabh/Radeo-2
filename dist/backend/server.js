import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { check, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { performance } from 'perf_hooks';
import admin from 'firebase-admin';
import { MongoClient } from 'mongodb';
import Redis from 'ioredis';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import winston from 'winston';
import 'winston-daily-rotate-file';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
// Load environment variables
dotenv.config();
// Connect to MongoDB using mongoose (from existing setup)
connectDB();
// Initialize logger with daily rotation
const logFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), winston.format.splat(), winston.format.json());
// Transport for daily rotating file logs
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
            format: winston.format.combine(winston.format.colorize(), winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`))
        }),
        dailyRotateFileTransport
    ]
});
// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 5000;
// Setup security headers with Helmet
app.use(helmet());
// CORS configuration with specific origin handling
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin)
            return callback(null, true);
        // List of allowed origins
        const allowedOrigins = [
            'http://localhost:3000', // Local development
            'https://radeo-frontend.vercel.app', // Production frontend (example)
            process.env.FRONTEND_URL // Dynamic frontend URL from env
        ].filter(Boolean); // Remove undefined entries
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        }
        else {
            logger.warn(`Request from disallowed origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));
// Request body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
// Enable compression for all responses
app.use(compression());
// Setup request logging
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.http(message.trim())
    }
}));
// Basic rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);
// Performance monitoring middleware
app.use((req, res, next) => {
    const start = performance.now();
    // Once the response is finished, log the performance metrics
    res.on('finish', () => {
        const duration = performance.now() - start;
        // Log slow requests (over 1000ms) at warn level
        if (duration > 1000) {
            logger.warn(`Slow request: ${req.method} ${req.originalUrl} took ${duration.toFixed(2)}ms`);
        }
        else {
            logger.debug(`Request: ${req.method} ${req.originalUrl} took ${duration.toFixed(2)}ms`);
        }
    });
    next();
});
// Firebase initialization with proper error handling
let firebaseInitialized = false;
try {
    // Attempt to initialize with individual environment variables first
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        logger.info('Attempting to initialize Firebase using individual environment variables...');
        const serviceAccount = {
            type: 'service_account',
            project_id: process.env.FIREBASE_PROJECT_ID,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        };
        // Validate service account
        if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
            throw new Error('Firebase service account is missing required fields');
        }
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        firebaseInitialized = true;
        logger.info('Firebase Admin SDK initialized successfully using individual environment variables');
    }
    // Attempt to parse the service account from environment variable if individual fields didn't work
    else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        logger.info('Attempting to initialize Firebase using FIREBASE_SERVICE_ACCOUNT environment variable...');
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            // Validate required fields
            if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
                throw new Error('Firebase service account JSON is missing required fields');
            }
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            firebaseInitialized = true;
            logger.info('Firebase Admin SDK initialized successfully using service account JSON');
        }
        catch (parseError) {
            logger.error('Failed to parse Firebase service account JSON:', parseError);
            throw new Error('Invalid Firebase service account JSON format');
        }
    }
    else {
        throw new Error('No Firebase credentials found in environment variables');
    }
}
catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    // Attempt to use application default credentials as fallback
    try {
        logger.info('Attempting to initialize Firebase using application default credentials...');
        admin.initializeApp();
        firebaseInitialized = true;
        logger.info('Firebase initialized with application default credentials');
    }
    catch (fallbackError) {
        logger.error('Failed to initialize Firebase with fallback credentials:', fallbackError);
    }
}
// SendGrid initialization
let sendgridInitialized = false;
if (process.env.SENDGRID_API_KEY) {
    // Validate the API key format starts with "SG."
    if (process.env.SENDGRID_API_KEY.startsWith('SG.')) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        sendgridInitialized = true;
        logger.info('SendGrid API initialized successfully');
    }
    else {
        logger.error('Invalid SendGrid API key format');
    }
}
else {
    logger.warn('SendGrid API key not found in environment variables');
}
// Legacy SMTP setup as fallback
let smtpTransporter = null;
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
    }
    catch (error) {
        logger.error('Failed to initialize SMTP transport:', error);
    }
}
// Redis initialization with retry logic
let redisClient = null;
if (process.env.REDIS_URL) {
    try {
        redisClient = new Redis(process.env.REDIS_URL, {
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                logger.info(`Retrying Redis connection in ${delay}ms...`);
                return delay;
            },
            maxRetriesPerRequest: 5
        });
        redisClient.on('connect', () => {
            logger.info('Redis client connected successfully');
        });
        redisClient.on('error', (error) => {
            logger.error('Redis connection error:', error);
        });
    }
    catch (error) {
        logger.error('Failed to initialize Redis client:', error);
    }
}
// MongoDB initialization (direct client in addition to mongoose)
let dbClient = null;
let db = null;
if (process.env.MONGODB_URI || process.env.MONGO_URI) {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
    try {
        dbClient = new MongoClient(uri);
        dbClient.connect()
            .then(() => {
            logger.info('MongoDB client connected successfully');
            db = dbClient.db(process.env.MONGODB_DB_NAME || 'radeo');
        })
            .catch(error => {
            logger.error('MongoDB connection error:', error);
        });
    }
    catch (error) {
        logger.error('Failed to initialize MongoDB client:', error);
    }
}
const sendEmail = async (to, subject, text, html) => {
    try {
        if (sendgridInitialized) {
            // Try SendGrid first
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
        }
        else if (smtpTransporter) {
            // Fall back to SMTP
            const info = await smtpTransporter.sendMail({
                from: process.env.EMAIL_FROM || 'no-reply@yourdomain.com',
                to,
                subject,
                text,
                html
            });
            logger.info(`Email sent to ${to} via SMTP`, info.messageId);
            return { success: true, message: 'Email sent successfully via SMTP' };
        }
        else {
            throw new Error('No email transport configured');
        }
    }
    catch (error) {
        logger.error('Failed to send email:', error);
        return { success: false, message: `Failed to send email: ${error.message}` };
    }
};
// Cache middleware with Redis
const cacheMiddleware = (duration) => {
    return async (req, res, next) => {
        if (!redisClient) {
            return next();
        }
        // Create a unique key based on the request URL
        const key = `cache:${req.originalUrl || req.url}`;
        try {
            const cachedResponse = await redisClient.get(key);
            if (cachedResponse) {
                // Return cached response
                logger.debug(`Cache hit for ${key}`);
                const data = JSON.parse(cachedResponse);
                return res.status(200).json(data);
            }
            else {
                // Cache miss, continue with request
                logger.debug(`Cache miss for ${key}`);
                // Modify response to store in cache
                const originalSend = res.send;
                res.send = function (body) {
                    try {
                        // Only cache successful responses
                        if (res.statusCode === 200) {
                            redisClient?.set(key, body, 'EX', duration);
                            logger.debug(`Cached response for ${key}`);
                        }
                    }
                    catch (error) {
                        logger.error(`Failed to cache response for ${key}:`, error);
                    }
                    return originalSend.call(this, body);
                };
                next();
            }
        }
        catch (error) {
            logger.error(`Cache error for ${key}:`, error);
            next();
        }
    };
};
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
// Global error handler middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled application error:', err);
    res.status(500).json({
        status: 'error',
        message: 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
    });
});
// API Routes
// Enhanced health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const services = {
            api: { status: 'OK', message: 'API is healthy and running' },
            firebase: { status: firebaseInitialized ? 'OK' : 'ERROR', message: firebaseInitialized ? 'Connected' : 'Not connected' },
            sendgrid: { status: sendgridInitialized ? 'OK' : 'ERROR', message: sendgridInitialized ? 'Connected' : 'Not connected' },
            smtp: { status: smtpTransporter ? 'OK' : 'ERROR', message: smtpTransporter ? 'Connected' : 'Not connected' },
            redis: { status: 'CHECKING' },
            mongodb: { status: 'CHECKING' }
        };
        // Test Redis if available
        if (redisClient) {
            try {
                await redisClient.set('health_check', 'OK', 'EX', 60);
                const value = await redisClient.get('health_check');
                services.redis = {
                    status: value === 'OK' ? 'OK' : 'ERROR',
                    message: value === 'OK' ? 'Connected' : 'Connection test failed'
                };
            }
            catch (error) {
                logger.error('Redis health check failed:', error);
                services.redis = { status: 'ERROR', message: `Connection error: ${error.message}` };
            }
        }
        else {
            services.redis = { status: 'ERROR', message: 'Not configured' };
        }
        // Test MongoDB if available
        if (dbClient && dbClient.topology && dbClient.topology.isConnected()) {
            services.mongodb = { status: 'OK', message: 'Connected' };
        }
        else {
            services.mongodb = { status: 'ERROR', message: 'Not connected' };
        }
        res.status(200).json({
            status: 'OK',
            message: 'API is healthy and running',
            timestamp: new Date().toISOString(),
            services,
            environment: process.env.NODE_ENV || 'development'
        });
        logger.info('Health check endpoint called successfully');
    }
    catch (error) {
        logger.error('Health check endpoint error:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Health check failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
        });
    }
});
// Test email endpoint with validation
app.post('/api/test/email', [
    // Input validation
    check('to').isEmail().withMessage('Valid email address is required'),
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { to } = req.body;
        const result = await sendEmail(to, 'Radeo API - Test Email', 'This is a test email from the Radeo API.', '<h1>Test Email</h1><p>This is a test email from the Radeo API.</p>');
        if (result.success) {
            res.status(200).json({ status: 'OK', message: result.message });
        }
        else {
            res.status(500).json({ status: 'ERROR', message: result.message });
        }
    }
    catch (error) {
        logger.error('Test email endpoint error:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Failed to send test email',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
        });
    }
});
// Firebase test endpoint
app.get('/api/test/firebase', async (req, res) => {
    try {
        if (!firebaseInitialized) {
            return res.status(500).json({
                status: 'ERROR',
                message: 'Firebase is not initialized'
            });
        }
        // Try a simple operation like listing users (limited to 5)
        const listUsersResult = await admin.auth().listUsers(5);
        res.status(200).json({
            status: 'OK',
            message: 'Firebase connection test successful',
            userCount: listUsersResult.users.length
        });
    }
    catch (error) {
        logger.error('Firebase test endpoint error:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Firebase connection test failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
        });
    }
});
// Redis test endpoint
app.get('/api/test/redis', async (req, res) => {
    try {
        if (!redisClient) {
            return res.status(500).json({
                status: 'ERROR',
                message: 'Redis client is not initialized'
            });
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
        }
        else {
            throw new Error('Retrieved value does not match test value');
        }
    }
    catch (error) {
        logger.error('Redis test endpoint error:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Redis connection test failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
        });
    }
});
// Products endpoint with caching
app.get('/api/products', cacheMiddleware(300), async (req, res) => {
    try {
        // Get products from MongoDB if available
        if (db) {
            const products = await db.collection('products').find({}).limit(20).toArray();
            logger.info(`Retrieved ${products.length} products from MongoDB`);
            return res.status(200).json(products);
        }
        // Fallback to static products if database is not available
        const products = [
            {
                id: 'prod-1',
                name: 'Stylish Hoodie',
                price: 49.99,
                imageUrl: 'https://images.unsplash.com/photo-1505751171710-1f6d0ace5a85',
                category: 'Clothing'
            },
            {
                id: 'prod-2',
                name: 'Wireless Headphones',
                price: 199.99,
                imageUrl: 'https://images.unsplash.com/photo-1505751171710-1f6d0ace5a85',
                category: 'Electronics'
            },
            {
                id: 'prod-3',
                name: 'Premium Watch',
                price: 299.99,
                imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
                category: 'Accessories'
            },
            {
                id: 'prod-4',
                name: 'Running Shoes',
                price: 89.99,
                imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
                category: 'Footwear'
            }
        ];
        logger.info('Products fetched from static data (MongoDB not available)');
        res.status(200).json(products);
    }
    catch (error) {
        logger.error('Error fetching products:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Failed to fetch products',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
        });
    }
});
// Categories endpoint with caching
app.get('/api/categories', cacheMiddleware(600), async (req, res) => {
    try {
        // Get categories from MongoDB if available
        if (db) {
            const categories = await db.collection('categories').find({}).toArray();
            logger.info(`Retrieved ${categories.length} categories from MongoDB`);
            return res.status(200).json(categories);
        }
        // Fallback to static categories if database is not available
        const categories = [
            {
                id: 'mens',
                name: 'Men\'s',
                imageUrl: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e',
                description: 'Shop our collection of men\'s fashion, from casual to formal wear.'
            },
            {
                id: 'womens',
                name: 'Women\'s',
                imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b',
                description: 'Explore the latest trends in women\'s fashion.'
            },
            {
                id: 'accessories',
                name: 'Accessories',
                imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
                description: 'Complete your look with our stylish accessories.'
            },
            {
                id: 'electronics',
                name: 'Electronics',
                imageUrl: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e',
                description: 'Discover cutting-edge electronics and gadgets.'
            }
        ];
        logger.info('Categories fetched from static data (MongoDB not available)');
        res.status(200).json(categories);
    }
    catch (error) {
        logger.error('Error fetching categories:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Failed to fetch categories',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
        });
    }
});
// Performance metrics endpoint (admin only)
app.get('/api/admin/performance', async (req, res) => {
    try {
        const metrics = {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            timestamp: new Date().toISOString()
        };
        res.status(200).json(metrics);
    }
    catch (error) {
        logger.error('Error fetching performance metrics:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Failed to fetch performance metrics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
        });
    }
});
// 404 handler for undefined routes
app.use((req, res) => {
    logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        status: 'ERROR',
        message: 'Route not found'
    });
});
// Start the server
const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Health check available at: http://localhost:${PORT}/api/health`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        // Close database connections
        if (dbClient) {
            dbClient.close().catch((err) => logger.error('Error closing MongoDB connection', err));
        }
        if (redisClient) {
            redisClient.quit().catch((err) => logger.error('Error closing Redis connection', err));
        }
    });
});
export default app;
