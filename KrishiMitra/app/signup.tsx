import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useState } from 'react';

import { Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig'; 

import LangPicker from '@/components/lang-picker';
import { useLanguage } from '@/contexts/LanguageContext';
import {
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
const LIGHT_GREEN_BG = '#E8F5E9';
const DARK_TEXT = '#1B2B1C';
const GRAY_TEXT = '#555';
const BORDER = '#C8E6C9';

export default function SignupScreen() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhar, setAadhar] = useState(''); // Added Aadhaar state
  const [state, setState] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignup = async () => {
    // 1. Check if all fields are filled
    if (!phone || !password || !name || !aadhar || !state) {
      Alert.alert("Error", "Please fill out all required fields.");
      return;
    }

    // 2. Format validation
    if (phone.length !== 10) {
      Alert.alert("Invalid Input", "Phone number must be exactly 10 digits.");
      return;
    }
    if (aadhar.length !== 12) {
      Alert.alert("Invalid Input", "Aadhaar number must be exactly 12 digits.");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    // 3. Create a dummy email behind the scenes for Firebase Auth
    const authEmail = `${phone}@krishimitra.com`;

    try {
      // 4. Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
      const user = userCredential.user;

      // 5. Save additional user details in Firestore Database
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        phone: phone,
        aadhar: aadhar,
        state: state,
        createdAt: new Date(),
      });

      Alert.alert("Success", "Account created successfully!");
      router.replace('/login' as any);
      
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={GREEN} />
        </TouchableOpacity>

        <View style={styles.langRow}>
          <LangPicker />
        </View>

        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="trending-up" size={38} color="#fff" />
          </View>
          <Text style={styles.appTitle}>Krishi-Mitra</Text>
          <Text style={styles.appSubtitle}>{t.joinFarmers}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.createAccount}</Text>

          <InputField
            label={t.fullName}
            icon="person"
            placeholder={t.fullNamePlaceholder}
            value={name}
            onChangeText={setName}
          />

          <InputField
            label={t.phoneNumber}
            icon="phone"
            placeholder={t.phonePlaceholder}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10} // Limits input length visually
          />

          {/* New Aadhaar Input Field */}
          <InputField
            label={t.aadharNumber || "Aadhaar Number"} // Falls back to English if translation missing
            icon="credit-card"
            placeholder="Enter 12-digit Aadhaar"
            value={aadhar}
            onChangeText={setAadhar}
            keyboardType="numeric"
            maxLength={12} // Limits input length visually
          />

          <InputField
            label={t.stateDistrict}
            icon="location-on"
            placeholder={t.statePlaceholder}
            value={state}
            onChangeText={setState}
          />

          <Text style={styles.label}>{t.createPassword}</Text>
          <View style={styles.inputWrap}>
            <MaterialIcons name="lock" size={20} color={GREEN} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={t.createPasswordPlaceholder}
              placeholderTextColor="#aaa"
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <MaterialIcons name={showPass ? 'visibility' : 'visibility-off'} size={20} color="#888" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{t.confirmPassword}</Text>
          <View style={styles.inputWrap}>
            <MaterialIcons name="lock-outline" size={20} color={GREEN} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={t.confirmPlaceholder}
              placeholderTextColor="#aaa"
              secureTextEntry={!showConfirm}
              value={confirm}
              onChangeText={setConfirm}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
              <MaterialIcons name={showConfirm ? 'visibility' : 'visibility-off'} size={20} color="#888" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSignup} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>{t.createAccountBtn}</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.terms}>
            {t.termsText} <Text style={styles.termsLink}>{t.termsService}</Text> {t.and} <Text style={styles.termsLink}>{t.privacyPolicy}</Text>
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>{t.haveAccount} </Text>
          <TouchableOpacity onPress={() => router.replace('/login' as any)}>
            <Text style={styles.linkText}>{t.login}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({ label, icon, placeholder, value, onChangeText, keyboardType = 'default', maxLength }: any) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <MaterialIcons name={icon} size={20} color={GREEN} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#aaa"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_GREEN_BG },
  langRow: { alignItems: 'flex-end', marginBottom: 8 },
  scroll: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 32 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  hero: { alignItems: 'center', marginBottom: 24 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 5, elevation: 5 },
  appTitle: { fontSize: 26, fontWeight: '800', color: GREEN, marginBottom: 4 },
  appSubtitle: { fontSize: 13, color: GRAY_TEXT },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: DARK_TEXT, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: DARK_TEXT, marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: BORDER, borderRadius: 12, backgroundColor: '#FAFFF9', paddingHorizontal: 12, marginBottom: 16, height: 50 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: DARK_TEXT },
  eyeBtn: { padding: 4 },
  primaryBtn: { backgroundColor: GREEN, borderRadius: 14, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, shadowColor: GREEN, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 5, elevation: 4 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  terms: { fontSize: 11.5, color: '#999', textAlign: 'center', marginTop: 14, lineHeight: 17 },
  termsLink: { color: GREEN, fontWeight: '600' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  bottomText: { fontSize: 14, color: GRAY_TEXT },
  linkText: { fontSize: 14, color: GREEN, fontWeight: '700' },
});