import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Button } from '../../components';
import { useFinance } from '../../hooks';
import { formatCurrency } from '../../utils/helpers';

export const ExpensesScreen = ({ navigation }) => {
  const { expenses } = useFinance();

  const handleAddExpense = () => {
    navigation.navigate('AddExpense');
  };

  const handleDeleteExpense = (id) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        // Delete logic
      }},
    ]);
  };

  const renderExpenseItem = ({ item }) => (
    <Pressable
      style={styles.expenseItem}
      onPress={() => navigation.navigate('ExpenseDetail', { item })}
    >
      <View>
        <Text style={styles.expenseCategory}>{item.category}</Text>
        <Text style={styles.expenseDate}>
          {new Date(item.createdAt?.toDate?.() || item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.expenseRight}>
        <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
        <Text 
          style={styles.deleteText}
          onPress={() => handleDeleteExpense(item.id)}
        >
          ✕
        </Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <Button
          title="+ Add"
          size="sm"
          onPress={handleAddExpense}
        />
      </View>

      {expenses.length > 0 ? (
        <FlatList
          data={expenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No expenses yet</Text>
          <Button
            title="Add your first expense"
            onPress={handleAddExpense}
          />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  expenseCategory: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  expenseDate: {
    color: Colors.textTertiary,
    fontSize: 12,
    marginTop: 4,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 14,
  },
  deleteText: {
    color: Colors.error,
    marginTop: 4,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: 16,
  },
});
