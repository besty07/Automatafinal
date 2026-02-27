import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import {
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

export default function HomeScreen() {
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
          <View style={styles.langBtn}>
            <MaterialIcons name="language" size={16} color={DARK_TEXT} />
            <Text style={styles.langText}>EN</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.signUpBtn}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginBtn}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Logo & Title ── */}
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="trending-up" size={36} color="#fff" />
          </View>
          <Text style={styles.appTitle}>Krishi-Mitra</Text>
          <Text style={styles.appSubtitle}>Your Trusted Agricultural Finance Partner</Text>
        </View>

        {/* ── Our Mission Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Mission</Text>
          <Text style={styles.missionDesc}>
            Empowering farmers with financial tools to protect their income against price
            fluctuations and access government schemes easily.
          </Text>

          <FeatureRow
            icon="security"
            title="Price Protection"
            desc="Secure your crop prices in advance and reduce financial risks"
          />
          <FeatureRow
            icon="grass"
            title="Government Schemes"
            desc="Easy access to subsidies, insurance, and financial assistance"
          />
          <FeatureRow
            icon="people"
            title="Expert Support"
            desc="24/7 assistance in your preferred language"
          />
        </View>

        {/* ── What is Hedging Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What is Hedging?</Text>
          <Text style={styles.hedgingDesc}>
            Hedging is a financial strategy to protect your income from unpredictable market price
            changes.
          </Text>

          <Text style={styles.howTitle}>How It Works:</Text>
          <BulletItem text="Lock in crop prices before harvest to avoid losses" />
          <BulletItem text="Protect against market volatility and weather risks" />
          <BulletItem text="Plan your finances with guaranteed minimum prices" />
          <BulletItem text="Access expert market insights and price predictions" />

          <View style={styles.exampleBox}>
            <Text style={styles.exampleText}>
              <Text style={styles.exampleBold}>Example: </Text>
              If wheat is ₹2,500/qtl today, you can lock this price for your harvest 3 months from
              now. Even if market price drops to ₹2,000, you still get ₹2,500.
            </Text>
          </View>
        </View>

        {/* Bottom padding so FAB doesn't cover last card */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── Floating "Tap to Speak" button ── */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab}>
          <MaterialIcons name="mic" size={20} color="#fff" />
          <Text style={styles.fabText}>Tap to Speak</Text>
        </TouchableOpacity>
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
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
    backgroundColor: '#fff',
  },
  langText: {
    fontSize: 13,
    color: DARK_TEXT,
    fontWeight: '600',
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
  fabText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
