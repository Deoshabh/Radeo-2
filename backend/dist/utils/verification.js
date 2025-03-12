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
exports.removeVerificationCode = exports.getVerificationCode = exports.storeVerificationCode = exports.generateVerificationCode = void 0;
const uuid_1 = require("uuid");
const redis_1 = __importDefault(require("../lib/redis"));
/**
 * Generate a random 6-digit verification code
 * @returns A 6-digit verification code as a string
 */
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateVerificationCode = generateVerificationCode;
/**
 * Store a verification code in Redis with an expiration time
 * @param phoneNumber - The phone number associated with the code
 * @param code - The verification code
 * @param expirationSeconds - Time in seconds until the code expires
 * @returns A unique verification ID
 */
const storeVerificationCode = (phoneNumber, code, expirationSeconds) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationId = (0, uuid_1.v4)();
    const key = `verification:${verificationId}`;
    // Store the verification data using the updated Redis method hSet
    yield redis_1.default.hSet(key, {
        phoneNumber,
        code
    });
    // Set expiration
    yield redis_1.default.expire(key, expirationSeconds);
    return verificationId;
});
exports.storeVerificationCode = storeVerificationCode;
/**
 * Retrieve a verification code from Redis
 * @param verificationId - The unique verification ID
 * @returns The verification code or null if not found
 */
const getVerificationCode = (verificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const key = `verification:${verificationId}`;
    // Retrieve data using the updated Redis method hGetAll
    const data = yield redis_1.default.hGetAll(key);
    if (!data || !data.code) {
        return null;
    }
    return data.code;
});
exports.getVerificationCode = getVerificationCode;
/**
 * Remove a verification code from Redis
 * @param verificationId - The unique verification ID
 */
const removeVerificationCode = (verificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const key = `verification:${verificationId}`;
    yield redis_1.default.del(key);
});
exports.removeVerificationCode = removeVerificationCode;
