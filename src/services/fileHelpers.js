import { safeAsyncStorage } from '../utils/asyncStorageHelper';

export async function writeFileAsync(path, content) {
  // store content under a synthetic key so we can retrieve it later
  const key = `file:${path}`;
  await safeAsyncStorage.setItem(key, content);
  return path;
}

export async function readFileAsync(path) {
  const key = `file:${path}`;
  const content = await safeAsyncStorage.getItem(key);
  if (content == null) throw new Error('File not found');
  return content;
}
