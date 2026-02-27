import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
// ── VOICE RECOGNITION (commented out until dev build) ──────────────────────
// import {
//   ExpoSpeechRecognitionModule,
//   useSpeechRecognitionEvent,
// } from 'expo-speech-recognition';
// ───────────────────────────────────────────────────────────────────────────
import LangPicker from '@/components/lang-picker';
import { useLanguage } from '@/contexts/LanguageContext';
import React, { useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const GREEN = '#2D7A3A';
const LIGHT_GREEN_BG = '#E8F5E9';
const CARD_BG = '#FFFFFF';
const BLUE_TEXT = '#1A6B8A';
const GRAY_TEXT = '#555';
const DARK_TEXT = '#1B2B1C';
const EXAMPLE_BG = '#F0F0F0';

// ── VOICE COMMANDS (commented out until dev build) ─────────────────────────
// function processCommand(text: string) {
//   const cmd = text.toLowerCase().trim();
//   if (cmd.includes('login') || cmd.includes('log in')) {
//     router.push('/login' as any);
//     return true;
//   }
//   if (cmd.includes('sign up') || cmd.includes('signup') || cmd.includes('register')) {
//     router.push('/signup' as any);
//     return true;
//   }
//   return false;
// }
// ───────────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  // const [listening, setListening] = useState(false);
  const { t } = useLanguage();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ── VOICE RECOGNITION HOOKS (commented out until dev build) ──────────────
  // useSpeechRecognitionEvent('start', () => setListening(true));
  // useSpeechRecognitionEvent('end', () => { setListening(false); stopPulse(); });
  // useSpeechRecognitionEvent('result', (event) => {
  //   const transcript = (event.results?.[0]?.transcript ?? '').toLowerCase().trim();
  //   if (transcript.length === 0) return;
  //   const handled = processCommand(transcript);
  //   if (!handled) {
  //     Alert.alert('Command not recognised', `You said: "${transcript}"\n\nTry: "login" or "sign up"`);
  //   }
  // });
  // useSpeechRecognitionEvent('error', (event) => {
  //   setListening(false); stopPulse();
  //   if (event.error !== 'aborted') Alert.alert('Mic error', event.error);
  // });
  // ─────────────────────────────────────────────────────────────────────────

  // ── VOICE HANDLER (commented out until dev build) ─────────────────────────
  // const handleVoice = async () => {
  //   if (listening) { ExpoSpeechRecognitionModule.stop(); return; }
  //   const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  //   if (!granted) { Alert.alert('Permission required', 'Mic permission needed.'); return; }
  //   startPulse();
  //   ExpoSpeechRecognitionModule.start({ lang: 'en-US', continuous: false, interimResults: false });
  // };
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      {/* Scrollable content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <LangPicker />
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.signUpBtn} onPress={() => router.push('/signup' as any)}>
              <Text style={styles.signUpText}>{t.signUp}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login' as any)}>
              <Text style={styles.loginText}>{t.login}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Logo & Title ── */}
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="trending-up" size={36} color="#fff" />
          </View>
          <Text style={styles.appTitle}>Krishi-Mitra</Text>
          <Text style={styles.appSubtitle}>{t.appSubtitle}</Text>
        </View>

        {/* ── Our Mission Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.ourMission}</Text>
          <Text style={styles.missionDesc}>{t.missionDesc}</Text>

          <FeatureRow icon="security" title={t.priceProtection} desc={t.priceProtectionDesc} />
          <FeatureRow icon="grass" title={t.govSchemes} desc={t.govSchemesDesc} />
          <FeatureRow icon="people" title={t.expertSupport} desc={t.expertSupportDesc} />
        </View>

        {/* ── What is Hedging Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.whatIsHedging}</Text>
          <Text style={styles.hedgingDesc}>{t.hedgingDesc}</Text>

          <Text style={styles.howTitle}>{t.howItWorks}</Text>
          <BulletItem text={t.bullet1} />
          <BulletItem text={t.bullet2} />
          <BulletItem text={t.bullet3} />
          <BulletItem text={t.bullet4} />

          <View style={styles.exampleBox}>
            <Text style={styles.exampleText}>
              <Text style={styles.exampleBold}>{t.exampleLabel}</Text>
              {t.exampleText}
            </Text>
          </View>
        </View>

        {/* ── Dealer Section ── */}
        <View style={styles.dealerCard}>
          <View style={styles.dealerCardHeader}>
            <View style={styles.dealerIconCircle}>
              <MaterialIcons name="storefront" size={26} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dealerCardTitle}>{t.dealerSectionTitle}</Text>
              <View style={styles.dealerBadge}>
                <MaterialIcons name="business" size={11} color="#1A5276" />
                <Text style={styles.dealerBadgeText}>DEALER PORTAL</Text>
              </View>
            </View>
          </View>
          <Text style={styles.dealerCardDesc}>{t.dealerSectionDesc}</Text>
          <View style={styles.dealerBtnRow}>
            <TouchableOpacity
              style={styles.dealerSignUpBtn}
              onPress={() => router.push('/dealer-signup' as any)}
              activeOpacity={0.85}
            >
              <MaterialIcons name="person-add" size={16} color="#1A5276" />
              <Text style={styles.dealerSignUpText}>{t.dealerSignUpLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dealerLoginBtn}
              onPress={() => router.push('/dealer-login' as any)}
              activeOpacity={0.85}
            >
              <MaterialIcons name="login" size={16} color="#fff" />
              <Text style={styles.dealerLoginText}>{t.dealerLoginLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom padding so FAB doesn't cover last card */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── Floating "Tap to Speak" button ── */}
      <View style={styles.fabContainer}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          {/* Voice handler disabled until dev build — swap onPress={handleVoice} when ready */}
          <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => {}}>            
            <MaterialIcons name="mic" size={20} color="#fff" />
            <Text style={styles.fabText}>{t.tapToSpeak}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

