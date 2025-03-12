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
exports.verifyPhoneNumberExists = exports.sendSMS = void 0;
const firebaseService_1 = __importDefault(require("../services/firebaseService"));
/**
 * SMS Service for sending verification codes
 * Note: Firebase Phone Authentication primarily happens on the client side.
 * This service is for backend integration and testing purposes.
 * In production, most phone verification is handled by the Firebase client SDK.
 */
const sendSMS = (phoneNumber, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`[Firebase] Would send SMS to ${phoneNumber}: ${message}`);
        // Note: Actual SMS sending is handled by Firebase on the client side
        // This function now primarily serves as a placeholder and for logging
        // For testing/fallback purposes only:
        if (process.env.SMS_PROVIDER === 'console') {
            console.log(`SMS Content (for testing): ${message}`);
            return true;
        }
        // In a real implementation, you might need to use a backup SMS provider
        // if you want server-initiated SMS (which Firebase doesn't directly support)
        return true;
    }
    catch (error) {
        console.error('Error in SMS service:', error);
        return false;
    }
});
exports.sendSMS = sendSMS;
// Verify a phone number exists in Firebase Auth
const verifyPhoneNumberExists = (phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Attempt to get user by phone number
        const userRecord = yield firebaseService_1.default.auth().getUserByPhoneNumber(phoneNumber);
        return !!userRecord;
    }
    catch (error) {
        // User doesn't exist or other error
        return false;
    }
});
exports.verifyPhoneNumberExists = verifyPhoneNumberExists;
