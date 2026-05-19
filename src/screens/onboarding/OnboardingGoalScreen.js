import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Button, Input } from '../../components';
import { useFinance } from '../../hooks';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const OnboardingGoalScreen = ({ navigation }) => {
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const { addGoal } = useFinance();

  const handleSkipGoal = async () => {
    try {
      await AsyncStorage.setItem('goal_skipped', 'true');
      navigation.navigate('OnboardingCategories');
    } catch (error) {
      Alert.alert('Error', 'Failed to skip goal setup');
    }
  };

  const handleCreateGoal = async () => {
    if (!goalName.trim() || !targetAmount.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await addGoal({
        name: goalName,
        targetAmount: parseFloat(targetAmount),
        saved: 0,
        deadline: deadline || null,
        type: 'short_term',
      });
      
      navigation.navigate('OnboardingCategories');
    } catch (error) {
      Alert.alert('Error', 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create Your First Goal</Text>
        <Text style={styles.subtitle}>
          Set a financial goal to start tracking
        </Text>

        <View style={styles.form}>
          <Input
            label="Goal Name"
            value={goalName}
            onChangeText={setGoalName}
            placeholder="e.g., Bike, Vacation"
          />

          <Input
            label="Target Amount (₹)"
            value={targetAmount}
            onChangeText={setTargetAmount}
            placeholder="100000"
            keyboardType="decimal-pad"
          />

          <Input
            label="Target Date (Optional)"
            value={deadline}
            onChangeText={setDeadline}
            placeholder="31-12-2024"
          />

          <Button
            title="Create Goal"
            onPress={handleCreateGoal}
            loading={loading}
          />

          <Button
            title="Skip for Now"
            variant="outline"
            onPress={handleSkipGoal}
            style={styles.skipButton}
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
  skipButton: {
    marginTop: 12,
  },
});