/* ─── Sub-components ─── */

function FeatureRow({
  icon,
  title,
  desc,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  desc: string;
}) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIconWrap}>
        <MaterialIcons name={icon} size={22} color={GREEN} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function BulletItem({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

/* ─── Styles ─── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: LIGHT_GREEN_BG,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  signUpBtn: {
    borderWidth: 1.5,
    borderColor: GREEN,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  signUpText: {
    color: GREEN,
    fontWeight: '600',
    fontSize: 13,
  },
  loginBtn: {
    backgroundColor: GREEN,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  loginText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },

  /* Hero */
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: GREEN,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 13,
    color: GRAY_TEXT,
    textAlign: 'center',
  },

  /* Cards */
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK_TEXT,
    marginBottom: 8,
  },

  /* Mission */
  missionDesc: {
    fontSize: 13.5,
    color: BLUE_TEXT,
    lineHeight: 20,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK_TEXT,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12.5,
    color: GRAY_TEXT,
    lineHeight: 18,
  },

  /* Hedging */
  hedgingDesc: {
    fontSize: 13.5,
    color: BLUE_TEXT,
    lineHeight: 20,
    marginBottom: 12,
  },
  howTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK_TEXT,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 6,
  },
  bullet: {
    fontSize: 14,
    color: DARK_TEXT,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: GRAY_TEXT,
    lineHeight: 20,
  },
  exampleBox: {
    backgroundColor: EXAMPLE_BG,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  exampleText: {
    fontSize: 12.5,
    color: GRAY_TEXT,
    lineHeight: 19,
  },
  exampleBold: {
    fontWeight: '700',
    color: DARK_TEXT,
  },

  /* FAB */
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN,
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  // fabListening: { backgroundColor: '#E53935' }, // uncomment with voice recognition
  fabText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  /* Dealer section card */
  dealerCard: {
    backgroundColor: '#EAF2F8',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#AED6F1',
  },
  dealerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  dealerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A5276',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealerCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B2340',
    marginBottom: 4,
  },
  dealerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#D6EAF8',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#1A5276',
  },
  dealerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1A5276',
    letterSpacing: 0.8,
  },
  dealerCardDesc: {
    fontSize: 13,
    color: GRAY_TEXT,
    lineHeight: 19,
    marginBottom: 14,
  },
  dealerBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dealerSignUpBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#1A5276',
    borderRadius: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  dealerSignUpText: {
    color: '#1A5276',
    fontWeight: '700',
    fontSize: 13,
  },
  dealerLoginBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1A5276',
    borderRadius: 12,
    paddingVertical: 10,
  },
  dealerLoginText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
