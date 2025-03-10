//Unit test - Jest

import { deleteTransaction } from "../../controllers/transactionController.js";
import Transaction from "../../models/transaction.js";
import { jest } from "@jest/globals";
import mongoose from "mongoose";

jest.mock("../../models/transaction.js");

describe("Transaction Controller - deleteTransaction", () => {
    it("should delete a transaction successfully", async () => {
        const mockTransactionId = new mongoose.Types.ObjectId();
        const mockUserId = new mongoose.Types.ObjectId();

        const req = { 
            params: { id: mockTransactionId }, 
            user: { _id: mockUserId } 
        };
        const res = { 
            status: jest.fn().mockReturnThis(), 
            json: jest.fn() 
        };

        const mockTransaction = {
            _id: mockTransactionId,
            user: mockUserId,
            deleteOne: jest.fn().mockResolvedValue({}) // ✅ Ensure deleteOne resolves properly
        };

        Transaction.findById.mockResolvedValue(mockTransaction);

        await deleteTransaction(req, res);

        expect(mockTransaction.deleteOne).toHaveBeenCalled(); // Ensure deleteOne is called
        expect(res.status).toHaveBeenCalledTimes(1); // Ensure status is called exactly once
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Transaction deleted successfully" });
    });

    it("should return 404 if transaction is not found", async () => {
        const req = { params: { id: new mongoose.Types.ObjectId() }, user: { _id: new mongoose.Types.ObjectId() } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        Transaction.findById.mockResolvedValue(null);

        await expect(deleteTransaction(req, res)).rejects.toThrow("Transaction not found");
    });
});
