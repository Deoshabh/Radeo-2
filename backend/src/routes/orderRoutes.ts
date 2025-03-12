import express from 'express';
import { protect } from '../middleware/authMiddleware';
const router = express.Router();

// Basic order routes implementation
router.get('/', protect, (req, res) => {
    res.json({ message: 'Get all orders' });
});

router.get('/:id', protect, (req, res) => {
    res.json({ message: 'Get single order' });
});

export default router; 