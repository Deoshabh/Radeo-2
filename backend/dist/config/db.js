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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Database connection function
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Use environment variable with fallback without deprecated options
        const conn = yield mongoose_1.default.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/radeo-shop');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Graceful recovery in production; exit otherwise
        if (process.env.NODE_ENV === 'production') {
            console.error('MongoDB connection failed. Application will continue with limited functionality.');
        }
        else {
            process.exit(1);
        }
    }
});
exports.default = connectDB;
