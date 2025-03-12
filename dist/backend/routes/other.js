import express from 'express';
const router = express.Router();
// Define your other routes here
router.get('/', (req, res) => {
    res.send('Other routes working!');
});
export default router;
