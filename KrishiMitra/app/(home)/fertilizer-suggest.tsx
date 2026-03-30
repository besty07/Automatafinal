import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import RenderHtml from 'react-native-render-html';

const GREEN = '#2D7A3A';
const LIGHT_GREEN_BG = '#E8F5E9';
const DARK_TEXT = '#1B2B1C';
const GRAY_TEXT = '#555';
const BORDER = '#C8E6C9';

export default function FertilizerSuggestScreen() {
  const { width } = useWindowDimensions();
  const [crop, setCrop] = useState('');
  const [nValue, setNValue] = useState('');
  const [pValue, setPValue] = useState('');
  const [kValue, setKValue] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState('');
  const [error, setError] = useState('');

  const getSuggestion = async () => {
    if (!crop || !nValue || !pValue || !kValue) {
      setError('Please fill out all fields');
      return;
    }

    setLoading(true);
    setError('');
    setAdvice('');

    try {
      // Connects to your live Render backend
      const response = await fetch('https://autometa-backend-16dv.onrender.com/api/fertilizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crop_name: crop.trim(),
          N: parseFloat(nValue),
          P: parseFloat(pValue),
          K: parseFloat(kValue),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAdvice(data.advice);
      } else {
        setError(data.error || 'Failed to get a recommendation.');
      }
    } catch (err) {
      setError('Could not connect to the server. Make sure you have an internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fertilizer Suggestor</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enter Soil Data</Text>

          <Text style={styles.label}>Crop Name</Text>
          <View style={styles.inputWrap}>
            <MaterialIcons name="grass" size={20} color={GREEN} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g., rice, maize, cotton"
              placeholderTextColor="#aaa"
              value={crop}
              onChangeText={setCrop}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Nitrogen (N)</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="0.0"
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                  value={nValue}
                  onChangeText={setNValue}
                />
              </View>
            </View>
            
            <View style={styles.halfInput}>
              <Text style={styles.label}>Phosphorus (P)</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="0.0"
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                  value={pValue}
                  onChangeText={setPValue}
                />
              </View>
            </View>
          </View>

          <Text style={styles.label}>Potassium (K)</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="0.0"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={kValue}
              onChangeText={setKValue}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.primaryBtn} onPress={getSuggestion} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>Get Recommendation</Text>
                <MaterialIcons name="science" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Card */}
        {advice ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <MaterialIcons name="check-circle" size={24} color={GREEN} />
              <Text style={styles.resultTitle}>Recommendation</Text>
            </View>
            
            <RenderHtml
              contentWidth={width - 80}
              source={{ html: advice }}
              baseStyle={{ fontSize: 15, color: DARK_TEXT, lineHeight: 22 }}
              tagsStyles={{
                i: { color: GREEN, fontWeight: 'bold' }
              }}
            />
          </View>
        ) : null}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_GREEN_BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: LIGHT_GREEN_BG },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: GREEN },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },

  card: { backgroundColor: '#fff', borderRadius: 20, padding: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: DARK_TEXT, marginBottom: 20 },
  
  label: { fontSize: 13, fontWeight: '600', color: DARK_TEXT, marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: BORDER, borderRadius: 12, backgroundColor: '#FAFFF9', paddingHorizontal: 12, marginBottom: 16, height: 50 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: DARK_TEXT },
  
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },

  errorText: { color: '#E53935', fontSize: 13, marginBottom: 12, textAlign: 'center' },

  primaryBtn: { backgroundColor: GREEN, borderRadius: 14, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: GREEN, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 5, elevation: 4, marginTop: 8 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  resultCard: { backgroundColor: '#E8F5E9', borderRadius: 20, padding: 22, borderWidth: 1.5, borderColor: GREEN },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#C8E6C9', paddingBottom: 12 },
  resultTitle: { fontSize: 18, fontWeight: '800', color: GREEN },
});