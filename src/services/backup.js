import { writeFileAsync, readFileAsync } from './fileHelpers';
import { getAllExpenses, replaceAllExpenses } from './data';

export async function createBackup() {
  const expenses = await getAllExpenses();
  const payload = { createdAt: new Date().toISOString(), expenses };
  const path = await writeFileAsync('backups/backup.json', JSON.stringify(payload, null, 2));
  return path;
}

export async function restoreBackup() {
  // placeholder: reads latest backup and replaces local data
  const raw = await readFileAsync('backups/backup.json');
  const payload = JSON.parse(raw);
  if (!payload?.expenses) throw new Error('No backup found');
  await replaceAllExpenses(payload.expenses);
  return true;
}
