import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { createBackup, restoreBackup } from '../../services/backup';

const BackupRestoreScreen = () => {
  const handleBackup = async () => {
    try {
      const path = await createBackup();
      Alert.alert('Backup created', `Saved to ${path}`);
    } catch (e) {
      Alert.alert('Error', e.message || 'Backup failed');
    }
  };

  const handleRestore = async () => {
    try {
      await restoreBackup();
      Alert.alert('Restore', 'Backup restored (placeholder)');
    } catch (e) {
      Alert.alert('Error', e.message || 'Restore failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Backup & Restore</Text>
        <Text style={styles.desc}>Create a local JSON backup or restore from one.</Text>

        <TouchableOpacity style={styles.button} onPress={handleBackup}>
          <Text style={styles.buttonText}>Create Backup</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { marginTop: 12, backgroundColor: Colors.warning }]} onPress={handleRestore}>
          <Text style={styles.buttonText}>Restore Backup</Text>
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

export default BackupRestoreScreen;
