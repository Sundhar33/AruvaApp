import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

const ReportsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.desc}>Monthly and category reports will appear here.</Text>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PredictionsScreen')}>
          <Text style={styles.buttonText}>Run Predictions (placeholder)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  desc: { color: Colors.textSecondary, marginBottom: 16 },
  button: { backgroundColor: Colors.primary, padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});

export default ReportsScreen;
