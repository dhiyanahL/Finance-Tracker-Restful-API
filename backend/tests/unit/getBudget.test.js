// Unit test - Jest

import { getBudgets } from "../../controllers/budgetController.js";
import Budget from "../../models/budget.js";
import { jest } from "@jest/globals";
import mongoose from "mongoose";

jest.mock("../../models/budget.js");

describe("Budget Controller - getBudgets", () => {
  it("should retrieve all budgets for the authenticated user", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const req = { 
      user: { _id: mockUserId } // Mock authenticated user
    };
    const res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };

    // Mock a budget in the database
    const mockBudgets = [
      {
        _id: new mongoose.Types.ObjectId(),
        user: mockUserId,
        category: "Groceries",
        limit: 500,
        month: "2025-03",
        used: 200,
      }
    ];

    Budget.find.mockResolvedValue(mockBudgets); // Mock Budget.find() to return mockBudgets

    await getBudgets(req, res);

    expect(Budget.find).toHaveBeenCalledWith({ user: mockUserId }); // Ensure Budget.find is called with the correct user ID
    expect(res.status).toHaveBeenCalledTimes(1); // Ensure status is called once
    expect(res.status).toHaveBeenCalledWith(200); // Expect status 200
    expect(res.json).toHaveBeenCalledWith(mockBudgets); // Ensure the response contains the mock budgets
  });

  it("should return an empty array if no budgets are found for the user", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const req = { 
      user: { _id: mockUserId }
    };
    const res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };

    // Mock Budget.find() to return an empty array
    Budget.find.mockResolvedValue([]);

    await getBudgets(req, res);

    expect(Budget.find).toHaveBeenCalledWith({ user: mockUserId }); // Ensure Budget.find is called with the correct user ID
    expect(res.status).toHaveBeenCalledTimes(1); // Ensure status is called once
    expect(res.status).toHaveBeenCalledWith(200); // Expect status 200
    expect(res.json).toHaveBeenCalledWith([]); // Ensure the response is an empty array
  });

  it("should return 401 if the user is not authenticated", async () => {
    const req = {}; // No user (unauthenticated)
    const res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };

    await getBudgets(req, res);

    expect(res.status).toHaveBeenCalledWith(401); // Ensure status is 401 for unauthenticated access
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized, no token" }); // Ensure proper error message
  });
});
