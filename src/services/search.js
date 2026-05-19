// Search utilities for the SearchScreen

export function advancedSearch(expenses = [], query = '', filters = {}) {
  const q = (query || '').toLowerCase().trim();
  return (expenses || []).filter(exp => {
    // Text match
    const textFields = [exp.description, exp.notes, exp.category, exp.paymentMethod]
      .filter(Boolean)
      .join(' ') .toLowerCase();
    if (q && !textFields.includes(q) && !(String(exp.amount || '').includes(q))) return false;

    // Category filter
    if (filters?.category && Array.isArray(filters.category)) {
      if (!filters.category.includes(exp.category)) return false;
    }

    // Payment method filter
    if (filters?.paymentMethod && Array.isArray(filters.paymentMethod)) {
      if (!filters.paymentMethod.includes(exp.paymentMethod)) return false;
    }

    // Amount range
    if (typeof filters?.minAmount === 'number' && (exp.amount || 0) < filters.minAmount) return false;
    if (typeof filters?.maxAmount === 'number' && (exp.amount || 0) > filters.maxAmount) return false;

    return true;
  });
}

export function getSearchSuggestions(expenses = [], query = '') {
  const q = (query || '').toLowerCase().trim();
  if (!q) return [];
  const suggestions = new Set();
  (expenses || []).forEach(exp => {
    if (exp.description && exp.description.toLowerCase().includes(q)) suggestions.add(exp.description);
    if (exp.notes && exp.notes.toLowerCase().includes(q)) suggestions.add(exp.notes);
    if (exp.category && exp.category.toLowerCase().includes(q)) suggestions.add(exp.category);
  });
  return Array.from(suggestions).slice(0, 6);
}

export function getSearchStats(results = []) {
  const count = results.length;
  const total = results.reduce((s, r) => s + (r.amount || 0), 0);
  const average = count ? Math.round(total / count) : 0;
  const amounts = results.map(r => r.amount || 0);
  const lowest = amounts.length ? Math.min(...amounts) : 0;
  const highest = amounts.length ? Math.max(...amounts) : 0;
  return { count, total, average, lowest, highest };
}

export function sortExpenses(results = [], sortBy = 'date') {
  const copy = [...(results || [])];
  if (sortBy === 'amount_high') {
    return copy.sort((a,b) => (b.amount||0) - (a.amount||0));
  }
  if (sortBy === 'amount_low') {
    return copy.sort((a,b) => (a.amount||0) - (b.amount||0));
  }
  if (sortBy === 'category') {
    return copy.sort((a,b) => String(a.category||'').localeCompare(String(b.category||'')));
  }
  // default: date descending
  return copy.sort((a,b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
}
