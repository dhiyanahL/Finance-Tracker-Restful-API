import Transaction from "../models/transaction.js";
import asyncHandler from "express-async-handler";
import Budget from "../models/budget.js";
import Notification from "../models/notifications.js";

//Create a new transaction
export const addTransaction = asyncHandler(async (req, res) => {
    const { type, amount, category, tags, date, recurring, recurrencePattern, lastProcessDate } = req.body;

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

    res.status(201).json(savedTransaction);
});

//Get all transactions for the logged-in user
/*export const getTransactions = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find({ user: req.user._id }).sort({date : -1});
        res.json(transactions);
});*/

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

    // 🔹 Execute query with filtering, sorting, and pagination
    const transactions = await Transaction.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(pageSize);

    // 🔹 Total count for pagination
    const totalTransactions = await Transaction.countDocuments(filter);

    res.json({
        total: totalTransactions,
        page: pageNumber,
        pages: Math.ceil(totalTransactions / pageSize),
        transactions
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

    const { type, amount, category, tags, date, recurring, recurrencePattern } = req.body;

    transaction.type = type || transaction.type;
    transaction.amount = amount || transaction.amount;
    transaction.category = category || transaction.category;
    transaction.tags = tags || transaction.tags;
    transaction.date = date || transaction.date;    
    transaction.recurring = recurring || transaction.recurring;
    transaction.recurrencePattern = recurrencePattern || transaction.recurrencePattern;
    transaction.lastProcessDate = lastProcessDate || transaction.lastProcessDate;

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