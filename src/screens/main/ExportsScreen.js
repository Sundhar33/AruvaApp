import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { exportExpensesCSV } from '../../services/export';

const ExportsScreen = () => {
  const handleExport = async () => {
    try {
      const path = await exportExpensesCSV();
      Alert.alert('Exported', `CSV saved to ${path}`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Export failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Export</Text>
        <Text style={styles.desc}>Export your expenses as CSV for backup or analysis.</Text>

        <TouchableOpacity style={styles.button} onPress={handleExport}>
          <Text style={styles.buttonText}>Export CSV</Text>
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

export default ExportsScreen;
