import Budget from "../models/budget.js";
import asyncHandler from "express-async-handler";
import Transaction from "../models/transaction.js";
import Notification from "../models/notifications.js";

//Create a new budget
export const addBudget = asyncHandler(async(req,res) => {
    const {category, limit, month, used, notifications} = req.body;

    if (!category|| !limit){
        res.status(400);
        throw new Error ("Please provide the category and limit");
    }

    const budget = new Budget({
        user: req.user._id,
        category,
        limit,
        month,
        used,
        notifications
    });

    const savedBudget = await budget.save();
    res.status(201).json(savedBudget);
});

//Get all budgets
export const getBudgets = asyncHandler(async(req,res) => {
    const budgets = await Budget.find({user : req.user._id});
    res.json(budgets);
});


// ✅ Check Budget Status Based on Transactions
/*export const checkBudgetStatus = asyncHandler(async (req, res) => {
    const budgets = await Budget.find({ user: req.user._id });

    for (const budget of budgets) {
        // Get total spent in this category
        const totalSpent = await Transaction.aggregate([
            { $match: { user: req.user._id, category: budget.category, type: "expense" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        budget.used = totalSpent.length > 0 ? totalSpent[0].total : 0;
        await budget.save();

        // 🔔 Send notification if budget exceeded
        if (budget.notifications && budget.used >= budget.limit) {
            await Notification.create({
                user: req.user._id,
                message: `⚠️ Budget alert: You have exceeded your ${budget.category} budget of $${budget.limit}.`,
                type: "budget",
                seen: false
            });
        }
    }

    res.json(budgets);
});*/

export const checkBudgetStatus = asyncHandler(async (req, res) => {
    const budgets = await Budget.find({ user: req.user._id });

    for (const budget of budgets) {
        let totalSpent = 0;

        // If the budget is a monthly budget, we need to filter by month
        if (budget.month) {
            totalSpent = await Transaction.aggregate([
                { 
                    $match: { 
                        user: req.user._id, 
                        category: budget.category, 
                        type: "expense", 
                        date: { $gte: new Date(`${budget.month}-01`), $lt: new Date(`${budget.month}-01`).setMonth(new Date(`${budget.month}-01`).getMonth() + 1) } 
                    }
                },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);
        } 
        // If it's not a monthly budget (i.e., a global budget), we just match by category
        else {
            totalSpent = await Transaction.aggregate([
                { $match: { user: req.user._id, category: budget.category, type: "expense" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);
        }

        budget.used = totalSpent.length > 0 ? totalSpent[0].total : 0;
        await budget.save();

        // 🔔 Send notification if budget exceeded
        if (budget.notifications && budget.used >= budget.limit) {
            const notificationMessage = budget.month 
                ? `⚠️ Budget alert: You have exceeded your ${budget.category} budget of $${budget.limit} for ${budget.month}.` 
                : `⚠️ Budget alert: You have exceeded your ${budget.category} budget of $${budget.limit}.`;

            await Notification.create({
                user: req.user._id,
                message: notificationMessage,
                type: "budget",
                seen: false
            });
        }
    }

    res.json(budgets);
});



//Update a budget
export const updateBudget = asyncHandler(async(req,res)=>{
    const budget = await Budget.findById(req.params.id);
    if(!budget || budget.user.toString() !== req.user._id.toString()){
        res.status(404);
        throw new Error("Budget not found");
    }
    
    const {category, limit, month, used, notifications} = req.body;

    budget.category = category || budget.category;
    budget.limit = limit ||budget.limit;
    budget.used = used || budget.used;
    budget.month = month|| budget.month;
    budget.notifications = notifications ||budget.notifications;

    const updateBudget = await budget.save();
    res.json(updateBudget);

});

//Delete a budget
export const deleteBudget = asyncHandler(async(req,res) => {
    const budget = await Budget.findById(req.params.id);
    if (!budget || budget.user.toString()!== req.user._id.toString()){
        res.status(404);
        throw new Error ("Budget not found");
    }

    await budget.deleteOne();
    res.json({message: "Budget deleted successfully"});
});