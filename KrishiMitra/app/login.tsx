import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Ensure this path matches your file structure
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
import LangPicker from '@/components/lang-picker';
import { useLanguage } from '@/contexts/LanguageContext';

const GREEN = '#2D7A3A';
const LIGHT_GREEN_BG = '#E8F5E9';
const DARK_TEXT = '#1B2B1C';
const GRAY_TEXT = '#555';
const BORDER = '#C8E6C9';

export default function LoginScreen() {

  const [email, setEmail] = useState(''); // Changed from 'phone' to 'email' for Firebase compatibility
  const { t } = useLanguage();
//   const [phone, setPhone] = useState('');

  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      // Authenticate with Firebase
      await signInWithEmailAndPassword(auth, email, password);
      
      // Navigate to post-login home
      router.replace('/(home)' as any);
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={GREEN} />
        </TouchableOpacity>

        {/* Lang picker top-right */}
        <View style={styles.langRow}>
          <LangPicker />
        </View>

        {/* Logo */}
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="trending-up" size={38} color="#fff" />
          </View>
          <Text style={styles.appTitle}>Krishi-Mitra</Text>
          <Text style={styles.appSubtitle}>{t.welcomeBack}</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.loginToAccount}</Text>


          {/* Email */}
          <Text style={styles.label}>{t.phoneEmail}</Text>


          <View style={styles.inputWrap}>
            <MaterialIcons name="email" size={20} color={GREEN} style={styles.inputIcon} />
            <TextInput
              style={styles.input}

              placeholder={t.phoneEmailPlaceholder}

              placeholderTextColor="#aaa"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>{t.password}</Text>
          <View style={styles.inputWrap}>
            <MaterialIcons name="lock" size={20} color={GREEN} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={t.passwordPlaceholder}
              placeholderTextColor="#aaa"
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <MaterialIcons
                name={showPass ? 'visibility' : 'visibility-off'}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>{t.forgotPassword}</Text>
          </TouchableOpacity>

          {/* Login btn */}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>{t.loginBtn}</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>{t.orDivider}</Text>
            <View style={styles.divider} />
          </View>

          {/* Guest option */}
          <TouchableOpacity style={styles.guestBtn} onPress={() => router.replace('/(home)' as any)}>
            <MaterialIcons name="person-outline" size={18} color={GREEN} />
            <Text style={styles.guestText}>{t.continueGuest}</Text>
          </TouchableOpacity>
        </View>

        {/* Sign up redirect */}
        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>{t.noAccount}</Text>
          <TouchableOpacity onPress={() => router.replace('/signup' as any)}>
            <Text style={styles.linkText}>{t.signUp}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_GREEN_BG },
  scroll: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 32 },
  langRow: { alignItems: 'flex-end', marginBottom: 8 },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  hero: { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 5,
  },
  appTitle: { fontSize: 28, fontWeight: '800', color: GREEN, marginBottom: 4 },
  appSubtitle: { fontSize: 14, color: GRAY_TEXT },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: DARK_TEXT, marginBottom: 20 },

  label: { fontSize: 13, fontWeight: '600', color: DARK_TEXT, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: '#FAFFF9',
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 50,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: DARK_TEXT },
  eyeBtn: { padding: 4 },

  forgotWrap: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -8 },
  forgotText: { fontSize: 12.5, color: GREEN, fontWeight: '600' },

  primaryBtn: {
    backgroundColor: GREEN,
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  divider: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  dividerText: { marginHorizontal: 12, color: '#aaa', fontSize: 12, fontWeight: '600' },

  guestBtn: {
    borderWidth: 1.5,
    borderColor: GREEN,
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  guestText: { color: GREEN, fontSize: 14, fontWeight: '600' },

  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  bottomText: { fontSize: 14, color: GRAY_TEXT },
  linkText: { fontSize: 14, color: GREEN, fontWeight: '700' },
});