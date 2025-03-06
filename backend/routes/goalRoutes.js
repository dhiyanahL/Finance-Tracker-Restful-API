import express from "express";
import { addGoal, getGoals, updateGoalProgress, updateGoal, deleteGoal } from "../controllers/goalController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
.post(protect, addGoal) //Create a goal
.get(protect, getGoals); //Get all goals


router.route("/:id")
    .put(protect, updateGoal) // ✅ Update a goal
    .delete(protect, deleteGoal); // ✅ Delete a goal

router.put("/:id/savings", protect, updateGoalProgress); // ✅ Update goal progress


export default router;