import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useFinance } from '../../hooks/useFinance';
import { calculateFinancialHealth, getHealthScoreCategory } from '../../services/analytics';

export const HealthScoreDetailScreen = ({ navigation }) => {
  const { expenses, salary } = useFinance();

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

  // Calculate breakdown scores
  const savingsRate = Math.max(0, ((salary - monthlyExpenses) / salary) * 100);
  const expenseRatio = (monthlyExpenses / salary) * 100;

  const scoreBreakdown = [
    {
      label: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      description: `You're saving ${savingsRate.toFixed(1)}% of your income`,
      color: Math.max(0, savingsRate / 2) >= 12 ? Colors.success : Colors.warning,
    },
    {
      label: 'Expense Ratio',
      value: `${expenseRatio.toFixed(1)}%`,
      description: `Expenses are ${expenseRatio.toFixed(1)}% of your salary`,
      color: expenseRatio <= 50 ? Colors.success : expenseRatio <= 70 ? Colors.warning : Colors.error,
    },
    {
      label: 'Monthly Budget',
      value: `₹${salary.toLocaleString('en-IN')}`,
      description: `Your monthly salary/budget`,
      color: Colors.primary,
    },
    {
      label: 'Spent This Month',
      value: `₹${monthlyExpenses.toLocaleString('en-IN')}`,
      description: `Total expenses this month`,
      color: Colors.text,
    },
  ];

  const recommendations = [
    {
      icon: '💡',
      title: 'Savings Tip',
      content:
        healthScore >= 70
          ? '🎉 Excellent savings rate! Consider investing your surplus for long-term growth.'
          : savingsRate < 20
          ? '⚠️ Your savings rate is low. Try to reduce discretionary spending.'
          : '✅ Good savings rate. Maintain this balance!',
    },
    {
      icon: '📊',
      title: 'Spending Analysis',
      content:
        expenseRatio >= 70
          ? '⚠️ Your expenses are high. Review and categorize to find areas to cut.'
          : '✅ Your expenses are well-managed relative to your income.',
    },
    {
      icon: '🎯',
      title: 'Next Step',
      content:
        healthScore >= 80
          ? 'Focus on investments and building emergency funds.'
          : healthScore >= 60
          ? 'Set up automated savings to track progress.'
          : 'Create a detailed budget and track expenses weekly.',
    },
  ];

  const scoreColor =
    healthScore >= 80
      ? Colors.success
      : healthScore >= 60
      ? Colors.primary
      : healthScore >= 40
      ? Colors.warning
      : Colors.error;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Score Overview */}
        <View style={styles.scoreSection}>
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>
              {Math.round(healthScore)}
            </Text>
            <Text style={styles.scoreMaxText}>/100</Text>
          </View>
          <Text style={styles.categoryText}>{healthCategory}</Text>
          <Text style={styles.categoryDesc}>Financial Health Status</Text>
        </View>

        {/* Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Breakdown</Text>
          {scoreBreakdown.map((item, idx) => (
            <View key={idx} style={styles.breakdownCard}>
              <View style={styles.breakdownLeft}>
                <Text style={styles.breakdownLabel}>{item.label}</Text>
                <Text style={styles.breakdownDesc}>{item.description}</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: item.color }]}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personalized Insights</Text>
          {recommendations.map((rec, idx) => (
            <View key={idx} style={styles.recommendationCard}>
              <Text style={styles.recIcon}>{rec.icon}</Text>
              <View style={styles.recContent}>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <Text style={styles.recText}>{rec.content}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Health Score Formula */}
        <View style={styles.formulaSection}>
          <Text style={styles.formulaTitle}>How We Calculate Your Score</Text>
          <View style={styles.formulaBox}>
            <Text style={styles.formulaText}>
              • Base: 50 points{'\n'}
              • Savings Rate: +0-25 points{'\n'}
              • Expense Ratio: -0-15 points{'\n'}
              • EMI Ratio: -0-10 points
            </Text>
          </View>
          <Text style={styles.formulaNote}>
            Higher scores indicate better financial health. Track your score regularly!
          </Text>
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
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 24,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreMaxText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 12,
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
  breakdownCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  breakdownLeft: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  breakdownDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  recText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  formulaSection: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  formulaTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  formulaBox: {
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  formulaText: {
    fontSize: 11,
    color: Colors.text,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  formulaNote: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});
