import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Button, Input } from '../../components';
import { useFinance } from '../../hooks';

export const AddGoalScreen = ({ navigation }) => {
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [goalType, setGoalType] = useState('short_term');
  const [loading, setLoading] = useState(false);

  const { addGoal } = useFinance();

  const handleAddGoal = async () => {
    if (!goalName.trim() || !targetAmount.trim()) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      await addGoal({
        name: goalName,
        targetAmount: parseFloat(targetAmount),
        deadline: deadline || null,
        type: goalType,
        saved: 0,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Goal created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create goal');
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
          <Text style={styles.title}>Create Goal</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          <Input
            label="Goal Name"
            value={goalName}
            onChangeText={setGoalName}
            placeholder="e.g., New Bike, Vacation"
          />

          <Input
            label="Target Amount (₹)"
            value={targetAmount}
            onChangeText={setTargetAmount}
            placeholder="100000"
            keyboardType="decimal-pad"
          />

          <Input
            label="Deadline (Optional)"
            value={deadline}
            onChangeText={setDeadline}
            placeholder="31-12-2024"
          />

          <Text style={styles.label}>Goal Type</Text>
          <View style={styles.typeContainer}>
            <Pressable
              style={[
                styles.typeButton,
                goalType === 'short_term' && styles.typeButtonActive,
              ]}
              onPress={() => setGoalType('short_term')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  goalType === 'short_term' && styles.typeButtonTextActive,
                ]}
              >
                Short Term
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.typeButton,
                goalType === 'long_term' && styles.typeButtonActive,
              ]}
              onPress={() => setGoalType('long_term')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  goalType === 'long_term' && styles.typeButtonTextActive,
                ]}
              >
                Long Term
              </Text>
            </Pressable>
          </View>

          <Button
            title="Create Goal"
            onPress={handleAddGoal}
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
    marginBottom: 12,
    marginTop: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}20`,
  },
  typeButtonText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  typeButtonTextActive: {
    color: Colors.primary,
  },
});
