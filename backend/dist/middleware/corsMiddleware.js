"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCors = setupCors;
const cors_1 = __importDefault(require("cors"));
function setupCors(app) {
    // Configure CORS to accept requests from your frontend
    const corsOptions = {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    };
    app.use((0, cors_1.default)(corsOptions));
    // Ensure JSON is returned with proper content type
    app.use((req, res, next) => {
        res.header('Content-Type', 'application/json');
        next();
    });
}
