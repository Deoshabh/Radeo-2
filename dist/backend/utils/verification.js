import { v4 as uuidv4 } from 'uuid';
import redis from '../lib/redis';
/**
 * Generate a random 6-digit verification code
 * @returns A 6-digit verification code as a string
 */
export const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
/**
 * Store a verification code in Redis with an expiration time
 * @param phoneNumber - The phone number associated with the code
 * @param code - The verification code
 * @param expirationSeconds - Time in seconds until the code expires
 * @returns A unique verification ID
 */
export const storeVerificationCode = async (phoneNumber, code, expirationSeconds) => {
    const verificationId = uuidv4();
    const key = `verification:${verificationId}`;
    // Store the verification data using the updated Redis method hSet
    await redis.hSet(key, {
        phoneNumber,
        code
    });
    // Set expiration
    await redis.expire(key, expirationSeconds);
    return verificationId;
};
/**
 * Retrieve a verification code from Redis
 * @param verificationId - The unique verification ID
 * @returns The verification code or null if not found
 */
export const getVerificationCode = async (verificationId) => {
    const key = `verification:${verificationId}`;
    // Retrieve data using the updated Redis method hGetAll
    const data = await redis.hGetAll(key);
    if (!data || !data.code) {
        return null;
    }
    return data.code;
};
/**
 * Remove a verification code from Redis
 * @param verificationId - The unique verification ID
 */
export const removeVerificationCode = async (verificationId) => {
    const key = `verification:${verificationId}`;
    await redis.del(key);
};
