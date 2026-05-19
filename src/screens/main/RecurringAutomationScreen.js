import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { detectRecurring } from '../../services/recurring';

const RecurringAutomationScreen = () => {
  const runDetect = async () => {
    const found = await detectRecurring();
    // simple placeholder alert / log
    console.log('Recurring detected:', found);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Recurring Automation</Text>
        <Text style={styles.desc}>Detect and manage recurring expenses.</Text>

        <TouchableOpacity style={styles.button} onPress={runDetect}>
          <Text style={styles.buttonText}>Detect Recurring</Text>
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

export default RecurringAutomationScreen;
