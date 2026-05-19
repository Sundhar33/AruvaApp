import React, { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Text,
  FlatList,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { useFinance } from '../../context/FinanceContext';
import { detectRecurringExpenses } from '../../services/notifications';

const RecurringExpensesScreen = ({ navigation }) => {
  const { expenses } = useFinance();
  const [trackedRecurring, setTrackedRecurring] = useState([]);

  const recurring = useMemo(
    () => detectRecurringExpenses(expenses),
    [expenses]
  );

  const getCategoryName = (categoryId) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.id === categoryId);
    return cat?.name || 'Unknown';
  };

  const getCategoryIcon = (categoryId) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.id === categoryId);
    return cat?.icon || '📌';
  };

  const getIntervalLabel = (days) => {
    if (days <= 1) return 'Daily';
    if (days <= 7) return 'Weekly';
    if (days <= 14) return 'Bi-weekly';
    if (days <= 30) return 'Monthly';
    if (days <= 100) return 'Quarterly';
    return 'Yearly';
  };

  const getMonthlyProjection = (amount, interval) => {
    if (interval <= 1) return Math.round(amount * 30);
    if (interval <= 7) return Math.round(amount * (30 / interval));
    if (interval <= 14) return Math.round(amount * (30 / interval));
    if (interval <= 30) return Math.round(amount * (30 / interval));
    return Math.round((amount / interval) * 30);
  };

  const handleAddToTrack = (rec) => {
    if (!trackedRecurring.find(t => t.description === rec.description)) {
      setTrackedRecurring([...trackedRecurring, rec]);
      Alert.alert('Added', `${rec.description} added to recurring expenses`);
    } else {
      Alert.alert('Info', 'This expense is already being tracked');
    }
  };

  const handleRemoveFromTrack = (description) => {
    setTrackedRecurring(
      trackedRecurring.filter(t => t.description !== description)
    );
  };

  const renderRecurringItem = ({ item, index }) => {
    const isTracked = trackedRecurring.find(t => t.description === item.description);
    const monthlyProjection = getMonthlyProjection(item.amount, item.interval);

    return (
      <View style={styles.recurringCard}>
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.recursiveTitle}>
              {getCategoryIcon(item.category)} {item.description}
            </Text>
            <Text style={styles.recursiveInfo}>
              {getCategoryName(item.category)} • {getIntervalLabel(item.interval)}
            </Text>
          </View>
          <View style={styles.amountColumn}>
            <Text style={styles.recurringAmount}>₹{item.amount}</Text>
            <Text style={styles.intervalInfo}>every {item.interval}d</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Monthly Estimate</Text>
            <Text style={styles.statValue}>₹{monthlyProjection}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Yearly Estimate</Text>
            <Text style={styles.statValue}>₹{Math.round(monthlyProjection * 12)}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {isTracked ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.removeBtn]}
              onPress={() => handleRemoveFromTrack(item.description)}
            >
              <Text style={styles.removeBtnText}>✓ Tracking</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, styles.addBtn]}
              onPress={() => handleAddToTrack(item)}
            >
              <Text style={styles.addBtnText}>+ Add to Track</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, styles.infoBtn]}
          >
            <Text style={styles.infoBtnText}>ℹ️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.confidenceBox}>
          <Text style={styles.confidenceLabel}>Confidence: {Math.round(item.confidence * 100)}%</Text>
        </View>
      </View>
    );
  };

  const renderTrackedItem = ({ item }) => {
    const monthlyProjection = getMonthlyProjection(item.amount, item.interval);
    const yearlyProjection = Math.round(monthlyProjection * 12);
    const totalProjected = trackedRecurring.reduce(
      (sum, t) => sum + getMonthlyProjection(t.amount, t.interval),
      0
    );

    return (
      <View style={styles.trackedCard}>
        <View style={styles.trackedHeader}>
          <View>
            <Text style={styles.trackedTitle}>
              {getCategoryIcon(item.category)} {item.description}
            </Text>
            <Text style={styles.trackedInfo}>
              {getCategoryName(item.category)} • Every {item.interval} days
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleRemoveFromTrack(item.description)}
            style={styles.removeTrackedBtn}
          >
            <Text style={styles.removeTrackedText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.trackedStats}>
          <View style={styles.trackedStatItem}>
            <Text style={styles.trackedStatLabel}>Per Transaction</Text>
            <Text style={styles.trackedStatValue}>₹{item.amount}</Text>
          </View>
          <View style={styles.trackedStatItem}>
            <Text style={styles.trackedStatLabel}>Monthly</Text>
            <Text style={styles.trackedStatValue}>₹{monthlyProjection}</Text>
          </View>
          <View style={styles.trackedStatItem}>
            <Text style={styles.trackedStatLabel}>Yearly</Text>
            <Text style={styles.trackedStatValue}>₹{yearlyProjection}</Text>
          </View>
        </View>
      </View>
    );
  };

  const getTrackedStats = () => {
    const monthlySum = trackedRecurring.reduce(
      (sum, item) => sum + getMonthlyProjection(item.amount, item.interval),
      0
    );
    return {
      count: trackedRecurring.length,
      monthly: monthlySum,
      yearly: Math.round(monthlySum * 12),
    };
  };

  const trackedStats = getTrackedStats();
  const noRecurring = !recurring || recurring.length === 0;
  const noTracked = trackedRecurring.length === 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🔄 Recurring Expenses</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Tracked Summary */}
        {!noTracked && (
          <View style={styles.trackedSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Being Tracked</Text>
              <Text style={styles.summaryValue}>{trackedStats.count}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Monthly Impact</Text>
              <Text style={styles.summaryValue}>₹{trackedStats.monthly}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Yearly Impact</Text>
              <Text style={styles.summaryValue}>₹{trackedStats.yearly}</Text>
            </View>
          </View>
        )}

        {/* Tracked Recurring */}
        {!noTracked && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Tracked Recurring</Text>
            <FlatList
              scrollEnabled={false}
              data={trackedRecurring}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderTrackedItem}
              contentContainerStyle={{ gap: 10 }}
            />
          </View>
        )}

        {/* Detected Recurring */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔍 Detected Patterns</Text>
            {!noRecurring && (
              <Text style={styles.detectedCount}>
                {recurring.length} {recurring.length === 1 ? 'found' : 'found'}
              </Text>
            )}
          </View>

          {noRecurring ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🔎</Text>
              <Text style={styles.emptyTitle}>No Recurring Pattern Found</Text>
              <Text style={styles.emptyText}>
                Track more expenses to detect recurring patterns (need at least 3 similar transactions)
              </Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={recurring}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderRecurringItem}
              contentContainerStyle={{ gap: 10 }}
            />
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 About Recurring Detection</Text>
          <Text style={styles.infoText}>
            • We detect expenses that repeat with similar amounts and intervals
          </Text>
          <Text style={styles.infoText}>
            • Need at least 3 similar transactions to identify a pattern
          </Text>
          <Text style={styles.infoText}>
            • Track recurring expenses to plan your budget better
          </Text>
          <Text style={styles.infoText}>
            • Monthly/yearly estimates help you forecast spending
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
  trackedSummary: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  detectedCount: {
    fontSize: 12,
    color: Colors.glowAccent,
    fontWeight: '600',
    backgroundColor: 'rgba(78, 255, 224, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recurringCard: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  recursiveTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  recursiveInfo: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  amountColumn: {
    alignItems: 'flex-end',
  },
  recurringAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  intervalInfo: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.glowAccent,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  addBtn: {
    backgroundColor: Colors.primary,
  },
  addBtnText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: 11,
  },
  removeBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  removeBtnText: {
    color: Colors.success,
    fontWeight: '600',
    fontSize: 11,
  },
  infoBtn: {
    backgroundColor: Colors.border,
  },
  infoBtnText: {
    fontSize: 12,
  },
  confidenceBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(78, 255, 224, 0.1)',
    borderRadius: 4,
  },
  confidenceLabel: {
    fontSize: 9,
    color: Colors.glowAccent,
    fontWeight: '600',
  },
  trackedCard: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: Colors.success,
  },
  trackedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  trackedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  trackedInfo: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  removeTrackedBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeTrackedText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '700',
  },
  trackedStats: {
    flexDirection: 'row',
    gap: 10,
  },
  trackedStatItem: {
    flex: 1,
  },
  trackedStatLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  trackedStatValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.success,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 32,
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
  infoCard: {
    backgroundColor: 'rgba(78, 255, 224, 0.1)',
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
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
    lineHeight: 14,
  },
});

export default RecurringExpensesScreen;
