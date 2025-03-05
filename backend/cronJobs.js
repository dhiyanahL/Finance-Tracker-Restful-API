import cron from "node-cron";
import Transaction from "./models/transaction.js";
import Notification from "./models/notifications.js"
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const checkRecurringTransactions = async () => {
    console.log("🔄 Checking for recurring transactions...");

    const today = new Date();
    const transactions = await Transaction.find({ recurring: true });

    for (const transaction of transactions) {
        let nextDueDate = new Date(transaction.lastProcessDate || transaction.date);

        if (transaction.recurrencePattern === "daily") {
            nextDueDate.setDate(nextDueDate.getDate() + 1);
        } else if (transaction.recurrencePattern === "weekly") {
            nextDueDate.setDate(nextDueDate.getDate() + 7);
        } else if (transaction.recurrencePattern === "monthly") {
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        }

        // Check for upcoming transactions (next 2 days)
        let upcomingDate = new Date();
        upcomingDate.setDate(today.getDate() + 2);

        if (nextDueDate.toDateString() === upcomingDate.toDateString()) {
            console.log(`🔔 Upcoming transaction for user ${transaction.user}: ${transaction.category}`);
            await Notification.create({
                user: transaction.user,
                message: `Upcoming ${transaction.category} transaction of $${transaction.amount} on ${nextDueDate.toDateString()}`,
                type: "transaction",
                seen: false
            });
        }

        // Check for missed transactions (yesterday or earlier)
        if (nextDueDate < today) {
            console.log(`⚠️ Missed transaction for user ${transaction.user}: ${transaction.category}`);
            await Notification.create({
                user: transaction.user,
                message: `Missed ${transaction.category} transaction of $${transaction.amount} was due on ${nextDueDate.toDateString()}`,
                type: "transaction",
                seen: false
            });
        }
    }
};

// Run the job every day at midnight
cron.schedule("0 0 * * *", checkRecurringTransactions);
console.log("✅ Recurring transaction checker scheduled.");