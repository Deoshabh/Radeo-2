import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
// Database connection function
const connectDB = async () => {
    try {
        // Use environment variable with fallback and add options to remove deprecation warnings
        const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/radeo-shop', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        // Set up global configuration to use createIndex instead of ensureIndex
        mongoose.set('useCreateIndex', true);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Don't immediately exit in production to allow for graceful recovery
        if (process.env.NODE_ENV === 'production') {
            console.error('MongoDB connection failed. Application will continue with limited functionality.');
        }
        else {
            process.exit(1);
        }
    }
};
export default connectDB;
