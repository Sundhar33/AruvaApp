import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Button, Input } from '../../components';
import { useFinance } from '../../hooks';

export const OnboardingSalaryScreen = ({ navigation }) => {
  const [salary, setSalary] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const { setSalary: setFinanceSalary, setMonthlyBudget: setFinanceBudget } = useFinance();

  const handleContinue = async () => {
    if (!salary.trim() || !monthlyBudget.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const salaryAmount = parseFloat(salary);
      const budgetAmount = parseFloat(monthlyBudget);
      
      // Persist salary and budget via FinanceContext
      await setFinanceSalary(salaryAmount);
      await setFinanceBudget(budgetAmount);
      
      navigation.navigate('OnboardingGoal');
    } catch (error) {
      Alert.alert('Error', 'Failed to save salary information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Set Your Salary</Text>
        <Text style={styles.subtitle}>
          Enter your monthly salary to get personalized insights
        </Text>

        <View style={styles.form}>
          <Input
            label="Monthly Salary (₹)"
            value={salary}
            onChangeText={setSalary}
            placeholder="50000"
            keyboardType="decimal-pad"
          />

          <Input
            label="Monthly Budget (₹)"
            value={monthlyBudget}
            onChangeText={setMonthlyBudget}
            placeholder="45000"
            keyboardType="decimal-pad"
          />

          <Text style={styles.hint}>
            💡 Budget is the amount you plan to spend per month
          </Text>

          <Button
            title="Continue"
            onPress={handleContinue}
            loading={loading}
          />
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
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  hint: {
    color: Colors.textTertiary,
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 24,
  },
});
