import Goal from "../models/goals.js";
import asyncHandler from "express-async-handler";
import Notification from "../models/notifications.js";

//Create a new goal
export const addGoal = asyncHandler(async(req,res) =>{
    const{name, targetAmount, savedAmount, deadline, completed, autoSavePercentage} = req.body;

    if(!name || !targetAmount ||!deadline){
        res.status(400);
        throw new Error("Please provide the name, target amount and deadline");
    }

    const goal = await Goal.create({
        user : req.user._id,
        name,
        targetAmount,
        savedAmount,
        deadline,
        completed,
        autoSavePercentage : autoSavePercentage || 0
    });

    res.status(201).json(goal);

});

//Get all goals
export const getGoals = asyncHandler(async(req,res) => {
    const goals = await Goal.find({user : req.user._id});
    res.json(goals);
});

//Update a goal
export const updateGoal = asyncHandler(async(req,res) => {

     // Validate required fields
     const { name, targetAmount } = req.body;
     if (!name || !targetAmount) {
         return res.status(400).json({ message: "Invalid goal data" }); // Return 400 if validation fails
     }

    const goal = await Goal.findById(req.params.id);
    if(!goal || goal.user.toString() !== req.user._id.toString()){
        res.status(404);
        throw new Error("Goal not found");
    }
    const { savedAmount, deadline, completed, autoSavePercentage} = req.body;
    goal.name = name || goal.name;
    goal.targetAmount = targetAmount || goal.targetAmount;
    goal.savedAmount = savedAmount || goal.savedAmount;
    goal.deadline = deadline || goal.deadline;
    goal.completed = completed || goal.completed;
    goal.autoSavePercentage = req.body.autoSavePercentage ?? goal.autoSavePercentage; // Allow setting 0

    const updatedGoal = await goal.save();
    res.status(200).json({message: "Goal updated successfully", goal: updatedGoal});
});

//Delete a goal
export const deleteGoal = asyncHandler(async(req,res) => {
    const goal = await Goal.findById(req.params.id);
    if(!goal || goal.user.toString() !== req.user._id.toString()){
        res.status(404);
        throw new Error("Goal not found");
    }
    await goal.deleteOne();
    res.json({message : "Goal removed"});
});


// ✅ Add Savings to a Goal (Manual Savings Contribution)
export const updateGoalProgress = asyncHandler(async (req, res) => {
    const { amount } = req.body;

    const goal = await Goal.findById(req.params.id);

    if (!goal || goal.user.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error("Goal not found.");
    }

    if (!amount || amount <= 0) {
        res.status(400);
        throw new Error("Please provide a valid amount to save.");
    }

    goal.savedAmount += amount;

    // ✅ Check if the goal is completed
    if (goal.savedAmount >= goal.targetAmount) {
        goal.completed = true;

        // 🔔 Send notification that the goal is reached
        await Notification.create({
            user: req.user._id,
            message: `🎉 Congratulations! You have reached your savings goal: ${goal.name}.`,
            type: "goal",
            seen: false
        });
    }

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
});


// ✅ Automatically Allocate Savings from Income
export const autoAllocateSavings = asyncHandler(async (userId, incomeAmount) => {
    const goals = await Goal.find({ user: userId, autoSavePercentage: { $gt: 0 } });

    let totalSaved = 0;

    for (const goal of goals) {
        const amountToSave = (goal.autoSavePercentage / 100) * incomeAmount; // Calculate savings allocation

        goal.savedAmount += amountToSave;
        await goal.save();

        totalSaved += amountToSave;

        // 🔔 Send notification for auto-savings
        await Notification.create({
            user: userId,
            message: `💰 Auto-saved $${amountToSave.toFixed(2)} to your goal: ${goal.name}.`,
            type: "goal",
            seen: false
        });

        // ✅ Check if the goal is now completed
        if (goal.savedAmount >= goal.targetAmount) {
            goal.completed = true;
            await goal.save();

            await Notification.create({
                user: userId,
                message: `🎉 Goal reached! You have saved enough for ${goal.name}.`,
                type: "goal",
                seen: false
            });
        }
    }

    if (totalSaved > 0) {
        console.log(`✅ Auto-saved $${totalSaved.toFixed(2)} from income.`);
    }
});