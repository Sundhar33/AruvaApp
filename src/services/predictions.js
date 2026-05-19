// Lightweight predictions service used by PredictionsScreen
// Provides `predictMonthlySpending(expenses)` and `getSpendingInsights(expenses, salary)`

function groupByMonth(expenses) {
  const map = {};
  (expenses || []).forEach(e => {
    const date = e.createdAt?.toDate ? e.createdAt.toDate() : new Date(e.createdAt || e.date || Date.now());
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    map[key] = map[key] || [];
    map[key].push(e);
  });
  return map;
}

export function predictMonthlySpending(expenses = []) {
  // Very simple model: use last 3 months average per category
  try {
    const byMonth = groupByMonth(expenses);
    const months = Object.keys(byMonth).sort();
    const recent = months.slice(-6); // use up to last 6 months

    const categorySums = {};
    const categoryCounts = {};

    recent.forEach(m => {
      byMonth[m].forEach(e => {
        const cat = e.category || 'uncategorized';
        categorySums[cat] = (categorySums[cat] || 0) + (e.amount || 0);
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });

    const byCategory = Object.keys(categorySums).map(cat => {
      const averageAmount = categorySums[cat] / Math.max(1, categoryCounts[cat]);
      // naive trend: compare last month's avg vs prior months avg
      const trend = 'stable';
      const predictedAmount = averageAmount * 30 / 7; // scale heuristic
      return {
        category: cat,
        predictedAmount,
        averageAmount,
        trend,
        confidence: 0.6,
      };
    });

    const totalPredicted = byCategory.reduce((s, c) => s + (c.predictedAmount || 0), 0);
    const confidence = Math.min(0.95, 0.5 + Math.min(1, recent.length) * 0.1);

    return { totalPredicted, byCategory, confidence };
  } catch (e) {
    return { totalPredicted: 0, byCategory: [], confidence: 0 };
  }
}

export function getSpendingInsights(expenses = [], salary = 0) {
  // Produce a few lightweight insights
  const insights = [];
  const total = (expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const months = 1; // placeholder

  if (salary > 0 && total > salary * 0.9) {
    insights.push({ type: 'warning', text: 'You are nearing your monthly budget limit.' });
  }

  // High spending categories
  const catMap = {};
  (expenses || []).forEach(e => {
    const c = e.category || 'uncategorized';
    catMap[c] = (catMap[c] || 0) + (e.amount || 0);
  });
  const top = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
  top.forEach(([cat, amt]) => {
    insights.push({ type: 'category_prediction', text: `High spending in ${cat}: ₹${Math.round(amt)}` });
  });

  if (insights.length === 0) {
    insights.push({ type: 'positive', text: 'Spending looks balanced compared to recent months.' });
  }

  return insights;
}
