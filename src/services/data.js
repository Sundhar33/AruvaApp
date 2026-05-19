import { safeAsyncStorage } from '../utils/asyncStorageHelper';

const EXPENSES_KEY = 'app:expenses';

export async function getAllExpenses() {
  const raw = await safeAsyncStorage.getItem(EXPENSES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export async function replaceAllExpenses(expenses) {
  await safeAsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses || []));
  return true;
}

export async function saveExpense(exp) {
  const all = await getAllExpenses();
  all.push(exp);
  await replaceAllExpenses(all);
  return exp;
}
