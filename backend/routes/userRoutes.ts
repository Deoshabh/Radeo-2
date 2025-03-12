import express, { Router, Request, Response } from 'express';
import { generateOTP } from '../controllers/authController';

const router: Router = express.Router();

// Health check route
router.get('/health', (req: Request, res: Response): void => {
  res.json({ message: 'Backend API Status: Online' });
});

// Request OTP route
router.post('/request-otp', generateOTP);

// Add more routes as needed

export default router;