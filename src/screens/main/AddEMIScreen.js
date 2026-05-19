import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Button, Input } from '../../components';
import { useFinance } from '../../hooks';

export const AddEMIScreen = ({ navigation }) => {
  const [emiName, setEmiName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remainingMonths, setRemainingMonths] = useState('');
  const [loading, setLoading] = useState(false);

  const { addEMI } = useFinance();

  const handleAddEMI = async () => {
    if (!emiName.trim() || !amount.trim() || !dueDate.trim() || !remainingMonths.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await addEMI({
        name: emiName,
        amount: parseFloat(amount),
        dueDate,
        remainingMonths: parseInt(remainingMonths),
        totalMonths: parseInt(remainingMonths),
        createdAt: new Date(),
      });

      Alert.alert('Success', 'EMI added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add EMI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>✕</Text>
          </Pressable>
          <Text style={styles.title}>Add EMI</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          <Input
            label="EMI Name"
            value={emiName}
            onChangeText={setEmiName}
            placeholder="e.g., Car Loan, Home Loan"
          />

          <Input
            label="Monthly Amount (₹)"
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            keyboardType="decimal-pad"
          />

          <Input
            label="Due Date (e.g., 5th, 15th)"
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="5"
            keyboardType="numeric"
          />

          <Input
            label="Remaining Months"
            value={remainingMonths}
            onChangeText={setRemainingMonths}
            placeholder="12"
            keyboardType="numeric"
          />

          <Button
            title="Add EMI"
            onPress={handleAddEMI}
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
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  form: {
    width: '100%',
  },
});
