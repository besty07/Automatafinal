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
} from 'react-native';

const GREEN = '#2D7A3A';
const LIGHT_BG = '#E8F5E9';
const DARK_TEXT = '#1B2B1C';
const BORDER = '#C8E6C9';
const ORANGE = '#F57F17'; 

export default function CropSuggestScreen() {
  const [city, setCity] = useState('');
  const [nValue, setNValue] = useState('');
  const [pValue, setPValue] = useState('');
  const [kValue, setKValue] = useState('');
  const [phValue, setPhValue] = useState('');
  const [rainfallValue, setRainfallValue] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState('');
  const [error, setError] = useState('');

  const getSuggestion = async () => {
    if (!city || !nValue || !pValue || !kValue || !phValue || !rainfallValue) {
      setError('Please fill out all fields so our ML model can make an accurate prediction.');
      return;
    }

    setLoading(true);
    setError('');
    setPrediction('');

    try {
      // Connects to your live Render backend
      const response = await fetch('https://autometa-backend-16dv.onrender.com/api/crop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          N: parseFloat(nValue),
          P: parseFloat(pValue),
          K: parseFloat(kValue),
          ph: parseFloat(phValue),
          rainfall: parseFloat(rainfallValue),
          city: city.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPrediction(data.crop);
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
        <Text style={styles.headerTitle}>Crop Suggestor</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enter Farm Details</Text>

          <Text style={styles.label}>City / Location</Text>
          <View style={styles.inputWrap}>
            <MaterialIcons name="location-city" size={20} color={ORANGE} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g., Pune (Used for Weather Data)"
              placeholderTextColor="#aaa"
              value={city}
              onChangeText={setCity}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Nitrogen (N)</Text>
              <View style={styles.inputWrap}>
                <TextInput style={styles.input} placeholder="0.0" placeholderTextColor="#aaa" keyboardType="numeric" value={nValue} onChangeText={setNValue} />
              </View>
            </View>
            
            <View style={styles.halfInput}>
              <Text style={styles.label}>Phosphorus (P)</Text>
              <View style={styles.inputWrap}>
                <TextInput style={styles.input} placeholder="0.0" placeholderTextColor="#aaa" keyboardType="numeric" value={pValue} onChangeText={setPValue} />
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Potassium (K)</Text>
              <View style={styles.inputWrap}>
                <TextInput style={styles.input} placeholder="0.0" placeholderTextColor="#aaa" keyboardType="numeric" value={kValue} onChangeText={setKValue} />
              </View>
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Soil pH Level</Text>
              <View style={styles.inputWrap}>
                <TextInput style={styles.input} placeholder="e.g. 6.5" placeholderTextColor="#aaa" keyboardType="numeric" value={phValue} onChangeText={setPhValue} />
              </View>
            </View>
          </View>

          <Text style={styles.label}>Rainfall (in mm)</Text>
          <View style={styles.inputWrap}>
            <MaterialIcons name="water-drop" size={20} color={ORANGE} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g., 200"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={rainfallValue}
              onChangeText={setRainfallValue}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.primaryBtn} onPress={getSuggestion} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>Predict Best Crop</Text>
                <MaterialIcons name="eco" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Card */}
        {prediction ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <MaterialIcons name="stars" size={28} color={ORANGE} />
              <Text style={styles.resultTitle}>Best Crop for You</Text>
            </View>
            
            <Text style={styles.predictionText}>
              Based on our AI analysis of your soil and weather, we highly recommend planting:
            </Text>
            <View style={styles.highlightBox}>
              <Text style={styles.cropName}>{prediction.toUpperCase()}</Text>
            </View>
          </View>
        ) : null}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: LIGHT_BG },
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

  errorText: { color: '#E53935', fontSize: 13, marginBottom: 12, textAlign: 'center', fontWeight: '500' },

  primaryBtn: { backgroundColor: ORANGE, borderRadius: 14, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: ORANGE, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 5, elevation: 4, marginTop: 8 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  resultCard: { backgroundColor: '#FFF3E0', borderRadius: 20, padding: 24, borderWidth: 1.5, borderColor: ORANGE, alignItems: 'center' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  resultTitle: { fontSize: 20, fontWeight: '800', color: ORANGE },
  predictionText: { fontSize: 15, color: '#5D4037', textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  highlightBox: { backgroundColor: ORANGE, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12, shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 5 },
  cropName: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: 1 },
});