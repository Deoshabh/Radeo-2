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
exports.updateUserProfile = exports.getUserProfile = exports.verifyFirebasePhoneAuth = exports.verifyPhoneCode = exports.sendPhoneVerificationCode = exports.login = exports.register = exports.verifyOTP = exports.generateOTP = void 0;
const User_1 = __importDefault(require("../models/User"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const mail_1 = require("../config/mail");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const verification_1 = require("../utils/verification");
const smsService_1 = require("../lib/smsService");
const firebaseService_1 = require("../services/firebaseService");
const redis_1 = require("../lib/redis");
// Store OTPs with expiration (using Redis)
const OTP_EXPIRATION = 10 * 60; // 10 minutes in seconds
/**
 * Request OTP
 * Generates a 6-digit OTP, stores it in Redis, and sends it via email.
 */
const generateOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }
        const otp = otp_generator_1.default.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });
        yield (0, redis_1.setAsync)(`otp:${email}`, otp, OTP_EXPIRATION);
        yield (0, mail_1.sendOTPEmail)(email, otp);
        res.status(200).json({ message: 'OTP sent successfully' });
    }
    catch (error) {
        console.error(`Error generating OTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ message: 'Failed to generate OTP' });
    }
});
exports.generateOTP = generateOTP;
/**
 * Verify OTP
 * Checks the OTP stored in Redis and verifies the user.
 */
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            res.status(400).json({ message: 'Email and OTP are required' });
            return;
        }
        const storedOTP = yield (0, redis_1.getAsync)(`otp:${email}`);
        if (!storedOTP || storedOTP !== otp) {
            res.status(400).json({ message: 'Invalid OTP' });
            return;
        }
        yield (0, redis_1.delAsync)(`otp:${email}`);
        let user = yield User_1.default.findOne({ email });
        if (!user) {
            user = yield User_1.default.create({
                email,
                isVerified: true,
            });
        }
        else {
            user.isVerified = true;
            yield user.save();
        }
        res.status(200).json({
            message: 'OTP verified successfully',
            user: {
                id: user._id,
                email: user.email,
                isVerified: user.isVerified
            }
        });
    }
    catch (error) {
        console.error(`Error verifying OTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ message: 'Failed to verify OTP' });
    }
});
exports.verifyOTP = verifyOTP;
/**
 * Register a new user.
 */
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, phoneNumber } = req.body;
        const userExists = yield User_1.default.findOne({
            $or: [
                { email },
                { phoneNumber }
            ]
        });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const user = yield User_1.default.create({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            isPhoneVerified: false,
            isVerified: false
        });
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            isPhoneVerified: user.isPhoneVerified,
            isVerified: user.isVerified,
            token
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.register = register;
/**
 * Login user.
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            isPhoneVerified: user.isPhoneVerified,
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.login = login;
/**
 * Send phone verification code.
 */
const sendPhoneVerificationCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            res.status(400).json({ message: 'Phone number is required' });
            return;
        }
        if (process.env.NODE_ENV === 'production') {
            res.json({
                message: 'For production, please use Firebase client SDK for phone verification',
                useFirebaseClient: true
            });
            return;
        }
        const verificationCode = (0, verification_1.generateVerificationCode)();
        const verificationId = yield (0, verification_1.storeVerificationCode)(phoneNumber, verificationCode, OTP_EXPIRATION);
        const smsSent = yield (0, smsService_1.sendSMS)(phoneNumber, `Your Radeo Shop verification code is: ${verificationCode}. It expires in 10 minutes.`);
        if (smsSent) {
            res.json({
                message: 'Verification code sent successfully',
                verificationId
            });
        }
        else {
            res.status(500).json({ message: 'Failed to send SMS' });
        }
    }
    catch (error) {
        console.error('Send verification code error:', error);
        res.status(500).json({ message: 'Failed to send verification code' });
    }
});
exports.sendPhoneVerificationCode = sendPhoneVerificationCode;
/**
 * Verify phone verification code.
 */
const verifyPhoneCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber, verificationId, verificationCode } = req.body;
        if (!phoneNumber || !verificationId || !verificationCode) {
            res.status(400).json({ message: 'Phone number, verification ID, and code are required' });
            return;
        }
        const storedCode = yield (0, verification_1.getVerificationCode)(verificationId);
        if (!storedCode) {
            res.status(400).json({ message: 'Verification code expired or invalid' });
            return;
        }
        if (storedCode !== verificationCode) {
            res.status(400).json({ message: 'Invalid verification code' });
            return;
        }
        yield (0, verification_1.removeVerificationCode)(verificationId);
        let user = yield User_1.default.findOne({ phoneNumber });
        if (!user) {
            user = yield User_1.default.create({
                phoneNumber,
                isPhoneVerified: true,
                name: `User-${phoneNumber.slice(-4)}`,
                role: 'user'
            });
        }
        else {
            user.isPhoneVerified = true;
            yield user.save();
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
        res.json({
            _id: user._id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            role: user.role,
            isPhoneVerified: user.isPhoneVerified,
            token
        });
    }
    catch (error) {
        console.error('Verify phone code error:', error);
        res.status(500).json({ message: 'Failed to verify code' });
    }
});
exports.verifyPhoneCode = verifyPhoneCode;
/**
 * Verify Firebase phone authentication token and handle user.
 */
const verifyFirebasePhoneAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            res.status(400).json({ message: 'Firebase ID token is required' });
            return;
        }
        const decodedToken = yield (0, firebaseService_1.verifyFirebaseToken)(idToken);
        if (!decodedToken) {
            res.status(401).json({ message: 'Invalid Firebase token' });
            return;
        }
        if (!decodedToken.phone_number) {
            res.status(400).json({ message: 'No phone number associated with token' });
            return;
        }
        let user = yield User_1.default.findOne({ phoneNumber: decodedToken.phone_number });
        if (!user) {
            user = yield User_1.default.create({
                name: `User-${decodedToken.uid.substring(0, 8)}`,
                phoneNumber: decodedToken.phone_number,
                isPhoneVerified: true,
                role: 'user',
                password: yield bcryptjs_1.default.hash(Math.random().toString(36).slice(-8), 10)
            });
        }
        else {
            user.isPhoneVerified = true;
            yield user.save();
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
        res.json({
            _id: user._id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            isPhoneVerified: user.isPhoneVerified,
            isVerified: user.isVerified,
            role: user.role,
            token
        });
    }
    catch (error) {
        console.error('Firebase phone authentication error:', error);
        res.status(500).json({ message: 'Server error during phone authentication' });
    }
});
exports.verifyFirebasePhoneAuth = verifyFirebasePhoneAuth;
/**
 * Get user profile.
 */
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore - req.user is added by auth middleware
        const user = yield User_1.default.findById(req.user.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUserProfile = getUserProfile;
/**
 * Update user profile.
 */
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore - req.user is added by auth middleware
        const user = yield User_1.default.findById(req.user.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const { name, email, password, phoneNumber } = req.body;
        if (name)
            user.name = name;
        if (email)
            user.email = email;
        if (phoneNumber)
            user.phoneNumber = phoneNumber;
        if (password) {
            const salt = yield bcryptjs_1.default.genSalt(10);
            user.password = yield bcryptjs_1.default.hash(password, salt);
        }
        const updatedUser = yield user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber,
            role: updatedUser.role,
            isPhoneVerified: updatedUser.isPhoneVerified
        });
    }
    catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateUserProfile = updateUserProfile;
