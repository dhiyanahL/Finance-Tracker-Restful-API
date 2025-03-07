import Transaction from "../models/transaction.js";
import asyncHandler from "express-async-handler";
import Budget from "../models/budget.js";
import Notification from "../models/notifications.js";
import User from "../models/user.js";
import { autoAllocateSavings } from "./goalController.js";
import { getExchangeRate } from "../utils/currencyConverter.js";

//Create a new transaction (supports multi-currency)
export const addTransaction = asyncHandler(async (req, res) => {
    const { type, amount, category, tags, date, recurring, recurrencePattern, lastProcessDate, currency } = req.body;

    if(!type || !amount || !category){
        res.status(400);
        throw new Error("Please provide type, amount and category")

    }

    const transaction = new Transaction({
        user: req.user._id,
        type,
        amount,
        category,
        tags,
        date,
        recurring,
        recurrencePattern,
        lastProcessDate,
        currency: currency || "LKR"
    });

    const savedTransaction = await transaction.save();

    // 🔹 Check if the category has a budget and update it
    if (type === "expense") {
        const budget = await Budget.findOne({ user: req.user._id, category });

        if (budget) {
            budget.used += amount;
            await budget.save();

            // 🔔 Send notification if budget exceeded
            if (budget.used >= budget.limit) {
                await Notification.create({
                    user: req.user._id,
                    message: `⚠️ Budget alert: You have exceeded your ${category} budget of $${budget.limit}.`,
                    type: "budget",
                    seen: false
                });
            }
        }
    }

    //// 🔹 Automatically allocate savings if this is an income transaction - GOALS
    if (type === "income") {
        await autoAllocateSavings(req.user._id, amount);
    }

    // 🔹 Handle Recurring Transactions Notifications
    if (recurring) {
        // Check if it's an upcoming or missed recurring transaction
        const currentDate = new Date();
        const lastProcess = new Date(lastProcessDate);
        let nextDueDate;

        // Calculate the next due date based on the recurrence pattern
        switch (recurrencePattern) {
            case "daily":
                nextDueDate = new Date(lastProcess.setDate(lastProcess.getDate() + 1));
                break;
            case "weekly":
                nextDueDate = new Date(lastProcess.setDate(lastProcess.getDate() + 7));
                break;
            case "monthly":
                nextDueDate = new Date(lastProcess.setMonth(lastProcess.getMonth() + 1));
                break;
            default:
                nextDueDate = lastProcess; // If no recurrence pattern, just use lastProcessDate
                break;
        }

        if (nextDueDate < currentDate) {
            // Transaction was missed (should have occurred but wasn't processed)
            await Notification.create({
                user: req.user._id,
                message: `⚠️ Your recurring transaction for ${category} was due on ${nextDueDate.toDateString()} but was missed.`,
                type: "recurring",
                seen: false,
            });
        } else if (nextDueDate > currentDate) {
            // Transaction is upcoming (next recurring transaction)
            await Notification.create({
                user: req.user._id,
                message: `🔔 Your recurring transaction for ${category} is upcoming on ${nextDueDate.toDateString()}.`,
                type: "recurring",
                seen: false,
            });
        }
    }

    res.status(201).json(savedTransaction);
});



export const getTransactions = asyncHandler(async (req, res) => {
    const { type, category, minAmount, maxAmount, startDate, endDate, tags, sortBy, page, limit } = req.query;

    let filter = { user: req.user._id }; // Ensure transactions belong to logged-in user

    // 🔹 Filter by transaction type (income/expense)
    if (type) {
        filter.type = type;
    }

    // 🔹 Filter by category
    if (category) {
        filter.category = category;
    }

    // 🔹 Filter by amount range
    if (minAmount || maxAmount) {
        filter.amount = {};
        if (minAmount) filter.amount.$gte = parseFloat(minAmount);
        if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }

    // 🔹 Filter by date range
    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
    }

    // 🔹 Filter by tags (e.g., search for transactions with "#vacation")
    if (tags) {
        filter.tags = { $in: tags.split(",") }; // Convert comma-separated string into an array
    }

    // 🔹 Sorting (default: newest first)
    let sortOptions = { date: -1 };
    if (sortBy === "amount") {
        sortOptions = { amount: -1 }; // Sort by amount (highest first)
    } else if (sortBy === "amount-asc") {
        sortOptions = { amount: 1 }; // Sort by amount (lowest first)
    }

    // 🔹 Pagination settings
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // 🔹 Get the user's preferred currency
    const user = await User.findById(req.user._id);
    const userCurrency = user.currency || "LKR"; // Default to LKR if not set

    // 🔹 Execute query with filtering, sorting, and pagination
    const transactions = await Transaction.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(pageSize);

    // 🔹 Convert transaction amounts to user's preferred currency
    const convertedTransactions = await Promise.all(
        transactions.map(async (transaction) => {
            if (transaction.currency !== userCurrency) {
                const exchangeRate = await getExchangeRate(transaction.currency, userCurrency);
                console.log(`Exchange rate from ${transaction.currency} to ${userCurrency}:`, exchangeRate);

                return {
                    ...transaction._doc,
                    convertedAmount: exchangeRate ? (transaction.amount * exchangeRate).toFixed(2) : transaction.amount,
                    convertedCurrency: userCurrency
                };
            }
            return transaction;
        })
    );

    // 🔹 Total count for pagination
    const totalTransactions = await Transaction.countDocuments(filter);

    res.json({
        total: totalTransactions,
        page: pageNumber,
        pages: Math.ceil(totalTransactions / pageSize),
        transactions: convertedTransactions
    });
});



//Get a specific transaction by ID
export const getTransactionById = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction || transaction.user.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error("Transaction not found");
    }
    res.json(transaction);
});

//Update a transaction
export const updateTransaction = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction || transaction.user.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error("Transaction not found");
    }

    const { type, amount, category, tags, date, recurring, recurrencePattern, lastProcessDate, currency } = req.body;

    transaction.type = type || transaction.type;
    transaction.amount = amount || transaction.amount;
    transaction.category = category || transaction.category;
    transaction.tags = tags || transaction.tags;
    transaction.date = date || transaction.date;    
    transaction.recurring = recurring || transaction.recurring;
    transaction.recurrencePattern = recurrencePattern || transaction.recurrencePattern;
    transaction.lastProcessDate = lastProcessDate || transaction.lastProcessDate;
    transaction.currency = currency || transaction.currency;

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
});


//Delete a transaction
export const deleteTransaction = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction || transaction.user.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error("Transaction not found");
    }
    await transaction.deleteOne();
    res.json({ message: "Transaction deleted successfully" });
});