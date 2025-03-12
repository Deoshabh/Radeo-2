import cors from 'cors';
import { Express } from 'express';

export function setupCors(app: Express): void {
  // Configure CORS to accept requests from your frontend
  const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
  
  app.use(cors(corsOptions));
  
  // Ensure JSON is returned with proper content type
  app.use((req, res, next) => {
    res.header('Content-Type', 'application/json');
    next();
  });
}
