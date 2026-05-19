import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Button } from '../../components';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingSteps = [
  {
    id: 1,
    title: 'Welcome to ARUVA',
    description: 'Take control of your finances with AI-powered insights',
    icon: '💰',
  },
  {
    id: 2,
    title: 'Set Your Salary',
    description: 'Enter your monthly salary to get personalized recommendations',
    icon: '💸',
  },
  {
    id: 3,
    title: 'Create Goals',
    description: 'Set financial goals and track your progress',
    icon: '🎯',
  },
  {
    id: 4,
    title: 'Choose Categories',
    description: 'Select expense categories that matter to you',
    icon: '📊',
  },
];

export const OnboardingWelcomeScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = React.useState(0);

  const handleNext = () => {
    if (currentStep < OnboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.navigate('OnboardingSalary');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    navigation.replace('Login');
  };

  const step = OnboardingSteps[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Skip Button */}
        <View style={styles.header}>
          <Pressable onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        {/* Step Indicator */}
        <View style={styles.dots}>
          {OnboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentStep && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <View style={styles.body}>
          <Text style={styles.icon}>{step.icon}</Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </View>

        {/* Navigation */}
        <View style={styles.footer}>
          <Button
            title={currentStep === OnboardingSteps.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
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
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'flex-end',
  },
  skipText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textTertiary,
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingBottom: 20,
  },
});
