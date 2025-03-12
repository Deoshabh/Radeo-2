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
Object.defineProperty(exports, "__esModule", { value: true });
exports.delAsync = exports.setAsync = exports.getAsync = void 0;
const redis_1 = require("redis");
// Create Redis client using environment variable for Upstash connection
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = (0, redis_1.createClient)({
    url: redisUrl,
    socket: {
        reconnectStrategy: (retries) => {
            // Exponential backoff for reconnection attempts (max 30 seconds)
            const delay = Math.min(Math.pow(2, retries) * 1000, 30000);
            return delay;
        }
    }
});
// Handle connection events with better error logging and handling
client.on('connect', () => {
    console.log('Connected to Redis');
});
client.on('error', (err) => {
    console.error('Redis Client Error:', err.message);
    // Log only the error without crashing the application
});
client.on('reconnecting', () => {
    console.log('Redis client attempting to reconnect...');
});
// Connect to Redis with error handling
const connectRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
    }
    catch (error) {
        console.error('Failed to connect to Redis:', error);
        console.log('Application will continue with limited caching functionality');
    }
});
// Execute connection with error handling
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield connectRedis();
    }
    catch (error) {
        console.error('Redis connection wrapper error:', error);
    }
}))();
// Wrap Redis operations with error handling
const getAsync = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield client.get(key);
    }
    catch (error) {
        console.error(`Redis GET error for key ${key}:`, error);
        return null;
    }
});
exports.getAsync = getAsync;
const setAsync = (key, value, expiresIn) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (expiresIn) {
            yield client.set(key, value, { EX: expiresIn });
        }
        else {
            yield client.set(key, value);
        }
    }
    catch (error) {
        console.error(`Redis SET error for key ${key}:`, error);
    }
});
exports.setAsync = setAsync;
const delAsync = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.del(key);
    }
    catch (error) {
        console.error(`Redis DEL error for key ${key}:`, error);
    }
});
exports.delAsync = delAsync;
exports.default = client;
