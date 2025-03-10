import mongoose from "mongoose";

//for arrays we use enum:[]

const transactionSchema = new mongoose.Schema({

    user :{type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    type : {type: String, enum : ["income", "expense"], required: true},
    amount: {type: Number, required: true},
    category: {type: String, required: true},
    tags: {type: [String]}, //Custom tags : #vacation, #rent
    date:{ type: Date, default: Date.now},
    recurring: {type:Boolean, default: false},
    recurrencePattern: {type: String, enum: ["daily","weekly","monthly","yearly"], default: null},
    lastProcessDate: {type: Date, default: null}, //Tracks last occurrence of the recurring transactions
    currency: { type: String, default: "LKR" } // ✅ Default currency set to LKR
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;