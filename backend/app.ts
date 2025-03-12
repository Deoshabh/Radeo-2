import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import connectDB from './config/db';
import client from './lib/redis';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import userRoutes from './routes/userRoutes';
import adminProductRoutes from './routes/admin/productRoutes';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import { standardResponseMiddleware } from './middleware/standardResponseMiddleware';
import healthRoutes from './routes/healthRoutes';
import { setupCors } from './middleware/corsMiddleware';

// Load environment variables before anything else
config();

// Connect to MongoDB with enhanced error handling
connectDB().catch(err => {
  console.error('MongoDB connection error at startup:', err);
  console.log('Starting application with limited functionality');
});

// Redis is connected automatically when imported

const app = express();

// Apply CORS configuration with proper headers
setupCors(app);

// Add standardized response methods
app.use(standardResponseMiddleware);

// Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
const routersToRegister = [
  { path: '/api/auth', router: authRoutes },
  { path: '/api/products', router: productRoutes },
  { path: '/api/categories', router: categoryRoutes },
  { path: '/api/orders', router: orderRoutes },
  { path: '/api/users', router: userRoutes },
  { path: '/api/admin/products', router: adminProductRoutes },
  { path: '/api/admin/categories', router: categoryRoutes }, // Reuse imported router
  { path: '/api/admin/orders', router: orderRoutes }, // Reuse imported router
  { path: '/api/admin/users', router: userRoutes }, // Reuse imported router
];

// Register each router safely
routersToRegister.forEach(({ path, router }) => {
  if (router) {
    app.use(path, router);
  } else {
    console.warn(`Warning: Router for path "${path}" is undefined and was not registered`);
  }
});

// Health check routes
app.use('/api/health', healthRoutes);

// Error handling middleware
app.use(notFound);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled application error:', err);
  
  // Use the standardized error response
  return res.error(
    'An unexpected error occurred', 
    500, 
    process.env.NODE_ENV === 'development' ? { message: err.message, stack: err.stack } : null
  );
});

// Handle application shutdown gracefully
process.on('SIGINT', async () => {
  try {
    console.log('Closing Redis connection...');
    await client.disconnect();
    console.log('Redis connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

export default app;