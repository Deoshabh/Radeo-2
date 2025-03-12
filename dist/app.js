import express from 'express';
import dotenv from 'dotenv';
import categoryRoutes from './routes/categoryRoutes';
import otherRouter from './routes/otherRoutes';
const app = express();
dotenv.config();
app.use(express.json());
app.use('/api/categories', categoryRoutes);
app.use('/api/other', otherRouter);
// ...existing code...
// ...existing code...
export default app;
