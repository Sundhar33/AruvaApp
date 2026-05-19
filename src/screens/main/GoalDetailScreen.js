import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Card } from '../../components';
import { formatCurrency, formatDate } from '../../utils/helpers';

export const GoalDetailScreen = ({ navigation, route }) => {
  const { item } = route.params;

  const progressPercentage = (item.saved / item.targetAmount) * 100;
  const remainingAmount = item.targetAmount - item.saved;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹ Back</Text>
          </Pressable>
        </View>

        {/* Goal Header */}
        <Card style={styles.headerCard}>
          <Text style={styles.goalIcon}>🎯</Text>
          <Text style={styles.goalName}>{item.name}</Text>
          <Text style={styles.goalType}>
            {item.type === 'short_term' ? 'Short-term Goal' : 'Long-term Goal'}
          </Text>
        </Card>

        {/* Progress Section */}
        <Card>
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Progress</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(progressPercentage, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progressPercentage.toFixed(1)}% Complete
            </Text>
          </View>
        </Card>

        {/* Amount Details */}
        <Card>
          <View style={styles.amountRow}>
            <View>
              <Text style={styles.amountLabel}>Target Amount</Text>
              <Text style={styles.amountValue}>
                {formatCurrency(item.targetAmount)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amountLabel}>Saved</Text>
              <Text style={[styles.amountValue, { color: Colors.success }]}>
                {formatCurrency(item.saved)}
              </Text>
            </View>
          </View>

          <View style={[styles.amountRow, styles.remainingRow]}>
            <Text style={styles.remainingLabel}>Remaining</Text>
            <Text style={styles.remainingAmount}>
              {formatCurrency(remainingAmount)}
            </Text>
          </View>
        </Card>

        {/* Additional Details */}
        <Card>
          {item.deadline && (
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Target Date</Text>
              <Text style={styles.detailValue}>{item.deadline}</Text>
            </View>
          )}
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Created on</Text>
            <Text style={styles.detailValue}>
              {formatDate(item.createdAt?.toDate?.() || item.createdAt)}
            </Text>
          </View>
        </Card>

        {/* Motivational Message */}
        <Text style={styles.motivation}>
          {progressPercentage >= 100
            ? '🎉 Congratulations! Goal achieved!'
            : progressPercentage >= 75
            ? '💪 You\'re almost there!'
            : progressPercentage >= 50
            ? '⚡ Keep going!'
            : '🚀 Great start!'}
        </Text>
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
  backButton: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  headerCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
    backgroundColor: `${Colors.primary}15`,
    borderColor: Colors.primary,
  },
  goalIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  goalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  goalType: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  progressContainer: {
    paddingVertical: 12,
  },
  progressLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  amountLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  amountValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  remainingRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    justifyContent: 'space-between',
  },
  remainingLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  remainingAmount: {
    color: Colors.warning,
    fontSize: 16,
    fontWeight: 'bold',
  },
  detail: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  motivation: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 24,
    color: Colors.primary,
  },
});
