import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { safeAsyncStorage } from '../utils/asyncStorageHelper';

export const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Simulate splash screen delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const onboarded = await safeAsyncStorage.getItem('onboarding_complete');
        if (onboarded) {
          navigation.replace('Login');
        } else {
          navigation.replace('Onboarding');
        }
      } catch (error) {
        console.error('Error in splash screen:', error);
        navigation.replace('Login');
      }
    };

    checkOnboarding();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.title}>ARUVA</Text>
        <Text style={styles.subtitle}>AI-Powered Finance Tracker</Text>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
