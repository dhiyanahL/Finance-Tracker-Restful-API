import express from "express";
import {
    addTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction,
    getTransactionById
} from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
.post(protect, addTransaction) //Create a transaction
.get(protect, getTransactions); //Get all transactions

router.route("/:id")
.get(protect, getTransactionById) //Get a specific transaction
.put(protect, updateTransaction) //Update a transaction
.delete(protect, deleteTransaction); //Delete a transaction

export default router;
