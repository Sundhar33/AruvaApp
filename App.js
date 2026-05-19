import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { FinanceProvider } from './src/context/FinanceContext';
import { BudgetProvider } from './src/context/BudgetContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <FinanceProvider>
          <BudgetProvider>
            <RootNavigator />
          </BudgetProvider>
        </FinanceProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
