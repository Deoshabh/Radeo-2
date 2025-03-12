import express, { RequestHandler } from 'express';
import {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  sendPhoneVerificationCode,
  verifyPhoneCode,
  verifyFirebasePhoneAuth,
  generateOTP
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// A helper to wrap async request handlers
const asyncHandler = (fn: RequestHandler) => 
  (req: express.Request, res: express.Response, next: express.NextFunction) => 
    Promise.resolve(fn(req, res, next)).catch(next);

// Auth routes
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

router.route('/profile')
  .get(protect, asyncHandler(getUserProfile))
  .put(protect, asyncHandler(updateUserProfile));

// Phone authentication routes
router.post('/phone/send-code', asyncHandler(sendPhoneVerificationCode));
router.post('/phone/verify-code', asyncHandler(verifyPhoneCode));

// New Firebase phone authentication route
router.post('/phone/verify-firebase', asyncHandler(verifyFirebasePhoneAuth));

// Email OTP route
router.post('/email/send-otp', asyncHandler(generateOTP));

export default router;
