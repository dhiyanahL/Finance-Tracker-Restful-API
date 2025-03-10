import User from "../models/user.js";
import Transaction from "../models/transaction.js";
import Budget from "../models/budget.js";
import Goal from "../models/goals.js";
import asyncHandler from "express-async-handler";

// ✅ Get Role-Based Dashboard
export const getDashboard = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (user.role === "admin") {
        // 🔹 Admin Dashboard
        const totalUsers = await User.countDocuments();
        const totalTransactions = await Transaction.countDocuments();
        const totalBudgetUsed = await Budget.aggregate([
            { $group: { _id: null, totalUsed: { $sum: "$used" } } }
        ]);
        const totalSaved = await Goal.aggregate([
            { $group: { _id: null, totalSaved: { $sum: "$savedAmount" } } }
        ]);

        res.json({
            role: "admin",
            totalUsers,
            totalTransactions,
            totalBudgetUsed: totalBudgetUsed[0]?.totalUsed || 0,
            totalSaved: totalSaved[0]?.totalSaved || 0
        });

    } else {
        // 🔹 Regular User Dashboard
        const totalIncome = await Transaction.aggregate([
            { $match: { user: req.user._id, type: "income" } },
            { $group: { _id: null, totalIncome: { $sum: "$amount" } } }
        ]);

        const totalExpenses = await Transaction.aggregate([
            { $match: { user: req.user._id, type: "expense" } },
            { $group: { _id: null, totalExpenses: { $sum: "$amount" } } }
        ]);

        const budgets = await Budget.find({ user: req.user._id });
        const goals = await Goal.find({ user: req.user._id });

        res.json({
            role: "user",
            totalIncome: totalIncome[0]?.totalIncome || 0,
            totalExpenses: totalExpenses[0]?.totalExpenses || 0,
            budgets,
            goals
        });
    }
});
