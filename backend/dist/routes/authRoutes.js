"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// A helper to wrap async request handlers
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// Auth routes
router.post('/register', asyncHandler(authController_1.register));
router.post('/login', asyncHandler(authController_1.login));
router.route('/profile')
    .get(authMiddleware_1.protect, asyncHandler(authController_1.getUserProfile))
    .put(authMiddleware_1.protect, asyncHandler(authController_1.updateUserProfile));
// Phone authentication routes
router.post('/phone/send-code', asyncHandler(authController_1.sendPhoneVerificationCode));
router.post('/phone/verify-code', asyncHandler(authController_1.verifyPhoneCode));
// New Firebase phone authentication route
router.post('/phone/verify-firebase', asyncHandler(authController_1.verifyFirebasePhoneAuth));
// Email OTP route
router.post('/email/send-otp', asyncHandler(authController_1.generateOTP));
exports.default = router;
