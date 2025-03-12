import express from 'express';
const otherRouter = express.Router();
// Add your other routes here
otherRouter.get('/', (req, res) => {
    res.json({ message: 'Other routes are working' });
});
export default otherRouter;
