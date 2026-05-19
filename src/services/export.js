import { writeFileAsync } from './fileHelpers';
import { getAllExpenses } from './data';

// Simple CSV exporter placeholder. Returns path string.
export async function exportExpensesCSV() {
  const expenses = await getAllExpenses();
  const header = ['id,date,category,amount,notes'];
  const rows = expenses.map(e => `${e.id},"${e.createdAt || ''}","${e.category || ''}",${e.amount || 0},"${(e.notes||'').replace(/"/g,'""')}"`);
  const csv = header.concat(rows).join('\n');
  const path = await writeFileAsync('exports/expenses.csv', csv);
  return path;
}
