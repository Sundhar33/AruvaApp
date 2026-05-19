import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { useFinance } from '../../context/FinanceContext';
import { useBudget } from '../../context/BudgetContext';
import { getExpensesByCategory } from '../../services/analytics';

const BudgetingScreen = ({ navigation }) => {
  const { expenses, salary } = useFinance();
  const { budgets, setBudgetLimit, removeBudget, getBudgetStatus } = useBudget();
  const [editingCategory, setEditingCategory] = useState(null);
  const [newBudget, setNewBudget] = useState('');

  const categoryExpenses = getExpensesByCategory(expenses);

  const handleSetBudget = async (categoryId) => {
    if (!newBudget || isNaN(newBudget) || parseFloat(newBudget) <= 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    await setBudgetLimit(categoryId, parseFloat(newBudget));
    setNewBudget('');
    setEditingCategory(null);
    Alert.alert('Success', 'Budget limit set successfully');
  };

  const handleRemoveBudget = async (categoryId) => {
    Alert.alert(
      'Remove Budget',
      'Are you sure you want to remove this budget limit?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Remove',
          onPress: async () => {
            await removeBudget(categoryId);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderBudgetCard = ({ item: category }) => {
    const spent = categoryExpenses[category.id] || 0;
    const limit = budgets[category.id]?.limit || 0;
    const status = limit > 0 ? getBudgetStatus(category.id, spent) : null;

    const getProgressColor = () => {
      if (!status) return Colors.textSecondary;
      if (status.status === 'exceeded') return Colors.error;
      if (status.status === 'warning') return Colors.warning;
      return Colors.success;
    };

    const getStatusEmoji = () => {
      if (!status) return '📋';
      if (status.status === 'exceeded') return '🚨';
      if (status.status === 'warning') return '⚠️';
      if (status.status === 'good') return '✅';
      return '🎯';
    };

    return (
      <View style={styles.budgetCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.categoryName}>
              {getStatusEmoji()} {category.name}
            </Text>
            <Text style={styles.spent}>Spent: ₹{Math.round(spent)}</Text>
          </View>
          {limit > 0 && (
            <TouchableOpacity
              onPress={() => handleRemoveBudget(category.id)}
              style={styles.removeBtn}
            >
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {limit > 0 ? (
          <View>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(status?.percentage || 0, 100)}%`,
                    backgroundColor: getProgressColor(),
                  },
                ]}
              />
            </View>
            <View style={styles.budgetInfo}>
              <Text style={styles.budgetText}>
                ₹{Math.round(spent)} / ₹{Math.round(limit)}
              </Text>
              <Text style={[styles.percentage, { color: getProgressColor() }]}>
                {Math.round(status?.percentage || 0)}%
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.editContainer,
              editingCategory === category.id && styles.activeEdit,
            ]}
          >
            {editingCategory === category.id ? (
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Budget Amount"
                  placeholderTextColor={Colors.textTertiary}
                  value={newBudget}
                  onChangeText={setNewBudget}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity
                  style={styles.setBtn}
                  onPress={() => handleSetBudget(category.id)}
                >
                  <Text style={styles.setBtnText}>Set</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setEditingCategory(null);
                    setNewBudget('');
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addBudgetBtn}
                onPress={() => setEditingCategory(category.id)}
              >
                <Text style={styles.addBudgetText}>+ Add Budget</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {limit > 0 && spent > limit && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              💸 Budget exceeded by ₹{Math.round(spent - limit)}
            </Text>
          </View>
        )}
        {limit > 0 && spent > limit * 0.8 && spent <= limit && (
          <View style={styles.cautionBox}>
            <Text style={styles.cautionText}>
              ⚠️ You've used {Math.round((spent / limit) * 100)}% of your budget
            </Text>
          </View>
        )}
      </View>
    );
  };

  const totalBudgetedAmount = Object.values(budgets).reduce(
    (sum, b) => sum + (b.limit || 0),
    0
  );
  const totalSpent = Object.values(categoryExpenses).reduce((a, b) => a + b, 0);
  const budgetHealth =
    totalBudgetedAmount > 0 ? (totalSpent / totalBudgetedAmount) * 100 : 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>💰 Smart Budgeting</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Summary Card */}
        {totalBudgetedAmount > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Budget Overview</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Budget</Text>
                <Text style={styles.summaryValue}>₹{Math.round(totalBudgetedAmount)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Spent</Text>
                <Text style={[styles.summaryValue, { color: Colors.error }]}>
                  ₹{Math.round(totalSpent)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Remaining</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: totalSpent <= totalBudgetedAmount ? Colors.success : Colors.error },
                  ]}
                >
                  ₹{Math.round(Math.max(0, totalBudgetedAmount - totalSpent))}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.healthProgressContainer,
                { marginTop: 12 },
              ]}
            >
              <View
                style={[
                  styles.healthProgressBar,
                  {
                    width: `${Math.min(budgetHealth, 100)}%`,
                    backgroundColor:
                      budgetHealth <= 80 ? Colors.success : Colors.warning,
                  },
                ]}
              />
            </View>
            <Text style={styles.healthText}>
              {Math.round(budgetHealth)}% of total budget used
            </Text>
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Budgeting Tips</Text>
          <Text style={styles.infoText}>
            • Set realistic limits for each category based on your income
          </Text>
          <Text style={styles.infoText}>
            • Get alerts when you reach 80% of a budget limit
          </Text>
          <Text style={styles.infoText}>
            • Review and adjust budgets monthly for better results
          </Text>
        </View>

        {/* Budget Cards */}
        <FlatList
          scrollEnabled={false}
          data={EXPENSE_CATEGORIES}
          keyExtractor={item => item.id}
          renderItem={renderBudgetCard}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
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
    paddingTop: 16,
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
  summaryCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.glowAccent,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  healthProgressContainer: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  healthProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  healthText: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(76, 255, 224, 0.1)',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.glowAccent,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.glowAccent,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    lineHeight: 16,
  },
  budgetCard: {
    backgroundColor: Colors.card,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  spent: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '700',
  },
  progressContainer: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  percentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  warningBox: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 6,
  },
  warningText: {
    fontSize: 11,
    color: Colors.error,
    fontWeight: '600',
  },
  cautionBox: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 6,
  },
  cautionText: {
    fontSize: 11,
    color: Colors.warning,
    fontWeight: '600',
  },
  editContainer: {
    marginTop: 8,
  },
  activeEdit: {
    backgroundColor: 'rgba(0, 184, 148, 0.05)',
    paddingVertical: 8,
    borderRadius: 6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: Colors.text,
    fontSize: 13,
  },
  setBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
  },
  setBtnText: {
    color: Colors.background,
    fontWeight: '700',
    fontSize: 13,
  },
  cancelBtn: {
    backgroundColor: Colors.border,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  addBudgetBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  addBudgetText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
});

export default BudgetingScreen;
