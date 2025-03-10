import dotenv from "dotenv";
dotenv.config();


// Conditionally load .env file based on environment 
if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: '.env.test' });  // Load test-specific environment variables
  } else {
    dotenv.config();  // Load default .env file for development or production
  }


import express from "express";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import "./cronJobs.js"; //Starts the scheduler
import notificationRoutes from "./routes/notificationRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.listen(5000, () => {
  connectDB();
  if (process.env.NODE_ENV !== "test") {
    console.log("Server is running on port 5000");
  }
  //console.log("Server is running on port 5000");
});

export default app; // Export the app for testing