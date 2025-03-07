import express from "express";
import { getBudgetReport, getIncomeExpenseSummary, getSavedReports, getCategoryExpenseReport, getSavingsReport } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/budget", protect, getBudgetReport);  //Budget Utilization Report
router.get("/income-expense", protect, getIncomeExpenseSummary);  //Income VS Expense Summary Report
router.get("/category-expense", protect, getCategoryExpenseReport); //Category-wise Expense Report
router.get("/savings", protect, getSavingsReport);  //Savings & Goal Progress Report
router.get("/history", protect, getSavedReports); //Get Saved Reports

export default router;