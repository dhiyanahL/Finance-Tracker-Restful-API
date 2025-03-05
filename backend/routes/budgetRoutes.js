import express from "express";
import { addBudget, getBudgets, updateBudget, deleteBudget, checkBudgetStatus} from "../controllers/budgetController.js";
import {protect} from "../middleware/authMiddleware.js"

const router = express.Router();
router.route("/")
.post(protect, addBudget) //Create a budget
.get(protect, getBudgets) // Get all budgets

router.route("/:id")
.put(protect, updateBudget)
.delete(protect, deleteBudget);

router.get("/status", protect, checkBudgetStatus); // ✅ Check budget status based on transactions


export default router;
