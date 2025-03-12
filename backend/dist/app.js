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
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = require("dotenv");
const db_1 = __importDefault(require("./config/db"));
const redis_1 = __importDefault(require("./lib/redis"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const productRoutes_2 = __importDefault(require("./routes/admin/productRoutes"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const standardResponseMiddleware_1 = require("./middleware/standardResponseMiddleware");
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const corsMiddleware_1 = require("./middleware/corsMiddleware");
// Load environment variables before anything else
(0, dotenv_1.config)();
// Connect to MongoDB with enhanced error handling
(0, db_1.default)().catch(err => {
    console.error('MongoDB connection error at startup:', err);
    console.log('Starting application with limited functionality');
});
// Redis is connected automatically when imported
const app = (0, express_1.default)();
// Apply CORS configuration with proper headers
(0, corsMiddleware_1.setupCors)(app);
// Add standardized response methods
app.use(standardResponseMiddleware_1.standardResponseMiddleware);
// Middleware
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// Routes
const routersToRegister = [
    { path: '/api/auth', router: authRoutes_1.default },
    { path: '/api/products', router: productRoutes_1.default },
    { path: '/api/categories', router: categoryRoutes_1.default },
    { path: '/api/orders', router: orderRoutes_1.default },
    { path: '/api/users', router: userRoutes_1.default },
    { path: '/api/admin/products', router: productRoutes_2.default },
    { path: '/api/admin/categories', router: categoryRoutes_1.default }, // Reuse imported router
    { path: '/api/admin/orders', router: orderRoutes_1.default }, // Reuse imported router
    { path: '/api/admin/users', router: userRoutes_1.default }, // Reuse imported router
];
// Register each router safely
routersToRegister.forEach(({ path, router }) => {
    if (router) {
        app.use(path, router);
    }
    else {
        console.warn(`Warning: Router for path "${path}" is undefined and was not registered`);
    }
});
// Health check routes
app.use('/api/health', healthRoutes_1.default);
// Error handling middleware
app.use(errorMiddleware_1.notFound);
app.use((err, req, res, next) => {
    console.error('Unhandled application error:', err);
    // Use the standardized error response
    return res.error('An unexpected error occurred', 500, process.env.NODE_ENV === 'development' ? { message: err.message, stack: err.stack } : null);
});
// Handle application shutdown gracefully
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Closing Redis connection...');
        yield redis_1.default.disconnect();
        console.log('Redis connection closed');
        process.exit(0);
    }
    catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
}));
exports.default = app;
