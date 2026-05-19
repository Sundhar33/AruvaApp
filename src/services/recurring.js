import { getAllExpenses } from './data';

// Very simple recurring detection placeholder: groups by description and finds repeated months
export async function detectRecurring() {
  const expenses = await getAllExpenses();
  const map = {};
  expenses.forEach(e => {
    const key = (e.notes || e.description || e.category || 'unknown').toLowerCase();
    map[key] = map[key] || { count: 0, examples: [] };
    map[key].count += 1;
    map[key].examples.push(e);
  });
  const recurring = Object.entries(map)
    .filter(([, v]) => v.count >= 3)
    .map(([k, v]) => ({ description: k, count: v.count, example: v.examples[0] }));
  return recurring;
}
