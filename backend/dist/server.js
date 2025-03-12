"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_validator_1 = require("express-validator");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const perf_hooks_1 = require("perf_hooks");
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const firebaseService_1 = __importDefault(require("./services/firebaseService")); // Import the centralized Firebase service
const mongodb_1 = require("mongodb");
const ioredis_1 = __importDefault(require("ioredis"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
// Connect to MongoDB using your existing setup
(0, db_1.default)();
// Initialize logger with daily rotation
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
const dailyRotateFileTransport = new winston_1.default.transports.DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
});
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'radeo-backend' },
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`))
        }),
        dailyRotateFileTransport
    ]
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Setup security headers with Helmet
app.use((0, helmet_1.default)());
// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [
            'http://localhost:3000',
            'https://radeo-frontend.vercel.app',
            process.env.FRONTEND_URL
        ].filter(Boolean);
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
    maxAge: 86400
};
app.use((0, cors_1.default)(corsOptions));
// Request body parsing
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
// Enable compression for responses
app.use((0, compression_1.default)());
// Setup request logging with Morgan
app.use((0, morgan_1.default)('combined', {
    stream: {
        write: (message) => logger.http(message.trim())
    }
}));
// Basic rate limiting
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);
// Performance monitoring middleware
app.use((req, res, next) => {
    const start = perf_hooks_1.performance.now();
    res.on('finish', () => {
        const duration = perf_hooks_1.performance.now() - start;
        if (duration > 1000) {
            logger.warn(`Slow request: ${req.method} ${req.originalUrl} took ${duration.toFixed(2)}ms`);
        }
        else {
            logger.debug(`Request: ${req.method} ${req.originalUrl} took ${duration.toFixed(2)}ms`);
        }
    });
    next();
});
// --- Firebase is now initialized in firebaseService.ts ---
// No Firebase initialization code here!
// SendGrid initialization
let sendgridInitialized = false;
if (process.env.SENDGRID_API_KEY) {
    if (process.env.SENDGRID_API_KEY.startsWith('SG.')) {
        mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
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
        smtpTransporter = nodemailer_1.default.createTransport({
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
        redisClient = new ioredis_1.default(process.env.REDIS_URL, {
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
// MongoDB initialization (direct client)
let dbClient = null;
let db = null;
if (process.env.MONGODB_URI || process.env.MONGO_URI) {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
    try {
        dbClient = new mongodb_1.MongoClient(uri);
        dbClient.connect()
            .then(() => {
            logger.info('MongoDB client connected successfully');
            if (dbClient) {
                db = dbClient.db(process.env.MONGODB_DB_NAME || 'radeo');
            }
        })
            .catch(error => {
            logger.error('MongoDB connection error:', error);
        });
    }
    catch (error) {
        logger.error('Failed to initialize MongoDB client:', error);
    }
}
const sendEmail = (to, subject, text, html) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (sendgridInitialized) {
            const msg = {
                to,
                from: process.env.EMAIL_FROM || 'no-reply@yourdomain.com',
                subject,
                text,
                html
            };
            yield mail_1.default.send(msg);
            logger.info(`Email sent to ${to} via SendGrid`);
            return { success: true, message: 'Email sent successfully via SendGrid' };
        }
        else if (smtpTransporter) {
            const info = yield smtpTransporter.sendMail({
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
});
// Cache middleware with Redis
const cacheMiddleware = (duration) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (!redisClient) {
            return next();
        }
        const key = `cache:${req.originalUrl || req.url}`;
        try {
            const cachedResponse = yield redisClient.get(key);
            if (cachedResponse) {
                logger.debug(`Cache hit for ${key}`);
                const data = JSON.parse(cachedResponse);
                return res.status(200).json(data);
            }
            else {
                logger.debug(`Cache miss for ${key}`);
                const originalSend = res.send;
                res.send = function (body) {
                    try {
                        if (res.statusCode === 200) {
                            redisClient === null || redisClient === void 0 ? void 0 : redisClient.set(key, body, 'EX', duration);
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
    });
};
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Welcome to the backend!');
});
// Global error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled application error:', err);
    res.status(500).json({
        status: 'error',
        message: 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
    });
});
// Health Check Endpoint
app.get('/api/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = {
            api: { status: 'OK', message: 'API is healthy and running' },
            firebase: { status: firebaseService_1.default.apps.length > 0 ? 'OK' : 'ERROR', message: firebaseService_1.default.apps.length > 0 ? 'Connected' : 'Not connected' },
            sendgrid: { status: sendgridInitialized ? 'OK' : 'ERROR', message: sendgridInitialized ? 'Connected' : 'Not connected' },
            smtp: { status: smtpTransporter ? 'OK' : 'ERROR', message: smtpTransporter ? 'Connected' : 'Not connected' },
            redis: { status: 'CHECKING', message: '' },
            mongodb: { status: 'CHECKING', message: '' }
        };
        if (redisClient) {
            try {
                yield redisClient.set('health_check', 'OK', 'EX', 60);
                const value = yield redisClient.get('health_check');
                services.redis = { status: value === 'OK' ? 'OK' : 'ERROR', message: value === 'OK' ? 'Connected' : 'Connection test failed' };
            }
            catch (error) {
                logger.error('Redis health check failed:', error);
                services.redis = { status: 'ERROR', message: `Connection error: ${error.message}` };
            }
        }
        else {
            services.redis = { status: 'ERROR', message: 'Not configured' };
        }
        try {
            if (dbClient) {
                yield dbClient.db().command({ ping: 1 });
                services.mongodb = { status: 'OK', message: 'Connected' };
            }
            else {
                services.mongodb = { status: 'ERROR', message: 'Not initialized' };
            }
        }
        catch (error) {
            logger.error('MongoDB health check failed:', error);
            services.mongodb = { status: 'ERROR', message: 'Connection failed' };
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
}));
// Test email endpoint
app.post('/api/test/email', [
    (0, express_validator_1.check)('to').isEmail().withMessage('Valid email address is required'),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { to } = req.body;
        const result = yield sendEmail(to, 'Radeo API - Test Email', 'This is a test email from the Radeo API.', '<h1>Test Email</h1><p>This is a test email from the Radeo API.</p>');
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
}));
// Firebase test endpoint
app.get('/api/test/firebase', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (firebaseService_1.default.apps.length === 0) {
            return res.status(500).json({ status: 'ERROR', message: 'Firebase is not initialized' });
        }
        const listUsersResult = yield firebaseService_1.default.auth().listUsers(5);
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
}));
// Redis test endpoint
app.get('/api/test/redis', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!redisClient) {
            return res.status(500).json({ status: 'ERROR', message: 'Redis client is not initialized' });
        }
        const testKey = 'test_' + Date.now();
        const testValue = 'Redis test at ' + new Date().toISOString();
        yield redisClient.set(testKey, testValue, 'EX', 60);
        const retrievedValue = yield redisClient.get(testKey);
        if (retrievedValue === testValue) {
            res.status(200).json({ status: 'OK', message: 'Redis connection test successful', testValue, retrievedValue });
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
}));
// Products endpoint with caching
app.get('/api/products', cacheMiddleware(300), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (db) {
            const products = yield db.collection('products').find({}).limit(20).toArray();
            logger.info(`Retrieved ${products.length} products from MongoDB`);
            return res.status(200).json(products);
        }
        const products = [
            { id: 'prod-1', name: 'Stylish Hoodie', price: 49.99, imageUrl: 'https://images.unsplash.com/photo-1505751171710-1f6d0ace5a85', category: 'Clothing' },
            { id: 'prod-2', name: 'Wireless Headphones', price: 199.99, imageUrl: 'https://images.unsplash.com/photo-1505751171710-1f6d0ace5a85', category: 'Electronics' },
            { id: 'prod-3', name: 'Premium Watch', price: 299.99, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', category: 'Accessories' },
            { id: 'prod-4', name: 'Running Shoes', price: 89.99, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', category: 'Footwear' }
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
}));
// Categories endpoint with caching
app.get('/api/categories', cacheMiddleware(600), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (db) {
            const categories = yield db.collection('categories').find({}).toArray();
            logger.info(`Retrieved ${categories.length} categories from MongoDB`);
            return res.status(200).json(categories);
        }
        const categories = [
            { id: 'mens', name: 'Men\'s', imageUrl: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e', description: 'Shop our collection of men\'s fashion, from casual to formal wear.' },
            { id: 'womens', name: 'Women\'s', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b', description: 'Explore the latest trends in women\'s fashion.' },
            { id: 'accessories', name: 'Accessories', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3', description: 'Complete your look with our stylish accessories.' },
            { id: 'electronics', name: 'Electronics', imageUrl: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e', description: 'Discover cutting-edge electronics and gadgets.' }
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
}));
// Performance metrics endpoint (admin only)
app.get('/api/admin/performance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
// 404 handler for undefined routes
app.use((req, res) => {
    logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ status: 'ERROR', message: 'Route not found' });
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
        if (dbClient) {
            dbClient.close().catch((err) => logger.error('Error closing MongoDB connection', err));
        }
        if (redisClient) {
            redisClient.quit().catch((err) => logger.error('Error closing Redis connection', err));
        }
    });
});
exports.default = app;
