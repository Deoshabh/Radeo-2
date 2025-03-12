import express from 'express';
import { isAuthenticated } from '../middleware/authMiddleware';
const router = express.Router();
router.use(isAuthenticated); // Protect all routes in this router
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Admin Panel' });
});
export default router;
