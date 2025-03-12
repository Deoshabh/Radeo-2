import express from 'express';
const router = express.Router();
// Define routes
router.get('/', (req, res) => {
    res.send('Router is working');
});
// Make sure to export the router
export default router;
