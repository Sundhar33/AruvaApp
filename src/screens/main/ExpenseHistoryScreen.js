import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useFinance } from '../../hooks';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { EXPENSE_CATEGORIES } from '../../constants/categories';

export const ExpenseHistoryScreen = ({ navigation, route }) => {
  const { expenses, deleteExpense } = useFinance();
  const [filter, setFilter] = useState('all');
  const [filteredExpenses, setFilteredExpenses] = useState(expenses);

  React.useEffect(() => {
    if (filter === 'all') {
      setFilteredExpenses(expenses);
    } else {
      setFilteredExpenses(expenses.filter(exp => exp.category === filter));
    }
  }, [filter, expenses]);

  const handleDeleteExpense = (id) => {
    Alert.alert('Delete', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExpense(id);
            Alert.alert('Success', 'Expense deleted');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete expense');
          }
        },
      },
    ]);
  };

  const renderExpenseItem = ({ item }) => {
    const category = EXPENSE_CATEGORIES.find(c => c.id === item.category);
    const categoryIcon = category?.icon;
    const categoryName = category?.name || item.category;
    return (
      <Pressable
        style={styles.expenseItem}
        onPress={() => navigation.navigate('ExpenseDetail', { item })}
      >
        <View style={styles.expenseLeft}>
          <Text style={styles.expenseIcon}>{categoryIcon}</Text>
          <View>
            <Text style={styles.expenseCategory}>{categoryName}</Text>
            <Text style={styles.expenseDate}>
              {formatDate(item.createdAt?.toDate?.() || item.createdAt)}
            </Text>
            {item.note && (
              <Text style={styles.expenseNote}>{item.note}</Text>
            )}
          </View>
        </View>
        <View style={styles.expenseRight}>
          <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
          <Text
            style={styles.deleteButton}
            onPress={() => handleDeleteExpense(item.id)}
          >
            ✕
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Expense History</Text>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <Pressable
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[styles.filterText, filter === 'all' && styles.filterTextActive]}
          >
            All
          </Text>
        </Pressable>
        {EXPENSE_CATEGORIES.map(cat => (
          <Pressable
            key={cat.id}
            style={[
              styles.filterChip,
              filter === cat.id && styles.filterChipActive,
            ]}
            onPress={() => setFilter(cat.id)}
          >
            <Text
              style={[
                styles.filterText,
                filter === cat.id && styles.filterTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Expenses List */}
      {filteredExpenses.length > 0 ? (
        <FlatList
          data={filteredExpenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No expenses found</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterChip: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.text,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  expenseIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  expenseCategory: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  expenseDate: {
    color: Colors.textTertiary,
    fontSize: 12,
    marginTop: 2,
  },
  expenseNote: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
    maxWidth: 150,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    color: Colors.error,
    marginTop: 4,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
