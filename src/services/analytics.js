import dayjs from 'dayjs';
import { EXPENSE_CATEGORIES } from '../constants/categories';

/**
 * Get total expenses for current month
 */
export const getMonthlyExpensesTotal = (expenses) => {
  const now = dayjs();
  return expenses
    .filter(exp => dayjs(exp.createdAt?.toDate?.() || exp.createdAt).isSame(now, 'month'))
    .reduce((sum, exp) => sum + (exp.amount || 0), 0);
};

/**
 * Get expenses grouped by category
 */
export const getExpensesByCategory = (expenses) => {
  const grouped = {};
  EXPENSE_CATEGORIES.forEach(category => {
    grouped[category.id] = expenses
      .filter(exp => exp.category === category.id)
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);
  });
  return grouped;
};

/**
 * Get weekly expense data for chart
 */
export const getWeeklyExpensesForChart = (expenses) => {
  const now = dayjs();
  const weeklyData = {};
  const labels = [];

  for (let i = 6; i >= 0; i--) {
    const date = now.subtract(i, 'day');
    const dateStr = date.format('ddd');
    labels.push(dateStr);

    const dayTotal = expenses
      .filter(exp =>
        dayjs(exp.createdAt?.toDate?.() || exp.createdAt).isSame(date, 'day')
      )
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);

    weeklyData[dateStr] = dayTotal;
  }

  return {
    labels,
    data: labels.map(label => weeklyData[label]),
  };
};

/**
 * Calculate financial health score
 */
export const calculateFinancialHealth = (
  salary,
  totalExpenses,
  totalEMI,
  goalCompletion = 0
) => {
  if (salary === 0) return 0;

  const savingsRate = Math.max(0, ((salary - totalExpenses - totalEMI) / salary) * 100);
  const expenseRatio = (totalExpenses / salary) * 100;
  const emiRatio = (totalEMI / salary) * 100;

  // Score: 0-100
  let score = 50; // Base score

  // Add points for savings
  score += Math.min(savingsRate / 2, 25); // Max 25 points

  // Deduct points for high expenses
  score -= Math.min(expenseRatio / 10, 15); // Max -15 points

  // Deduct points for high EMI
  score -= Math.min(emiRatio / 10, 10); // Max -10 points

  // Add points for goal completion
  score += Math.min(goalCompletion, 10); // Max 10 points

  return Math.max(0, Math.min(100, score));
};

/**
 * Get health score category
 */
export const getHealthScoreCategory = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  return 'Poor';
};

/**
 * Get expense insights
 */
export const getExpenseInsights = (expenses, previousExpenses = []) => {
  const insights = [];

  // Category with highest spending
  const byCategory = getExpensesByCategory(expenses);
  const highestCategory = Object.entries(byCategory).reduce((a, b) =>
    a[1] > b[1] ? a : b
  );
  
  if (highestCategory[1] > 0) {
    insights.push({
      icon: '📊',
      text: `${highestCategory[0]} is your highest expense category`,
    });
  }

  // Month-on-month comparison
  const currentTotal = getMonthlyExpensesTotal(expenses);
  const previousTotal = getMonthlyExpensesTotal(previousExpenses);

  if (currentTotal > previousTotal && previousTotal > 0) {
    const increase = ((currentTotal - previousTotal) / previousTotal * 100).toFixed(1);
    insights.push({
      icon: '⬆️',
      text: `Spending increased by ${increase}% from last month`,
    });
  } else if (currentTotal < previousTotal && previousTotal > 0) {
    const decrease = ((previousTotal - currentTotal) / previousTotal * 100).toFixed(1);
    insights.push({
      icon: '⬇️',
      text: `Great job! Spending decreased by ${decrease}%`,
    });
  }

  return insights;
};
