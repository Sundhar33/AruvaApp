import dayjs from 'dayjs';

/**
 * Smart Notification Service
 * Generates intelligent notifications based on spending patterns
 */

export const NotificationType = {
  BUDGET_WARNING: 'budget_warning',
  BUDGET_EXCEEDED: 'budget_exceeded',
  UNUSUAL_SPENDING: 'unusual_spending',
  SAVINGS_ALERT: 'savings_alert',
  DEAL_ALERT: 'deal_alert',
  RECURRING_DETECTED: 'recurring_detected',
};

/**
 * Generate budget alert notification
 */
export const generateBudgetAlert = (categoryName, spent, limit, percentage) => {
  if (percentage >= 100) {
    return {
      type: NotificationType.BUDGET_EXCEEDED,
      priority: 'high',
      title: '💸 Budget Exceeded!',
      message: `${categoryName} budget of ₹${limit} has been exceeded by ₹${Math.round(spent - limit)}`,
      category: categoryName.toLowerCase(),
      timestamp: new Date().toISOString(),
    };
  } else if (percentage >= 80) {
    return {
      type: NotificationType.BUDGET_WARNING,
      priority: 'medium',
      title: '⚠️ Budget Warning',
      message: `${categoryName} is at ${Math.round(percentage)}% of your ₹${limit} budget. Spent: ₹${Math.round(spent)}`,
      category: categoryName.toLowerCase(),
      timestamp: new Date().toISOString(),
    };
  }
  return null;
};

/**
 * Detect unusual spending patterns
 */
export const detectUnusualSpending = (currentExpenses, historicalExpenses = []) => {
  if (historicalExpenses.length === 0) return null;
  
  const currentMonth = currentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const avgSpending =
    historicalExpenses.reduce((sum, exp) => sum + exp.amount, 0) /
    historicalExpenses.length;
  
  const percentageChange = ((currentMonth - avgSpending) / avgSpending) * 100;
  
  if (percentageChange > 50) {
    return {
      type: NotificationType.UNUSUAL_SPENDING,
      priority: 'medium',
      title: '📊 Unusual Spending Detected',
      message: `Your spending jumped ${Math.round(percentageChange)}% above average. Current: ₹${Math.round(currentMonth)} vs Average: ₹${Math.round(avgSpending)}`,
      timestamp: new Date().toISOString(),
    };
  }
  return null;
};

/**
 * Generate savings celebration alert
 */
export const generateSavingsAlert = (savingsRate, targetRate = 30) => {
  if (savingsRate >= targetRate) {
    return {
      type: NotificationType.SAVINGS_ALERT,
      priority: 'low',
      title: '🎉 Great Savings!',
      message: `You've saved ${Math.round(savingsRate)}% this month. Keep it up!`,
      timestamp: new Date().toISOString(),
    };
  } else if (savingsRate >= targetRate - 10) {
    return {
      type: NotificationType.SAVINGS_ALERT,
      priority: 'low',
      title: '💰 You\'re Close!',
      message: `Just ${Math.round(targetRate - savingsRate)}% more to reach your savings goal.`,
      timestamp: new Date().toISOString(),
    };
  }
  return null;
};

/**
 * Detect potential recurring expenses
 */
export const detectRecurringExpenses = (expenses) => {
  const groupedByCategory = {};
  
  expenses.forEach(exp => {
    if (!groupedByCategory[exp.category]) {
      groupedByCategory[exp.category] = [];
    }
    groupedByCategory[exp.category].push(exp);
  });

  const recurring = [];

  Object.entries(groupedByCategory).forEach(([category, exps]) => {
    exps.sort((a, b) => 
      new Date(a.createdAt?.toDate?.() || a.createdAt) - 
      new Date(b.createdAt?.toDate?.() || b.createdAt)
    );

    // Look for similar amounts with regular intervals
    for (let i = 0; i < exps.length - 2; i++) {
      const exp1 = exps[i];
      const exp2 = exps[i + 1];
      const exp3 = exps[i + 2];

      const date1 = dayjs(exp1.createdAt?.toDate?.() || exp1.createdAt);
      const date2 = dayjs(exp2.createdAt?.toDate?.() || exp2.createdAt);
      const date3 = dayjs(exp3.createdAt?.toDate?.() || exp3.createdAt);

      const daysInterval1 = date2.diff(date1, 'day');
      const daysInterval2 = date3.diff(date2, 'day');

      const amountMatch =
        Math.abs(exp1.amount - exp2.amount) < exp1.amount * 0.1 &&
        Math.abs(exp2.amount - exp3.amount) < exp2.amount * 0.1;

      const intervalMatch = Math.abs(daysInterval1 - daysInterval2) <= 3;

      if (amountMatch && intervalMatch && daysInterval1 > 0) {
        recurring.push({
          category,
          description: exp1.description,
          amount: Math.round(exp1.amount),
          interval: Math.round((daysInterval1 + daysInterval2) / 2),
          intervalType: daysInterval1 <= 1 ? 'daily' : daysInterval1 <= 7 ? 'weekly' : 'monthly',
          confidence: 0.8,
        });
        break; // Found recurring for this category
      }
    }
  });

  return recurring.length > 0 ? recurring : null;
};

/**
 * Generate notification for detected recurring
 */
export const generateRecurringAlert = (recurring) => {
  if (!recurring || recurring.length === 0) return null;

  const first = recurring[0];
  return {
    type: NotificationType.RECURRING_DETECTED,
    priority: 'medium',
    title: '🔄 Recurring Expense Detected',
    message: `We detected a ${first.intervalType} ${first.description} of ₹${first.amount}. Looks like a recurring expense!`,
    data: recurring,
    timestamp: new Date().toISOString(),
  };
};
