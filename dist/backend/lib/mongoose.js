import mongoose from 'mongoose';
import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();
// Function to connect to MongoDB
const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit process with failure
    }
};
// Export the connection function
export default connectToDatabase;
