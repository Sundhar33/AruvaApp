import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInput,
  FlatList,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../constants/categories';
import { useFinance } from '../../context/FinanceContext';
import {
  advancedSearch,
  getSearchSuggestions,
  getSearchStats,
  sortExpenses,
} from '../../services/search';
import dayjs from 'dayjs';

const SearchScreen = ({ navigation }) => {
  const { expenses } = useFinance();
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filters = {
    category: selectedCategories.length > 0 ? selectedCategories : undefined,
    paymentMethod:
      selectedPaymentMethods.length > 0 ? selectedPaymentMethods : undefined,
    minAmount: minAmount ? parseFloat(minAmount) : undefined,
    maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
  };

  const searchResults = useMemo(() => {
    let results = advancedSearch(expenses, query, filters);
    return sortExpenses(results, sortBy);
  }, [expenses, query, filters, sortBy]);

  const stats = useMemo(
    () => getSearchStats(searchResults),
    [searchResults]
  );

  const suggestions = useMemo(
    () => getSearchSuggestions(expenses, query),
    [expenses, query]
  );

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const togglePaymentMethod = (methodId) => {
    setSelectedPaymentMethods(prev =>
      prev.includes(methodId)
        ? prev.filter(m => m !== methodId)
        : [...prev, methodId]
    );
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedCategories([]);
    setSelectedPaymentMethods([]);
    setMinAmount('');
    setMaxAmount('');
    setSortBy('date');
  };

  const getCategoryIcon = (categoryId) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.id === categoryId);
    return cat?.icon || '📌';
  };

  const getCategoryName = (categoryId) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.id === categoryId);
    return cat?.name || 'Unknown';
  };

  const getPaymentMethodName = (methodId) => {
    const method = PAYMENT_METHODS.find(m => m.id === methodId);
    return method?.name || methodId;
  };

  const renderExpense = ({ item }) => {
    const date = dayjs(item.createdAt?.toDate?.() || item.createdAt);
    const categoryName = getCategoryName(item.category);
    const categoryIcon = getCategoryIcon(item.category);

    return (
      <TouchableOpacity style={styles.expenseCard}>
        <View style={styles.expenseLeft}>
          <View style={styles.expenseIcon}>
            <Text style={styles.expenseIconText}>{categoryIcon}</Text>
          </View>
          <View>
            <Text style={styles.expenseName}>{item.description}</Text>
            <Text style={styles.expenseCategory}>
              {categoryName} • {date.format('DD MMM YYYY')}
            </Text>
          </View>
        </View>
        <Text style={styles.expenseAmount}>₹{Math.round(item.amount)}</Text>
      </TouchableOpacity>
    );
  };

  const isFiltering =
    query ||
    selectedCategories.length > 0 ||
    selectedPaymentMethods.length > 0 ||
    minAmount ||
    maxAmount;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔍 Search</Text>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Text style={styles.filterBtn}>⚙️ Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchInputContainer}>
        <Text style={styles.searchIcon}>🔎</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search expenses..."
          placeholderTextColor={Colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Suggestions */}
      {query && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setQuery(suggestion)}
              style={styles.suggestionItem}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Filters Section */}
        {showFilters && (
          <View style={styles.filtersSection}>
            {/* Category Filter */}
            <View style={styles.filterGroup}>
              <View style={styles.filterHeader}>
                <Text style={styles.filterTitle}>Categories</Text>
                {selectedCategories.length > 0 && (
                  <Text style={styles.filterCount}>{selectedCategories.length}</Text>
                )}
              </View>
              <View style={styles.filterOptions}>
                {EXPENSE_CATEGORIES.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.filterOption,
                      selectedCategories.includes(category.id) &&
                        styles.filterOptionActive,
                    ]}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <Text style={styles.filterOptionText}>
                      {category.icon} {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Payment Method Filter */}
            <View style={styles.filterGroup}>
              <View style={styles.filterHeader}>
                <Text style={styles.filterTitle}>Payment Method</Text>
                {selectedPaymentMethods.length > 0 && (
                  <Text style={styles.filterCount}>{selectedPaymentMethods.length}</Text>
                )}
              </View>
              <View style={styles.filterOptions}>
                {PAYMENT_METHODS.map(method => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.filterOption,
                      selectedPaymentMethods.includes(method.id) &&
                        styles.filterOptionActive,
                    ]}
                    onPress={() => togglePaymentMethod(method.id)}
                  >
                    <Text style={styles.filterOptionText}>{method.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Amount Range */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterTitle}>Amount Range</Text>
              <View style={styles.amountInputs}>
                <TextInput
                  style={styles.amountInput}
                  placeholder="Min"
                  placeholderTextColor={Colors.textTertiary}
                  value={minAmount}
                  onChangeText={setMinAmount}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.amountSeparator}>-</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="Max"
                  placeholderTextColor={Colors.textTertiary}
                  value={maxAmount}
                  onChangeText={setMaxAmount}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Sort Option */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterTitle}>Sort By</Text>
              <View style={styles.filterOptions}>
                {[
                  { id: 'date', label: 'Date (Recent)' },
                  { id: 'amount_high', label: 'Amount (High to Low)' },
                  { id: 'amount_low', label: 'Amount (Low to High)' },
                  { id: 'category', label: 'Category' },
                ].map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.filterOption,
                      sortBy === option.id && styles.filterOptionActive,
                    ]}
                    onPress={() => setSortBy(option.id)}
                  >
                    <Text style={styles.filterOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Clear Filters Button */}
            {isFiltering && (
              <TouchableOpacity
                style={styles.clearFiltersBtn}
                onPress={clearFilters}
              >
                <Text style={styles.clearFiltersBtnText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Results Stats */}
        {searchResults.length > 0 && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Results: {stats.count} expenses</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total</Text>
                <Text style={styles.statValue}>₹{stats.total}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Average</Text>
                <Text style={styles.statValue}>₹{stats.average}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Range</Text>
                <Text style={styles.statValue}>
                  ₹{stats.lowest} - ₹{stats.highest}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Expense List */}
        {searchResults.length > 0 ? (
          <View style={styles.resultsContainer}>
            <FlatList
              scrollEnabled={false}
              data={searchResults}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderExpense}
              contentContainerStyle={{ gap: 8 }}
            />
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔎</Text>
            <Text style={styles.emptyTitle}>No expenses found</Text>
            <Text style={styles.emptyText}>
              {query
                ? 'Try a different search term or adjust your filters'
                : 'Start by entering a search term'}
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  filterBtn: {
    fontSize: 16,
    color: Colors.glowAccent,
    fontWeight: '600',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
  },
  clearIcon: {
    fontSize: 16,
    color: Colors.textTertiary,
  },
  suggestionsContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  suggestionText: {
    color: Colors.text,
    fontSize: 13,
  },
  filtersSection: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderTopWidth: 2,
    borderTopColor: Colors.glowAccent,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  filterCount: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 184, 148, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.border,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: 12,
    color: (props) => (props.active ? Colors.background : Colors.text),
    fontWeight: '600',
  },
  amountInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amountInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: Colors.text,
    fontSize: 12,
  },
  amountSeparator: {
    color: Colors.textTertiary,
    fontSize: 12,
  },
  clearFiltersBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  clearFiltersBtnText: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 12,
  },
  statsCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.glowAccent,
  },
  statsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.glowAccent,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  resultsContainer: {
    paddingHorizontal: 16,
  },
  expenseCard: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary,
  },
  expenseLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseIconText: {
    fontSize: 18,
  },
  expenseName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  expenseCategory: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 40,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default SearchScreen;
