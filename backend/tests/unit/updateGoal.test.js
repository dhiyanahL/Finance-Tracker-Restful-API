// Unit test - Jest

import { updateGoal } from "../../controllers/goalController.js";
import Goal from "../../models/goals.js";
import { jest } from "@jest/globals";
import mongoose from "mongoose";

jest.mock("../../models/goals.js");

describe("Goal Controller - updateGoal", () => {
    it("should update a goal successfully", async () => {
        const mockGoalId = new mongoose.Types.ObjectId();
        const mockUserId = new mongoose.Types.ObjectId();

        const req = { 
            params: { id: mockGoalId },
            body: { name: "New Goal Name", targetAmount: 5000 }, // Example update data
            user: { _id: mockUserId }
        };
        const res = { 
            status: jest.fn().mockReturnThis(), 
            json: jest.fn() 
        };

        const mockGoal = {
            _id: mockGoalId,
            user: mockUserId,
            name: "Old Goal Name",
            targetAmount: 3000,
            save: jest.fn().mockResolvedValue({ name: "New Goal Name", targetAmount: 5000 }) // ✅ Ensure save resolves correctly
        };

        Goal.findById.mockResolvedValue(mockGoal);

        await updateGoal(req, res);

        expect(Goal.findById).toHaveBeenCalledWith(mockGoalId); // ✅ Ensure findById is called with correct ID
        expect(mockGoal.save).toHaveBeenCalled(); // ✅ Ensure save is called
        expect(res.status).toHaveBeenCalledTimes(1); // ✅ Ensure status is called exactly once
        expect(res.status).toHaveBeenCalledWith(200); 
        expect(res.json).toHaveBeenCalledWith({ message: "Goal updated successfully", goal: { name: "New Goal Name", targetAmount: 5000 } });
    });

    it("should return 404 if goal is not found", async () => {
        const req = { 
            params: { id: new mongoose.Types.ObjectId() },
            body: { name: "New Goal Name", targetAmount: 5000 },
            user: { _id: new mongoose.Types.ObjectId() }
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        Goal.findById.mockResolvedValue(null);

        await expect(updateGoal(req, res)).rejects.toThrow("Goal not found");
    });

    it("should return 400 if validation fails", async () => {
        const req = { 
            params: { id: new mongoose.Types.ObjectId() },
            body: { name: "", targetAmount: -1000 }, // Invalid data
            user: { _id: new mongoose.Types.ObjectId() }
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        const mockGoal = {
            _id: req.params.id,
            user: req.user._id,
            name: "Old Goal Name",
            targetAmount: 3000,
            save: jest.fn()
        };

        Goal.findById.mockResolvedValue(mockGoal);

        await updateGoal(req, res);

        expect(res.status).toHaveBeenCalledWith(400); // ✅ Ensure 400 is returned for validation failure
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid goal data" });
    });
});
