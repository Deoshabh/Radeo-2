import express from 'express';
const router = express.Router();
// Define your product routes here
router.get('/', (req, res) => {
    res.send('Get all products');
});
export default router;
