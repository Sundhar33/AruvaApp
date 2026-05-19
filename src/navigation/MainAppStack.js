import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { ExpensesScreen } from '../screens/main/ExpensesScreen';
import { AnalyticsScreen } from '../screens/main/AnalyticsScreen';
import { GoalsScreen } from '../screens/main/GoalsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { Colors } from '../constants/colors';
import { AddExpenseScreen } from '../screens/main/AddExpenseScreen';
import { ExpenseHistoryScreen } from '../screens/main/ExpenseHistoryScreen';
import { ExpenseDetailScreen } from '../screens/main/ExpenseDetailScreen';
import { AddEMIScreen } from '../screens/main/AddEMIScreen';
import { EMIListScreen } from '../screens/main/EMIListScreen';
import { AddGoalScreen } from '../screens/main/AddGoalScreen';
import { GoalDetailScreen } from '../screens/main/GoalDetailScreen';
import { HealthScoreDetailScreen } from '../screens/main/HealthScoreDetailScreen';
import { CategoryBreakdownScreen } from '../screens/main/CategoryBreakdownScreen';
import BudgetingScreen from '../screens/main/BudgetingScreen';
import PredictionsScreen from '../screens/main/PredictionsScreen';
import SearchScreen from '../screens/main/SearchScreen';
import RecurringExpensesScreen from '../screens/main/RecurringExpensesScreen';
import ReportsScreen from '../screens/main/ReportsScreen';
import ExportsScreen from '../screens/main/ExportsScreen';
import BackupRestoreScreen from '../screens/main/BackupRestoreScreen';
import AIAdvisorScreen from '../screens/main/AIAdvisorScreen';
import RecurringAutomationScreen from '../screens/main/RecurringAutomationScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DashboardStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
      <Stack.Screen name="ExpenseHistory" component={ExpenseHistoryScreen} />
      <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
      <Stack.Screen name="AddEMI" component={AddEMIScreen} />
      <Stack.Screen name="EMIList" component={EMIListScreen} />
      <Stack.Screen name="AddGoal" component={AddGoalScreen} />
    </Stack.Navigator>
  );
};

const ExpensesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ExpensesHome" component={ExpensesScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
      <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
      <Stack.Screen name="ExpenseHistory" component={ExpenseHistoryScreen} />
    </Stack.Navigator>
  );
};

const AnalyticsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AnalyticsHome" component={AnalyticsScreen} />
      <Stack.Screen name="HealthScoreDetail" component={HealthScoreDetailScreen} />
      <Stack.Screen name="CategoryBreakdown" component={CategoryBreakdownScreen} />
      <Stack.Screen name="BudgetingScreen" component={BudgetingScreen} />
      <Stack.Screen name="PredictionsScreen" component={PredictionsScreen} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="RecurringExpensesScreen" component={RecurringExpensesScreen} />
      <Stack.Screen name="ReportsScreen" component={ReportsScreen} />
      <Stack.Screen name="ExportsScreen" component={ExportsScreen} />
      <Stack.Screen name="BackupRestoreScreen" component={BackupRestoreScreen} />
      <Stack.Screen name="AIAdvisorScreen" component={AIAdvisorScreen} />
      <Stack.Screen name="RecurringAutomationScreen" component={RecurringAutomationScreen} />
    </Stack.Navigator>
  );
};

const GoalsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="GoalsHome" component={GoalsScreen} />
      <Stack.Screen name="AddGoal" component={AddGoalScreen} />
      <Stack.Screen name="GoalDetail" component={GoalDetailScreen} />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export const MainAppStack = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        tabBarLabel: undefined,
        tabBarIcon: ({ color }) => {
          const icons = {
            Dashboard: '🏠',
            Expenses: '💸',
            Analytics: '📊',
            Goals: '🎯',
            Profile: '👤',
          };
          return <Text style={{ fontSize: 20 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesStack}
        options={{ title: 'Expenses' }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsStack}
        options={{ title: 'Analytics' }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsStack}
        options={{ title: 'Goals' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};
