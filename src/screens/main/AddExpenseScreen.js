import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
  FlatList,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Button, Input } from '../../components';
import { useFinance } from '../../hooks';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../constants/categories';

export const AddExpenseScreen = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-IN'));
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showMethodPicker, setShowMethodPicker] = useState(false);

  const { addExpense } = useFinance();

  const handleAddExpense = async () => {
    if (!amount.trim()) {
      Alert.alert('Error', 'Please enter amount');
      return;
    }

    setLoading(true);
    try {
      await addExpense({
        amount: parseFloat(amount),
        category,
        paymentMethod,
        note,
        date,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Expense added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryName = EXPENSE_CATEGORIES.find(c => c.id === category)?.name;
  const selectedMethodName = PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>✕</Text>
          </Pressable>
          <Text style={styles.title}>Add Expense</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          <Input
            label="Amount (₹)"
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Category</Text>
          <Pressable
            style={styles.selector}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Text style={styles.selectorText}>{selectedCategoryName}</Text>
            <Text style={styles.icon}>▼</Text>
          </Pressable>

          {showCategoryPicker && (
            <View style={styles.picker}>
              {EXPENSE_CATEGORIES.map(cat => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.pickerItem,
                    category === cat.id && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    setCategory(cat.id);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.pickerItemText,
                      category === cat.id && styles.pickerItemTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={styles.label}>Payment Method</Text>
          <Pressable
            style={styles.selector}
            onPress={() => setShowMethodPicker(!showMethodPicker)}
          >
            <Text style={styles.selectorText}>{selectedMethodName}</Text>
            <Text style={styles.icon}>▼</Text>
          </Pressable>

          {showMethodPicker && (
            <View style={styles.picker}>
              {PAYMENT_METHODS.map(method => (
                <Pressable
                  key={method.id}
                  style={[
                    styles.pickerItem,
                    paymentMethod === method.id && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    setPaymentMethod(method.id);
                    setShowMethodPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      paymentMethod === method.id && styles.pickerItemTextActive,
                    ]}
                  >
                    {method.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <Input
            label="Date"
            value={date}
            onChangeText={setDate}
            placeholder="DD-MM-YYYY"
          />

          <Input
            label="Note (Optional)"
            value={note}
            onChangeText={setNote}
            placeholder="Add a note..."
            multiline
            numberOfLines={3}
          />

          <Button
            title="Add Expense"
            onPress={handleAddExpense}
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
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  selector: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectorText: {
    color: Colors.text,
    fontWeight: '500',
  },
  icon: {
    color: Colors.textTertiary,
    fontSize: 12,
  },
  picker: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerItemActive: {
    backgroundColor: `${Colors.primary}20`,
  },
  pickerItemText: {
    color: Colors.text,
    marginLeft: 8,
    fontWeight: '500',
  },
  pickerItemTextActive: {
    color: Colors.primary,
  },
});
