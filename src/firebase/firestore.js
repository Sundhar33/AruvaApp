import { db } from './config';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

// User Profile
export const createUserProfile = async (uid, profileData) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      profile: profileData,
      createdAt: new Date(),
    });
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data().profile : null;
  } catch (error) {
    throw error;
  }
};

// Expenses
export const addExpense = async (uid, expenseData) => {
  try {
    const expensesRef = collection(db, 'users', uid, 'expenses');
    const docRef = await addDoc(expensesRef, {
      ...expenseData,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getExpenses = async (uid) => {
  try {
    const expensesRef = collection(db, 'users', uid, 'expenses');
    const q = query(expensesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

export const updateExpense = async (uid, expenseId, updatedData) => {
  try {
    const expenseRef = doc(db, 'users', uid, 'expenses', expenseId);
    await updateDoc(expenseRef, updatedData);
  } catch (error) {
    throw error;
  }
};

export const deleteExpense = async (uid, expenseId) => {
  try {
    const expenseRef = doc(db, 'users', uid, 'expenses', expenseId);
    await deleteDoc(expenseRef);
  } catch (error) {
    throw error;
  }
};

// EMI
export const addEMI = async (uid, emiData) => {
  try {
    const emiRef = collection(db, 'users', uid, 'emi');
    const docRef = await addDoc(emiRef, {
      ...emiData,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getEMIs = async (uid) => {
  try {
    const emiRef = collection(db, 'users', uid, 'emi');
    const q = query(emiRef, orderBy('dueDate', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

// Goals
export const addGoal = async (uid, goalData) => {
  try {
    const goalsRef = collection(db, 'users', uid, 'goals');
    const docRef = await addDoc(goalsRef, {
      ...goalData,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getGoals = async (uid) => {
  try {
    const goalsRef = collection(db, 'users', uid, 'goals');
    const querySnapshot = await getDocs(goalsRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

export const updateGoal = async (uid, goalId, updatedData) => {
  try {
    const goalRef = doc(db, 'users', uid, 'goals', goalId);
    await updateDoc(goalRef, updatedData);
  } catch (error) {
    throw error;
  }
};
