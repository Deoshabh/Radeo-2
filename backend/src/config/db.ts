import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Database connection function
const connectDB = async (): Promise<void> => {
  try {
    // Use environment variable with fallback without deprecated options
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/radeo-shop'
    );
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // Graceful recovery in production; exit otherwise
    if (process.env.NODE_ENV === 'production') {
      console.error('MongoDB connection failed. Application will continue with limited functionality.');
    } else {
      process.exit(1);
    }
  }
};

export default connectDB;
