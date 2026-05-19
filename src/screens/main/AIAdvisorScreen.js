import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { getAIRecommendations } from '../../services/aiAdvisor';

const AIAdvisorScreen = () => {
  const [tips, setTips] = useState([]);

  const loadTips = async () => {
    const recs = await getAIRecommendations();
    setTips(recs);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>AI Advisor</Text>
        <Text style={styles.desc}>Personalized tips and budget recommendations.</Text>

        <TouchableOpacity style={styles.button} onPress={loadTips}>
          <Text style={styles.buttonText}>Get Recommendations</Text>
        </TouchableOpacity>

        {tips.map((t, i) => (
          <View key={i} style={styles.tipCard}>
            <Text style={styles.tipText}>{t}</Text>
          </View>
        ))}
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
  tipCard: { backgroundColor: Colors.card, padding: 10, borderRadius: 8, marginTop: 12 },
  tipText: { color: Colors.text },
});

export default AIAdvisorScreen;
