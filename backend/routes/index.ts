s
import { Router } from 'express';

const router = Router();

// Define your routes
router.get('/example', (req, res) => {
  res.json({ message: 'Example route' });
});

// Make sure to export the router (not an object containing the router)
export default router;

// If you want to export multiple routers, use named exports:
// export const userRouter = Router();
// export const productRouter = Router();