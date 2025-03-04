import Transaction from "../models/transaction.js";
import asyncHandler from "express-async-handler";

//Create a new transaction
export const addTransaction = asyncHandler(async (req, res) => {
    const { type, amount, category, tags, date, recurring, recurrencePattern } = req.body;

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
        recurrencePattern
    });

    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
});

//Get all transactions for the logged-in user
export const getTransactions = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find({ user: req.user._id }).sort({date : -1});
        res.json(transactions);
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