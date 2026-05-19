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
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../constants/categories';

export const ExpenseDetailScreen = ({ navigation, route }) => {
  const { item } = route.params;

  const categoryIcon = EXPENSE_CATEGORIES.find(c => c.id === item.category)?.icon;
  const methodName = PAYMENT_METHODS.find(m => m.id === item.paymentMethod)?.name;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹ Back</Text>
          </Pressable>
        </View>

        {/* Amount Card */}
        <Card style={styles.amountCard}>
          <Text style={styles.amountIcon}>{categoryIcon}</Text>
          <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
          <Text style={styles.category}>{item.category}</Text>
        </Card>

        {/* Details */}
        <Card>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>
              {formatDate(item.createdAt?.toDate?.() || item.createdAt)}
            </Text>
          </View>
          <View style={[styles.detail, styles.detailBorder]}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>{methodName || item.paymentMethod}</Text>
          </View>
          {item.note && (
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Note</Text>
              <Text style={styles.detailValue}>{item.note}</Text>
            </View>
          )}
        </Card>

        {/* Edit/Delete Info */}
        <Text style={styles.infoText}>
          💡 Swipe left to delete or long press to edit
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
    marginBottom: 24,
  },
  backButton: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  amountCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
    backgroundColor: `${Colors.primary}15`,
    borderColor: Colors.primary,
  },
  amountIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  category: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textTransform: 'capitalize',
  },
  detail: {
    paddingVertical: 12,
  },
  detailBorder: {
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
  infoText: {
    color: Colors.textTertiary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 32,
    fontStyle: 'italic',
  },
});
