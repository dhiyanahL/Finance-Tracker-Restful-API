/*import mongoose from "mongoose";

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
*/


/*import dotenv from "dotenv";
dotenv.config();
import path from "path"; 
import mongoose from "mongoose";

// Load correct .env file based on NODE_ENV
dotenv.config({ path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`) });

export const connectDB = async () => {
    try {
        const dbUri = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGO_URI : process.env.MONGO_URI;

        if (!dbUri) {
            console.error("Database URI is not defined in the environment variables.");
            process.exit(1);
        }

        console.log("Connecting to database:", dbUri);
        await mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("MongoDB Connected",dbUri);

          
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};
*/

import dotenv from "dotenv";
dotenv.config();
import path from "path"; 
import mongoose from "mongoose";

// Load correct .env file based on NODE_ENV
dotenv.config({ path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`) });

export const connectDB = async () => {
    try {
        const dbUri = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGO_URI : process.env.MONGO_URI;

        if (!dbUri) {
            console.error("Database URI is not defined in the environment variables.");
            process.exit(1);
        }

        // Check if the database is already connected
        if (mongoose.connection.readyState === 0) {
            console.log("Connecting to database:", dbUri);
            await mongoose.connect(dbUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log("MongoDB Connected", dbUri);
        } else {
            console.log("MongoDB already connected");
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};




