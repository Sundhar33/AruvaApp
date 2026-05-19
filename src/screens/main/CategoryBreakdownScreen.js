import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/colors';
import { useFinance } from '../../hooks/useFinance';
import { getExpensesByCategory } from '../../services/analytics';
import { EXPENSE_CATEGORIES } from '../../constants/categories';

const chartWidth = Dimensions.get('window').width - 32;

export const CategoryBreakdownScreen = ({ navigation }) => {
  const { expenses } = useFinance();
  const [chartType, setChartType] = useState('pie'); // 'pie' or 'bar'

  const categorySpending = getExpensesByCategory(expenses);
  const categoryData = EXPENSE_CATEGORIES.map((cat) => ({
    id: cat.id,
    label: cat.name,
    amount: categorySpending[cat.id] || 0,
    color: Colors.category[cat.id] || Colors.primary,
  }))
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const totalSpent = categoryData.reduce((sum, cat) => sum + cat.amount, 0);

  // Pie chart data
  const pieChartData = categoryData.map((cat) => ({
    name: cat.label,
    amount: Math.round(cat.amount),
    color: cat.color,
    legendFontColor: Colors.textSecondary,
    legendFontSize: 12,
  }));

  // Bar chart data
  const barChartData = {
    labels: categoryData.map((cat) => cat.label.substring(0, 4)),
    datasets: [
      {
        data: categoryData.map((cat) => cat.amount),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Spending by Category</Text>
        </View>

        {/* Total Spent */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Spent</Text>
          <Text style={styles.totalAmount}>₹{totalSpent.toLocaleString('en-IN')}</Text>
          <Text style={styles.totalCategories}>{categoryData.length} categories</Text>
        </View>

        {/* Chart Type Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, chartType === 'pie' && styles.toggleActive]}
            onPress={() => setChartType('pie')}
          >
            <Text style={[styles.toggleText, chartType === 'pie' && styles.toggleTextActive]}>
              Pie Chart
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, chartType === 'bar' && styles.toggleActive]}
            onPress={() => setChartType('bar')}
          >
            <Text style={[styles.toggleText, chartType === 'bar' && styles.toggleTextActive]}>
              Bar Chart
            </Text>
          </TouchableOpacity>
        </View>

        {/* Charts */}
        {categoryData.length > 0 ? (
          <View style={styles.chartContainer}>
            {chartType === 'pie' ? (
              <PieChart
                data={pieChartData}
                width={chartWidth}
                height={280}
                chartConfig={{
                  color: (opacity = 1) => Colors.primary,
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="0"
                style={styles.chart}
              />
            ) : (
              <BarChart
                data={barChartData}
                width={chartWidth}
                height={280}
                chartConfig={{
                  backgroundColor: Colors.card,
                  backgroundGradientFrom: Colors.card,
                  backgroundGradientTo: Colors.card,
                  color: (opacity = 1) => Colors.primary,
                  labelColor: (opacity = 1) => Colors.textSecondary,
                  style: { borderRadius: 8 },
                }}
                style={styles.chart}
              />
            )}
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        )}

        {/* Detailed List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Breakdown</Text>
          {categoryData.map((cat, idx) => {
            const percentage = ((cat.amount / totalSpent) * 100).toFixed(1);
            return (
              <View key={idx} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                  <View style={styles.categoryText}>
                    <Text style={styles.categoryLabel}>{cat.label}</Text>
                    <Text style={styles.categoryPercent}>{percentage}% of total</Text>
                  </View>
                </View>
                <Text style={styles.categoryValue}>₹{cat.amount.toLocaleString('en-IN')}</Text>
              </View>
            );
          })}
        </View>

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.insightTitle}>💡 Quick Insights</Text>
          <View style={styles.insightBox}>
            <Text style={styles.insightText}>
              {categoryData[0]?.label} is your highest spending category at ₹
              {categoryData[0]?.amount.toLocaleString('en-IN')} ({((categoryData[0]?.amount / totalSpent) * 100).toFixed(1)}%).
            </Text>
          </View>
          {categoryData.length > 1 && (
            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                Top 3 categories account for {((categoryData.slice(0, 3).reduce((sum, cat) => sum + cat.amount, 0) / totalSpent) * 100).toFixed(1)}% of your spending.
              </Text>
            </View>
          )}
        </View>
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
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  totalCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  totalCategories: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  toggleTextActive: {
    color: Colors.text,
  },
  chartContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chart: {
    borderRadius: 8,
  },
  emptyChart: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.card,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  categoryText: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  categoryPercent: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  insightsSection: {
    marginBottom: 24,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  insightBox: {
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  insightText: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 16,
  },
});
