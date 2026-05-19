import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart, LineChart, BarChart, ContributionGraph } from 'react-native-chart-kit';
import { Colors } from '../../constants/colors';
import { SCREEN_NAMES } from '../../constants/screenNames';
import { useFinance } from '../../hooks/useFinance';
import {
  calculateFinancialHealth,
  getHealthScoreCategory,
  getExpensesByCategory,
  getWeeklyExpensesForChart,
  getExpenseInsights,
} from '../../services/analytics';
import { EXPENSE_CATEGORIES } from '../../constants/categories';

const chartWidth = Dimensions.get('window').width - 32;

export const AnalyticsScreen = ({ navigation }) => {
  const { expenses, salary } = useFinance();
  const [filter, setFilter] = useState('month'); // 'week', 'month', 'year'
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setRefreshing(prev => !prev);
    }, [])
  );

  // Calculate health score and totals
  const monthlyExpenses = expenses
    .filter(exp => {
      const expDate = exp.createdAt?.toDate?.() || new Date(exp.createdAt);
      const now = new Date();
      return (
        new Date(expDate).getMonth() === now.getMonth() &&
        new Date(expDate).getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const healthScore = calculateFinancialHealth(salary, monthlyExpenses, 0);
  const healthCategory = getHealthScoreCategory(healthScore);

  // Get category breakdown
  const categorySpending = getExpensesByCategory(expenses);
  const pieChartData = EXPENSE_CATEGORIES.map((cat, idx) => ({
    name: cat.name.substring(0, 3),
    amount: Math.round(categorySpending[cat.id] || 0),
    color: Colors.category[cat.id] || Colors.primary,
    legendFontColor: Colors.textSecondary,
    legendFontSize: 12,
  })).filter(item => item.amount > 0);

  // Weekly chart data
  const weeklyData = getWeeklyExpensesForChart(expenses);
  const weeklyChartData = {
    labels: weeklyData.labels,
    datasets: [
      {
        data: weeklyData.data.length > 0 ? weeklyData.data : [0],
        strokeWidth: 2,
        color: (opacity = 1) => Colors.primary,
      },
    ],
  };

  // Category ranking
  const topCategories = Object.entries(categorySpending)
    .map(([catId, amount]) => {
      const category = EXPENSE_CATEGORIES.find(c => c.id === catId);
      return { id: catId, label: category?.label, amount, color: category?.color };
    })
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Insights
  const insights = getExpenseInsights(expenses);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Health Score Card */}
        <TouchableOpacity
          style={styles.healthScoreCard}
          onPress={() => navigation.navigate(SCREEN_NAMES.HEALTH_SCORE_DETAIL)}
        >
          <View style={styles.scoreContent}>
            <View style={styles.scoreLeft}>
              <Text style={styles.scoreLabel}>Financial Health</Text>
              <View style={styles.scoreValue}>
                <Text style={styles.score}>{Math.round(healthScore)}</Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
            </View>

            <View style={styles.scoreRight}>
              <View
                style={[
                  styles.scoreCircle,
                  {
                    borderColor: 
                      healthScore >= 80 ? Colors.success :
                      healthScore >= 60 ? Colors.primary :
                      healthScore >= 40 ? Colors.warning :
                      Colors.error,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.scorePercent,
                    {
                      color:
                        healthScore >= 80 ? Colors.success :
                        healthScore >= 60 ? Colors.primary :
                        healthScore >= 40 ? Colors.warning :
                        Colors.error,
                    },
                  ]}
                >
                  {Math.round(healthScore)}%
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.scoreStatus}>{healthCategory} 💪</Text>
        </TouchableOpacity>

        {/* Spending Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>This Month</Text>
            <Text style={styles.summaryAmount}>₹{monthlyExpenses.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Budget</Text>
            <Text style={styles.summaryAmount}>₹{Math.round(salary).toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text
              style={[
                styles.summaryAmount,
                {
                  color: salary - monthlyExpenses >= 0 ? Colors.success : Colors.error,
                },
              ]}
            >
              ₹{Math.round(salary - monthlyExpenses).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Weekly Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Trend</Text>
          <View style={styles.chartContainer}>
            {weeklyData.data.length > 0 && Math.max(...weeklyData.data) > 0 ? (
              <LineChart
                data={weeklyChartData}
                width={chartWidth}
                height={220}
                chartConfig={{
                  backgroundColor: Colors.card,
                  backgroundGradientFrom: Colors.card,
                  backgroundGradientTo: Colors.card,
                  color: (opacity = 1) => Colors.primary,
                  labelColor: (opacity = 1) => Colors.textSecondary,
                  style: { borderRadius: 8 },
                  propsForDots: {
                    r: '5',
                    strokeWidth: '2',
                    stroke: Colors.primary,
                  },
                }}
                bezier
                style={styles.chart}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No expense data this week</Text>
              </View>
            )}
          </View>
        </View>

        {/* Category Breakdown */}
        {pieChartData.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Spending by Category</Text>
              <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.CATEGORY_BREAKDOWN)}>
                <Text style={styles.viewAllLink}>View All →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.chartContainer}>
              <PieChart
                data={pieChartData}
                width={chartWidth}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => Colors.primary,
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="0"
                style={styles.chart}
              />
            </View>

            {/* Top Categories List */}
            <View style={styles.topCategoriesList}>
              {topCategories.map((cat, idx) => (
                <View key={idx} style={styles.categoryItem}>
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: cat.color },
                    ]}
                  />
                  <Text style={styles.categoryName}>{cat.label}</Text>
                  <Text style={styles.categoryAmount}>
                    ₹{cat.amount.toLocaleString('en-IN')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insights</Text>
            {insights.map((insight, idx) => (
              <View key={idx} style={styles.insightCard}>
                <Text style={styles.insightIcon}>{insight.icon}</Text>
                <Text style={styles.insightText}>{insight.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Phase 2 - Smart Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Features</Text>
          <View style={styles.featuresGrid}>
            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => navigation.navigate('BudgetingScreen')}
            >
              <Text style={styles.featureEmoji}>💰</Text>
              <Text style={styles.featureName}>Smart Budgeting</Text>
              <Text style={styles.featureDesc}>Set & manage category budgets</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => navigation.navigate('PredictionsScreen')}
            >
              <Text style={styles.featureEmoji}>🤖</Text>
              <Text style={styles.featureName}>AI Predictions</Text>
              <Text style={styles.featureDesc}>Forecast your spending</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => navigation.navigate('RecurringExpensesScreen')}
            >
              <Text style={styles.featureEmoji}>🔄</Text>
              <Text style={styles.featureName}>Recurring Detect</Text>
              <Text style={styles.featureDesc}>Find repeat expenses</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => navigation.navigate('SearchScreen')}
            >
              <Text style={styles.featureEmoji}>🔍</Text>
              <Text style={styles.featureName}>Smart Search</Text>
              <Text style={styles.featureDesc}>Filter & find expenses</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Call to Action */}
        {expenses.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No Data Yet</Text>
            <Text style={styles.emptyDesc}>
              Start tracking your expenses to see analytics
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  healthScoreCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLeft: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  scoreValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  scoreMax: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  scoreRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scorePercent: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreStatus: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
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
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  viewAllLink: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 8,
  },
  topCategoriesList: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  insightCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  insightIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 40,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
