const Transaction = require("../models/transaction");

function buildRuleBasedInsights({ summary, topExpenseCategories, recentExpenses }) {
  const suggestions = [];
  const observations = [];

  observations.push(
    `Income: ₹${summary.totalIncome.toLocaleString()} · Expense: ₹${summary.totalExpense.toLocaleString()} · Balance: ₹${summary.balance.toLocaleString()}`
  );

  if (summary.totalExpense > summary.totalIncome) {
    suggestions.push(
      "Your expenses are higher than income for the selected period. Consider setting a weekly cap for discretionary categories."
    );
  } else if (summary.totalIncome > 0) {
    const savingsRate = ((summary.balance / summary.totalIncome) * 100);
    observations.push(`Estimated savings rate: ${savingsRate.toFixed(1)}%`);
    if (savingsRate < 10) suggestions.push("Try to target at least 10% savings by reducing 1–2 non-essential categories.");
    if (savingsRate >= 20) suggestions.push("Great savings rate—consider moving surplus to an investment or emergency fund.");
  }

  if (topExpenseCategories.length) {
    const top = topExpenseCategories[0];
    observations.push(`Top expense category: ${top.category} (₹${top.total.toLocaleString()})`);
    suggestions.push(`Reduce "${top.category}" by 5–10% next month to improve your balance.`);
  }

  if (recentExpenses.length >= 3) {
    suggestions.push("You have multiple expenses recently—review recurring items and subscriptions if any.");
  }

  return {
    title: "Insights",
    observations,
    suggestions,
  };
}

async function buildLLMInsights({ prompt, apiKey, baseUrl, model }) {
  // OpenAI-compatible Chat Completions (works with OpenAI or compatible providers)
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are a helpful finance assistant. Provide concise, actionable insights." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI provider error (${res.status}): ${text}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content?.trim() || "";
  return content;
}

exports.getInsights = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { user: req.user._id };
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    const [incomeAgg, expenseAgg, topExpenseCategories, recentExpenses] = await Promise.all([
      Transaction.aggregate([
        { $match: { ...match, type: "income" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { ...match, type: "expense" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { ...match, type: "expense" } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, category: "$_id", total: 1 } },
      ]),
      Transaction.find({ ...match, type: "expense" }).sort({ date: -1 }).limit(10).lean(),
    ]);

    const totalIncome = incomeAgg[0]?.total ?? 0;
    const totalExpense = expenseAgg[0]?.total ?? 0;
    const summary = { totalIncome, totalExpense, balance: totalIncome - totalExpense };

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.AI_MODEL || "gpt-4o-mini";

    // If no key, return offline insights
    if (!apiKey) {
      return res.json({
        mode: "offline",
        data: buildRuleBasedInsights({ summary, topExpenseCategories, recentExpenses }),
      });
    }

    const prompt = [
      "Analyze the following user's finances and give:",
      "- 3 observations",
      "- 3 actionable suggestions",
      "- 1 warning (if any)",
      "",
      `Summary: income=${totalIncome}, expense=${totalExpense}, balance=${summary.balance}`,
      `Top expense categories: ${JSON.stringify(topExpenseCategories)}`,
      `Recent expenses (last 10): ${JSON.stringify(recentExpenses.map((e) => ({ category: e.category, amount: e.amount, description: e.description, date: e.date })) )}`,
      "",
      "Return in JSON with keys: title, observations (string[]), suggestions (string[]), warning (string|null). Keep it concise.",
    ].join("\n");

    const content = await buildLLMInsights({ prompt, apiKey, baseUrl, model });
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // If model returns non-JSON, wrap it
      parsed = {
        title: "Insights",
        observations: [content],
        suggestions: [],
        warning: null,
      };
    }

    return res.json({ mode: "llm", data: parsed });
  } catch (err) {
    return res.status(500).json({ message: "Failed to generate insights", error: err.message });
  }
};

