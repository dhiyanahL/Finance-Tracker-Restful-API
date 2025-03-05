import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import "./cronJobs.js" //Starts the scheduler
import notificationRoutes from "./routes/notificationRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js"

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/budgets", budgetRoutes);


app.listen(5000, () => {
    connectDB();
    console.log("Server is running on port 5000");

});

