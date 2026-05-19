import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  Pressable,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { SummaryCard, Button } from '../../components';
import { useFinance, useAuth } from '../../hooks';
import { formatCurrency } from '../../utils/helpers';

export const DashboardScreen = ({ navigation }) => {
  const { salary, expenses, emis, goals, getCurrentMonthExpenses, getRemainingBalance, getSavingsRate, getEMIRatio } = useFinance();
  const { user } = useAuth();

  const currentMonthExpenses = getCurrentMonthExpenses();
  const totalMonthExpenses = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBalance = getRemainingBalance();
  const savingsRate = getSavingsRate();
  const emiRatio = getEMIRatio();
  const totalEMI = emis.reduce((sum, emi) => sum + emi.amount, 0);

  // Recent transactions (last 5)
  const recentTransactions = currentMonthExpenses.slice(0, 5);

  const renderTransactionItem = ({ item }) => (
    <Pressable
      style={styles.transactionItem}
      onPress={() => navigation.navigate('ExpenseDetail', { item })}
    >
      <View style={styles.transactionLeft}>
        <Text style={styles.transactionCategory}>
          {EXPENSE_CATEGORIES.find(c => c.id === item.category)?.icon}
        </Text>
        <View>
          <Text style={styles.transactionName}>{item.category}</Text>
          <Text style={styles.transactionDate}>
            {new Date(item.createdAt?.toDate?.() || item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Text style={styles.transactionAmount}>-₹{item.amount}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello {user?.email?.split('@')[0]}</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <SummaryCard
            title="Balance"
            value={formatCurrency(remainingBalance)}
            icon="💰"
            color={Colors.success}
          />
          <SummaryCard
            title="Spent This Month"
            value={formatCurrency(totalMonthExpenses)}
            icon="📊"
            color={Colors.warning}
          />
          <SummaryCard
            title="Savings"
            value={`${savingsRate.toFixed(1)}%`}
            subtitle="of salary"
            icon="🎯"
            color={Colors.info}
          />
          <SummaryCard
            title="EMI Due"
            value={formatCurrency(totalEMI)}
            icon="📅"
            color={Colors.error}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            title="+ Expense"
            size="sm"
            onPress={() => navigation.navigate('AddExpense')}
            style={styles.actionButton}
          />
          <Button
            title="+ EMI"
            size="sm"
            variant="secondary"
            onPress={() => navigation.navigate('AddEMI')}
            style={styles.actionButton}
          />
          <Button
            title="+ Goal"
            size="sm"
            variant="outline"
            onPress={() => navigation.navigate('AddGoal')}
            style={styles.actionButton}
          />
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Text
              style={styles.seeAll}
              onPress={() => navigation.navigate('ExpenseHistory')}
            >
              See all
            </Text>
          </View>
          {recentTransactions.length > 0 ? (
            <FlatList
              data={recentTransactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noData}>No expenses yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food', icon: '🍔' },
  { id: 'travel', name: 'Travel', icon: '🚗' },
  { id: 'rent', name: 'Rent', icon: '🏠' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  { id: 'bills', name: 'Bills', icon: '📄' },
  { id: 'others', name: 'Others', icon: '📌' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  summaryGrid: {
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  seeAll: {
    color: Colors.primary,
    fontWeight: '500',
  },
  transactionItem: {
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
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionCategory: {
    fontSize: 24,
    marginRight: 12,
  },
  transactionName: {
    color: Colors.text,
    fontWeight: '500',
    fontSize: 14,
  },
  transactionDate: {
    color: Colors.textTertiary,
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 14,
  },
  noData: {
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
