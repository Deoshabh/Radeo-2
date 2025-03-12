import express from 'express';
import { generateOTP } from '../controllers/authController';
const router = express.Router();
// Health check route
router.get('/health', (req, res) => {
    res.json({ message: 'Backend API Status: Online' });
});
// Request OTP route
router.post('/request-otp', generateOTP);
// Add more routes as needed
export default router;
