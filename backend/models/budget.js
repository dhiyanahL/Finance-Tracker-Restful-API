import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
    user :{type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    category :{type: String, required: true},
    limit :{type: Number, required: true},
    month:{type:String}, //2025-03
    used :{type: Number, default : 0},
    notifications :{type: Boolean, default:true} //Notify when budget has exceeded
});

const Budget = mongoose.model("Budget", budgetSchema);
export default Budget;