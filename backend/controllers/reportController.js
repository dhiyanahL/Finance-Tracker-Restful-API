import Transaction from "../models/transaction.js";
import asyncHandler from "express-async-handler";
import Goal from "../models/goals.js";
import Report from "../models/report.js";
import Budget from "../models/budget.js";

//Function to save report 
const saveReport = async(userId, type, startDate, endDate, data) =>{
    await Report.create({
        user: userId,
        type,
        startDate,
        endDate,
        data
    });
};

//1. Income VS Expense Summary
export const getIncomeExpenseSummary = asyncHandler(async(req,res) =>{
    const {startDate, endDate} = req.query;

    let filter = {user: req.user._id};

    if(startDate || endDate){
        filter.date = {};
        if(startDate) filter.date.$gte = new Date(startDate);
        if(endDate) filter.date.$lte = new Date(endDate);
    }

    const income = await Transaction.aggregate([
        {$match: {...filter, type: "income"}},
        {$group: {_id: null, totalIncome: {$sum: "$amount"}}}
    
    ]);

    const expense = await Transaction.aggregate([
        {$match: {...filter, type: "expense"}},
        {$group: {_id: null, totalExpense: {$sum: "$amount"}}}
    ]);

    const reportData ={
        totalIncome: income[0]?.totalIncome || 0,
        totalExpense: expense[0]?.totalExpense || 0,
        netbalance: (income[0]?.totalIncome || 0) - (expense[0]?.totalExpense || 0)
    };

    //Store the report

    await saveReport(req.user._id, "income-expense", startDate, endDate, reportData);

    res.json(reportData);
    
});

//Expense Breakdown by Category
export const getCategoryExpenseReport = asyncHandler(async(req,res) =>{
    const {startDate, endDate} = req.query;
    let filter = {user: req.user._id, type:"expense"};

    if(startDate || endDate){
        filter.date ={};
        if(startDate) filter.date.$gte = new Date(startDate);
        if(endDate) filter.date.$lte = new Date(endDate);
    }

    const categoryExpenses = await Transaction.aggregate([
        {$match: filter},
        {$group: {_id: "$category", totalAmount: {$sum: "$amount"}}}
    ]);
    await saveReport(req.user._id, "category-expense", startDate, endDate, categoryExpenses);

    res.json(categoryExpenses);
});

// ✅ Savings & Goal Progress Report
export const getSavingsReport = asyncHandler(async (req, res) => {
    const goals = await Goal.find({ user: req.user._id });

    const savingsReport = goals.map(goal => ({
        name: goal.name,
        targetAmount: goal.targetAmount,
        savedAmount: goal.savedAmount,
        progress: ((goal.savedAmount / goal.targetAmount) * 100).toFixed(2) // Percentage
    }));

    await saveReport(req.user._id, "savings", null, null, savingsReport);
    
    res.json(savingsReport);
});

// ✅ Budget Utilization Report
export const getBudgetReport = asyncHandler(async (req, res) => {
    const budgets = await Budget.find({ user: req.user._id });

    const budgetReport = budgets.map(budget => ({
        category: budget.category,
        limit: budget.limit,
        used: budget.used,
        remaining: budget.limit - budget.used,
        usagePercentage: ((budget.used / budget.limit) * 100).toFixed(2) // Percentage
    }));

    await saveReport(req.user._id, "budget", null, null, budgetReport);
    
    res.json(budgetReport);
});

// ✅ 5. Get Saved Reports
export const getSavedReports = asyncHandler(async (req, res) => {
    const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
})