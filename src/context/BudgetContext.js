import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { safeAsyncStorage } from '../utils/asyncStorageHelper';

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState({});
  const [notifications, setNotifications] = useState([]);

  // Load budgets from storage
  useEffect(() => {
    if (user) {
      loadBudgets();
    }
  }, [user]);

  const loadBudgets = async () => {
    try {
      const stored = await safeAsyncStorage.getItem(`budgets_${user?.uid}`);
      if (stored) {
        setBudgets(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading budgets:', error);
    }
  };

  const setBudgetLimit = async (categoryId, limit) => {
    try {
      const updated = {
        ...budgets,
        [categoryId]: {
          limit,
          createdAt: budgets[categoryId]?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      setBudgets(updated);
      await AsyncStorage.setItem(
        `budgets_${user?.uid}`,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error('Error setting budget:', error);
    }
  };

  const removeBudget = async (categoryId) => {
    try {
      const updated = { ...budgets };
      delete updated[categoryId];
      setBudgets(updated);
      await AsyncStorage.setItem(
        `budgets_${user?.uid}`,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error('Error removing budget:', error);
    }
  };

  const getBudgetLimit = (categoryId) => {
    return budgets[categoryId]?.limit || 0;
  };

  const addNotification = (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev =>
        prev.filter(n => n.id !== id)
      );
    }, 5000);
  };

  const getBudgetStatus = (categoryId, spent) => {
    const limit = getBudgetLimit(categoryId);
    if (limit === 0) return null;
    
    const percentage = (spent / limit) * 100;
    
    if (percentage >= 100) {
      return { status: 'exceeded', percentage };
    } else if (percentage >= 80) {
      return { status: 'warning', percentage };
    } else if (percentage >= 50) {
      return { status: 'good', percentage };
    } else {
      return { status: 'safe', percentage };
    }
  };

  const value = {
    budgets,
    setBudgetLimit,
    removeBudget,
    getBudgetLimit,
    notifications,
    addNotification,
    getBudgetStatus,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within BudgetProvider');
  }
  return context;
};
