import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import * as FirestoreService from '../firebase/firestore';
import dayjs from 'dayjs';
import { safeAsyncStorage } from '../utils/asyncStorageHelper';

export const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  const [salary, _setSalary] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [emis, setEmis] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monthlyBudget, _setMonthlyBudget] = useState(0);

  // Load financial data when user changes
  useEffect(() => {
    if (user) {
      loadFinancialData();
    }
  }, [user]);

  const loadFinancialData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [expensesData, emisData, goalsData] = await Promise.all([
        FirestoreService.getExpenses(user.uid),
        FirestoreService.getEMIs(user.uid),
        FirestoreService.getGoals(user.uid),
      ]);
      
      setExpenses(expensesData);
      setEmis(emisData);
      setGoals(goalsData);
      // Load persisted salary/monthlyBudget from AsyncStorage if present
      try {
        const storedSalary = await safeAsyncStorage.getItem('salary');
        const storedBudget = await safeAsyncStorage.getItem('monthlyBudget');
        if (storedSalary != null) _setSalary(parseFloat(storedSalary));
        if (storedBudget != null) _setMonthlyBudget(parseFloat(storedBudget));
      } catch (err) {
        console.warn('Failed to load persisted salary/budget:', err?.message || err);
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate current month's expenses
  const getCurrentMonthExpenses = () => {
    const now = dayjs();
    return expenses.filter(exp => 
      dayjs(exp.createdAt?.toDate?.() || exp.createdAt).isSame(now, 'month')
    );
  };

  // Calculate remaining balance
  const getRemainingBalance = () => {
    const monthExpenses = getCurrentMonthExpenses().reduce((sum, exp) => sum + exp.amount, 0);
    const totalEMI = emis.reduce((sum, emi) => sum + emi.amount, 0);
    return salary - (monthExpenses + totalEMI);
  };

  // Calculate savings rate
  const getSavingsRate = () => {
    if (salary === 0) return 0;
    const remaining = getRemainingBalance();
    return (remaining / salary) * 100;
  };

  // Calculate EMI ratio
  const getEMIRatio = () => {
    if (salary === 0) return 0;
    const totalEMI = emis.reduce((sum, emi) => sum + emi.amount, 0);
    return (totalEMI / salary) * 100;
  };

  // Add expense
  const addExpense = async (expenseData) => {
    if (!user) return;
    try {
      const id = await FirestoreService.addExpense(user.uid, expenseData);
      setExpenses([{ id, ...expenseData }, ...expenses]);
      return id;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  // Add EMI
  const addEMI = async (emiData) => {
    if (!user) return;
    try {
      const id = await FirestoreService.addEMI(user.uid, emiData);
      setEmis([{ id, ...emiData }, ...emis]);
      return id;
    } catch (error) {
      console.error('Error adding EMI:', error);
      throw error;
    }
  };

  // Add goal
  const addGoal = async (goalData) => {
    if (!user) return;
    try {
      const id = await FirestoreService.addGoal(user.uid, goalData);
      setGoals([{ id, ...goalData }, ...goals]);
      return id;
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  };
  
  // Delete expense
  const deleteExpense = async (expenseId) => {
    if (!user) return;
    try {
      await FirestoreService.deleteExpense(user.uid, expenseId);
      setExpenses(expenses.filter(exp => exp.id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  // Persisted setters for salary and monthlyBudget
  const setSalary = async (value) => {
    _setSalary(value);
    try {
      await safeAsyncStorage.setItem('salary', String(value));
    } catch (err) {
      console.warn('Failed to persist salary:', err?.message || err);
    }
  };

  const setMonthlyBudget = async (value) => {
    _setMonthlyBudget(value);
    try {
      await safeAsyncStorage.setItem('monthlyBudget', String(value));
    } catch (err) {
      console.warn('Failed to persist monthlyBudget:', err?.message || err);
    }
  };

  const value = {
    salary,
    setSalary,
    expenses,
    emis,
    goals,
    loading,
    monthlyBudget,
    setMonthlyBudget,
    getCurrentMonthExpenses,
    getRemainingBalance,
    getSavingsRate,
    getEMIRatio,
    addExpense,
    addEMI,
    addGoal,
    loadFinancialData,
    deleteExpense,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
