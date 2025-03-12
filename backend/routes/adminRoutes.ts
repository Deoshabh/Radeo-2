import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all routes in this router with authentication and admin check
router.use(protect); // Authentication check
router.use(admin);   // Admin role check

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Admin Panel' });
});

export default router;