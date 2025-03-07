import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    user : {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    type: {type: String, enum:["income-expense","category-expense","savings","budget"], required: true},
    startDate: {type: Date, required: false},
    endDate: {type: Date, required: false},
    data: {type: mongoose.Schema.Types.Mixed, required: true}, //Dynamic report data - that's why we are saving it like this 
    createdAt:{type:Date, default: Date.now}
});

const Report = mongoose.model("Report", reportSchema);
export default Report;