import dayjs from 'dayjs';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date, format = 'DD MMM YYYY') => {
  return dayjs(date?.toDate?.() || date).format(format);
};

export const getMonthExpenses = (expenses) => {
  const now = dayjs();
  return expenses.filter(exp => 
    dayjs(exp.createdAt?.toDate?.() || exp.createdAt).isSame(now, 'month')
  );
};

export const getCategoryExpenses = (expenses, category) => {
  return expenses.filter(exp => exp.category === category);
};

export const getTotalExpenses = (expenses) => {
  return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
};

export const getExpensesByDate = (expenses) => {
  const grouped = {};
  expenses.forEach(exp => {
    const date = formatDate(exp.createdAt?.toDate?.() || exp.createdAt, 'DD MMM');
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(exp);
  });
  return grouped;
};

export const getWeeklyExpenses = (expenses) => {
  const weekly = {};
  const now = dayjs();
  
  for (let i = 0; i < 7; i++) {
    const date = now.subtract(i, 'day');
    const dateStr = date.format('ddd');
    const dayExpenses = expenses.filter(exp =>
      dayjs(exp.createdAt?.toDate?.() || exp.createdAt).isSame(date, 'day')
    );
    weekly[dateStr] = getTotalExpenses(dayExpenses);
  }
  
  return weekly;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};
