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
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
// Basic health check endpoint
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check MongoDB connection
        const dbStatus = mongoose_1.default.connection.readyState === 1
            ? { status: 'healthy', connectionState: 'connected' }
            : { status: 'unhealthy', connectionState: mongoose_1.default.connection.readyState };
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
    }
    catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            message: 'Health check failed',
            error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
        });
    }
}));
// Detailed health check for internal monitoring
router.get('/details', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check all system components
        const mongoStatus = mongoose_1.default.connection.readyState === 1;
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
                        connectionState: mongoose_1.default.connection.readyState,
                        host: mongoose_1.default.connection.host,
                        name: mongoose_1.default.connection.name
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
    }
    catch (error) {
        console.error('Detailed health check error:', error);
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            message: 'Health check failed'
        });
    }
}));
exports.default = router;
