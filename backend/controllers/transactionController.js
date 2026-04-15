const Transaction = require("../models/transaction");

exports.getTransactions = async (req, res) => {
  try {
    const { type, limit = 50, startDate, endDate } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(Number(limit))
      .lean();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching transactions", error: err.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { user: req.user._id };
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }
    const income = await Transaction.aggregate([
      { $match: { ...match, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const expense = await Transaction.aggregate([
      { $match: { ...match, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalIncome = income[0]?.total ?? 0;
    const totalExpense = expense[0]?.total ?? 0;
    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching summary", error: err.message });
  }
};

exports.addTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;
    if (!type || amount == null || !category) {
      return res.status(400).json({ message: "Type, amount and category are required" });
    }
    const transaction = await Transaction.create({
      type,
      amount: Number(amount),
      category,
      description: description || "",
      date: date ? new Date(date) : new Date(),
      user: req.user._id,
    });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Error adding transaction", error: err.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ message: "Transaction not found" });
    const { amount, category, description, date } = req.body;
    if (amount != null) tx.amount = Number(amount);
    if (category) tx.category = category;
    if (description !== undefined) tx.description = description;
    if (date) tx.date = new Date(date);
    await tx.save();
    res.json(tx);
  } catch (err) {
    res.status(500).json({ message: "Error updating transaction", error: err.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ message: "Transaction not found" });
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting transaction", error: err.message });
  }
};
