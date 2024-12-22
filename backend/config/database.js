import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connection established");
  } catch (error) {
    console.error("Database connection failed", error);
  }
};

export default connectDB;
