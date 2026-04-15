const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ["income", "expense"] },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
