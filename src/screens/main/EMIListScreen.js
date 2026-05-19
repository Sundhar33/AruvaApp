import React, { useState } from 'react';
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
import { Button, Card } from '../../components';
import { useFinance } from '../../hooks';
import { formatCurrency } from '../../utils/helpers';

export const EMIListScreen = ({ navigation }) => {
  const { emis } = useFinance();

  const totalEMI = emis.reduce((sum, emi) => sum + emi.amount, 0);

  const renderEmiItem = ({ item }) => (
    <Card style={styles.emiCard}>
      <View style={styles.emiHeader}>
        <Text style={styles.emiName}>{item.name}</Text>
        <Text style={styles.emiAmount}>{formatCurrency(item.amount)}</Text>
      </View>
      <Text style={styles.emiDetail}>
        📅 Due: {item.dueDate}th of month
      </Text>
      <Text style={styles.emiDetail}>
        ⏳ {item.remainingMonths} months remaining
      </Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>EMI Tracker</Text>
        <Button
          title="+ Add EMI"
          size="sm"
          onPress={() => navigation.navigate('AddEMI')}
        />
      </View>

      {/* Total EMI Summary */}
      <Card style={[styles.summaryCard, { backgroundColor: `${Colors.error}15` }]}>
        <Text style={styles.summaryLabel}>Total Monthly EMI</Text>
        <Text style={styles.summaryValue}>{formatCurrency(totalEMI)}</Text>
      </Card>

      {/* EMI List */}
      {emis.length > 0 ? (
        <FlatList
          data={emis}
          renderItem={renderEmiItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyText}>No EMIs added yet</Text>
          <Button
            title="Add your first EMI"
            onPress={() => navigation.navigate('AddEMI')}
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
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    paddingVertical: 16,
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: Colors.error,
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emiCard: {
    marginBottom: 12,
  },
  emiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emiName: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  emiAmount: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 14,
  },
  emiDetail: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
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
