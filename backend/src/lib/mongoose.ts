import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string, {
      serverSelectionTimeoutMS: 5000, // Optional: Adjust based on needs
    });
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
