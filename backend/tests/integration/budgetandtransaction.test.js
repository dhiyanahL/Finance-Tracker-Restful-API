import dotenv from "dotenv";
dotenv.config();

import request from "supertest";
import app from "../../server.js";
import mongoose from "mongoose";
import Budget from "../../models/budget.js";
import Transaction from "../../models/transaction.js";
import User from "../../models/user.js";
import jwt from "jsonwebtoken";

describe("Budget & Transaction Integration", () => {
    
    let token;
    let userId;
    let budgetId;

    beforeAll(async () => {
        jest.setTimeout(10000); // Increase the timeout so the test doesn't stop randomly

        // Check if the connection is already established
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.TEST_MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
        }

        // Create test user and token
        const user = new User({ name: "Test User", email: "test@example.com", password: "password123" });
        await user.save();
        userId = user._id;

        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Create a budget
        const budget = new Budget({ user: userId, category: "Food", limit: 500, used: 0 });
        await budget.save();
        budgetId = budget._id;
    });

    /*afterAll(async () => {
        // Clean up test data
        await Budget.deleteMany({});
        await Transaction.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();
    });*/

    test("Should update budget when a new transaction is added", async () => {
        // Add a transaction that affects the budget
        const res = await request(app)
            .post("/api/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({ category: "Food", amount: 200, type: "expense", user: userId });

        expect(res.statusCode).toBe(201);
        expect(res.body.amount).toBe(200);

        // Fetch updated budget
        const updatedBudget = await Budget.findById(budgetId);
        expect(updatedBudget.used).toBe(200);
    });

    test("Should send a notification if budget is exceeded", async () => {
        // Add another transaction that exceeds the budget
        await request(app)
            .post("/api/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({ category: "Food", amount: 400, type: "expense", user: userId });

        // Fetch updated budget
        const updatedBudget = await Budget.findById(budgetId);
        expect(updatedBudget.used).toBe(600);
        expect(updatedBudget.used).toBeGreaterThan(updatedBudget.limit);

        // Check for notification
        const notifications = await request(app)
            .get("/api/notifications")
            .set("Authorization", `Bearer ${token}`);

        expect(notifications.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ message: expect.stringContaining("exceeded your Food budget") }),
            ])
        );
    });
});
