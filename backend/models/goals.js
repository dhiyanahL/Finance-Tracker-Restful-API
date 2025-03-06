import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
    user :{type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    name:{type: String, required: true},
    targetAmount: {type: Number, required: true},
    savedAmount: {type: Number, default: 0},
    deadline :{type: Date, required: true},
    completed :{type:Boolean, default: false},
    autoSavePercentage:{type: Number, default: 0}, //percentage of income to auto-save
});

const Goal = new mongoose.model("Goal", goalSchema);
export default Goal;