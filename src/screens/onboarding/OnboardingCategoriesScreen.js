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
import { Button } from '../../components';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const OnboardingCategoriesScreen = ({ navigation }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleContinue = async () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Error', 'Please select at least one category');
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.setItem(
        'selectedCategories',
        JSON.stringify(selectedCategories)
      );
      await AsyncStorage.setItem('onboarding_complete', 'true');
      
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to save categories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Customize Categories</Text>
        <Text style={styles.subtitle}>
          Select the expense categories you want to track
        </Text>

        <View style={styles.categoriesGrid}>
          {EXPENSE_CATEGORIES.map(category => (
            <Pressable
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategories.includes(category.id) && styles.categoryCardActive,
              ]}
              onPress={() => toggleCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryName,
                  selectedCategories.includes(category.id) && styles.categoryNameActive,
                ]}
              >
                {category.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            title="Get Started"
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  categoryCardActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}20`,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryNameActive: {
    color: Colors.primary,
  },
  footer: {
    paddingBottom: 20,
  },
});
