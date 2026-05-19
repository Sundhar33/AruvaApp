import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Text,
  FlatList,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { useFinance } from '../../context/FinanceContext';
import {
  predictMonthlySpending,
  getSpendingInsights,
} from '../../services/predictions';

const PredictionsScreen = ({ navigation }) => {
  const { expenses, salary } = useFinance();

  const predictions = useMemo(
    () => predictMonthlySpending(expenses),
    [expenses]
  );

  const insights = useMemo(
    () => getSpendingInsights(expenses, salary),
    [expenses, salary]
  );

  const getCategoryIcon = (categoryId) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.id === categoryId);
    return cat?.icon || '📌';
  };

  const getCategoryName = (categoryId) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.id === categoryId);
    return cat?.name || 'Unknown';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return '📈';
    if (trend === 'decreasing') return '📉';
    return '➡️';
  };

  const getSavingsAmount = () => {
    if (salary <= 0) return 0;
    return Math.max(0, salary - predictions.totalPredicted);
  };

  const getSavingsRate = () => {
    if (salary <= 0) return 0;
    return ((getSavingsAmount() / salary) * 100).toFixed(1);
  };

  const renderCategoryPrediction = ({ item }) => {
    if (!item) return null;

    const { category, predictedAmount, averageAmount, trend, confidence } = item;
    const categoryName = getCategoryName(category);
    const categoryIcon = getCategoryIcon(category);

    return (
      <View style={styles.predictionCard}>
        <View style={styles.predictionHeader}>
          <View>
            <Text style={styles.categoryLabel}>
              {categoryIcon} {categoryName}
            </Text>
            <Text style={styles.averageText}>
              Last 3mo avg: ₹{Math.round(averageAmount)}
            </Text>
          </View>
          <View style={styles.trendBadge}>
            <Text style={styles.trendIcon}>{getTrendIcon(trend)}</Text>
            <Text style={styles.trendText}>{trend}</Text>
          </View>
        </View>

        <View style={styles.predictionBody}>
          <View>
            <Text style={styles.predictedLabel}>Next Month Prediction</Text>
            <Text style={styles.predictedAmount}>₹{Math.round(predictedAmount)}</Text>
          </View>
          <View style={styles.confidenceContainer}>
            <View style={styles.confidenceBar}>
              <View
                style={[
                  styles.confidenceFill,
                  { width: `${confidence * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.confidenceText}>
              {Math.round(confidence * 100)}% confidence
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderInsight = ({ item }) => {
    const getBackgroundColor = () => {
      if (item.type === 'warning') return 'rgba(245, 158, 11, 0.1)';
      if (item.type === 'positive') return 'rgba(16, 185, 129, 0.1)';
      if (item.type === 'category_prediction') return 'rgba(59, 130, 246, 0.1)';
      return 'rgba(78, 255, 224, 0.1)';
    };

    const getBorderColor = () => {
      if (item.type === 'warning') return Colors.warning;
      if (item.type === 'positive') return Colors.success;
      if (item.type === 'category_prediction') return Colors.info;
      return Colors.glowAccent;
    };

    return (
      <View
        style={[
          styles.insightBox,
          {
            backgroundColor: getBackgroundColor(),
            borderLeftColor: getBorderColor(),
          },
        ]}
      >
        <Text style={styles.insightText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🤖 AI Predictions</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Main Prediction Card */}
        <View style={styles.mainCard}>
          <Text style={styles.mainCardLabel}>Next Month Predicted Spending</Text>
          <Text style={styles.mainCardAmount}>₹{Math.round(predictions.totalPredicted)}</Text>

          <View style={styles.divider} />

          <View style={styles.savingsRow}>
            <View>
              <Text style={styles.savingsLabel}>Predicted Savings</Text>
              <Text style={styles.savingsAmount}>₹{Math.round(getSavingsAmount())}</Text>
            </View>
            <View>
              <Text style={styles.savingsRateLabel}>Savings Rate</Text>
              <Text style={styles.savingsRate}>{getSavingsRate()}%</Text>
            </View>
          </View>

          {salary > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Monthly Salary</Text>
                <Text style={styles.infoValue}>₹{Math.round(salary)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Confidence Badge */}
        <View style={styles.confidenceBadge}>
          <Text style={styles.badges}>
            📊 Overall prediction confidence: {Math.round(predictions.confidence * 100)}%
          </Text>
          <Text style={styles.badgeHint}>
            Based on {predictions.byCategory.length} months of data
          </Text>
        </View>

        {/* Insights Section */}
        {insights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Smart Insights</Text>
            <FlatList
              scrollEnabled={false}
              data={insights}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderInsight}
              contentContainerStyle={{ gap: 10 }}
            />
          </View>
        )}

        {/* Category Predictions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Category-wise Predictions</Text>
          <FlatList
            scrollEnabled={false}
            data={predictions.byCategory}
            keyExtractor={item => item.category}
            renderItem={renderCategoryPrediction}
            contentContainerStyle={{ gap: 10 }}
          />
        </View>

        {/* How it Works */}
        <View style={styles.howItWorksCard}>
          <Text style={styles.howItWorksTitle}>How These Predictions Work</Text>
          <View style={styles.howItWorksItem}>
            <Text style={styles.howItWorksNumber}>1️⃣</Text>
            <View>
              <Text style={styles.howItWorksItemTitle}>Historical Analysis</Text>
              <Text style={styles.howItWorksItemText}>
                We analyze your spending from the last 3-6 months
              </Text>
            </View>
          </View>
          <View style={styles.howItWorksItem}>
            <Text style={styles.howItWorksNumber}>2️⃣</Text>
            <View>
              <Text style={styles.howItWorksItemTitle}>Trend Detection</Text>
              <Text style={styles.howItWorksItemText}>
                We identify if your spending is increasing or decreasing
              </Text>
            </View>
          </View>
          <View style={styles.howItWorksItem}>
            <Text style={styles.howItWorksNumber}>3️⃣</Text>
            <View>
              <Text style={styles.howItWorksItemTitle}>Smart Forecast</Text>
              <Text style={styles.howItWorksItemText}>
                We combine historical data and trends to predict next month
              </Text>
            </View>
          </View>
        </View>

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Predictions Tips</Text>
          <Text style={styles.tipText}>
            • More data = more accurate predictions. Track expenses consistently
          </Text>
          <Text style={styles.tipText}>
            • Use predictions to plan budgets and savings goals
          </Text>
          <Text style={styles.tipText}>
            • If predictions seem off, review your spending patterns
          </Text>
        </View>

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
  mainCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
  },
  mainCardLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 8,
  },
  mainCardAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  savingsLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  savingsAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.success,
  },
  savingsRateLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  savingsRate: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.glowAccent,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  confidenceBadge: {
    backgroundColor: 'rgba(78, 255, 224, 0.1)',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.glowAccent,
  },
  badges: {
    fontSize: 13,
    color: Colors.glowAccent,
    fontWeight: '600',
    marginBottom: 4,
  },
  badgeHint: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  predictionCard: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  averageText: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(78, 255, 224, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trendIcon: {
    fontSize: 12,
  },
  trendText: {
    fontSize: 10,
    color: Colors.glowAccent,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  predictionBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  predictedLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  predictedAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  confidenceContainer: {
    flex: 1,
    marginLeft: 12,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: 9,
    color: Colors.textTertiary,
    textAlign: 'right',
  },
  insightBox: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  insightText: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 16,
    fontWeight: '500',
  },
  howItWorksCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    borderTopWidth: 2,
    borderTopColor: Colors.glowAccent,
  },
  howItWorksTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.glowAccent,
    marginBottom: 12,
  },
  howItWorksItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  howItWorksNumber: {
    fontSize: 18,
    marginTop: -2,
  },
  howItWorksItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  howItWorksItemText: {
    fontSize: 11,
    color: Colors.textTertiary,
    lineHeight: 14,
  },
  tipsCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.success,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
    lineHeight: 14,
  },
});

export default PredictionsScreen;
