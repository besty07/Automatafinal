import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useState } from 'react';
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

const BLUE = '#1A5276';
const LIGHT_BLUE_BG = '#EAF2F8';
const DARK_TEXT = '#1B2340';
const GRAY_TEXT = '#555';
const BORDER = '#AED6F1';

export default function DealerLoginScreen() {
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    // TODO: dealer authentication
    router.replace('/(home)' as any);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={BLUE} />
        </TouchableOpacity>

        {/* Lang picker top-right */}
        <View style={styles.langRow}>
          <LangPicker />
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="storefront" size={38} color="#fff" />
          </View>
          <Text style={styles.appTitle}>Krishi-Mitra</Text>

          {/* Dealer badge */}
          <View style={styles.dealerBadge}>
            <MaterialIcons name="business" size={13} color={BLUE} />
            <Text style={styles.dealerBadgeText}>DEALER PORTAL</Text>
          </View>

          <Text style={styles.appSubtitle}>{t.dealerWelcome}</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.dealerLoginTitle}</Text>

          {/* Email */}
          <Text style={styles.label}>{t.dealerIdEmail}</Text>
          <View style={styles.inputWrap}>
            <MaterialIcons name="store" size={20} color={BLUE} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t.dealerIdPlaceholder}
              placeholderTextColor="#aaa"
              keyboardType="default"
              value={phone}
              onChangeText={setPhone}
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>{t.password}</Text>
          <View style={styles.inputWrap}>
            <MaterialIcons name="lock" size={20} color={BLUE} style={styles.inputIcon} />
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

          {/* Login button */}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>{t.dealerLoginBtn}</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>{t.orDivider}</Text>
            <View style={styles.divider} />
          </View>

          {/* Info note */}
          <View style={styles.noteBox}>
            <MaterialIcons name="info-outline" size={16} color={BLUE} />
            <Text style={styles.noteText}>{t.dealerNote}</Text>
          </View>
        </View>

        {/* Sign up redirect */}
        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>{t.dealerNoAccount}</Text>
          <TouchableOpacity onPress={() => router.replace('/dealer-signup' as any)}>
            <Text style={styles.linkText}>{t.dealerRegister}</Text>
          </TouchableOpacity>
        </View>

        {/* Farmer login redirect */}
        <View style={styles.switchRow}>
          <MaterialIcons name="agriculture" size={14} color={GRAY_TEXT} />
          <Text style={styles.switchText}>{t.farmerInstead} </Text>
          <TouchableOpacity onPress={() => router.replace('/login' as any)}>
            <Text style={styles.switchLink}>{t.farmerLogin}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_BLUE_BG },
  scroll: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 32 },
  langRow: { alignItems: 'flex-end', marginBottom: 8 },

  backBtn: {
    position: 'absolute',
    top: 52,
    left: 20,
    zIndex: 10,
    padding: 4,
  },

  /* Hero */
  hero: { alignItems: 'center', marginTop: 24, marginBottom: 28 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  appTitle: { fontSize: 28, fontWeight: '800', color: BLUE, letterSpacing: 0.5 },
  dealerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D6EAF8',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 6,
    borderWidth: 1,
    borderColor: BLUE,
  },
  dealerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: BLUE,
    letterSpacing: 1,
  },
  appSubtitle: { fontSize: 14, color: GRAY_TEXT, marginTop: 8, textAlign: 'center' },

  /* Card */
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
    borderTopWidth: 4,
    borderTopColor: BLUE,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: DARK_TEXT, marginBottom: 20 },

  /* Labels & Inputs */
  label: { fontSize: 13, fontWeight: '600', color: DARK_TEXT, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F4F9FC',
    marginBottom: 16,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: DARK_TEXT },
  eyeBtn: { padding: 4, marginLeft: 4 },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 13, color: BLUE, fontWeight: '600' },

  /* Primary button */
  primaryBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  /* Divider */
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18, gap: 10 },
  divider: { flex: 1, height: 1, backgroundColor: '#D5E8F5' },
  dividerText: { fontSize: 12, color: GRAY_TEXT, fontWeight: '600' },

  /* Note box */
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EAF2F8',
    borderRadius: 10,
    padding: 12,
  },
  noteText: { flex: 1, fontSize: 13, color: GRAY_TEXT, lineHeight: 18 },

  /* Bottom links */
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  bottomText: { fontSize: 14, color: GRAY_TEXT },
  linkText: { fontSize: 14, color: BLUE, fontWeight: '700' },

  /* Switch to farmer */
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D5E8F5',
    marginBottom: 8,
  },
  switchText: { fontSize: 13, color: GRAY_TEXT },
  switchLink: { fontSize: 13, color: '#2D7A3A', fontWeight: '700' },
});
