import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
    try {
      console.log("MONGO_URI:", process.env.MONGO_URI);  // Log the value of MONGO_URI
      const conn = await mongoose.connect(process.env.MONGO_URI);
     //console.log("MongoDB connection object:", conn);  // Log the entire connection object
      
      console.log(`MongoDB Connected: ${conn.connection.host}`);   
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1); // 1 code means --> Exit process with failure
      //0 code means --> Exit process with success
    }
  }

/*export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};*/
