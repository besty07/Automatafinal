import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
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
import { db } from '../firebaseConfig';

// ─── Theme ──────────────────────────────────────────────────────────────────
const GREEN        = '#2D7A3A';
const LIGHT_BG     = '#E8F5E9';
const DARK_TEXT    = '#1B2B1C';
const GRAY_TEXT    = '#555';
const BORDER       = '#C8E6C9';
const CARD_BG      = '#fff';

// ─── Resource type ───────────────────────────────────────────────────────────
type ResourceType = 'shop' | 'event' | 'exhibition';

interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  category: string;
  description: string;
  baseAddress: string;
  timing: string;
  contact?: string;
  icon: string;
}

// ─── Seed data (written to Firestore once) ───────────────────────────────────
const SEED_RESOURCES = [
  // Shops
  {
    type: 'shop',
    name: 'Green Fields Fertilizer Store',
    category: 'Fertilizer',
    description: 'Full range of organic & chemical fertilizers, soil conditioners and nutrient supplements.',
    baseAddress: 'Near Bus Stand',
    timing: 'Mon – Sat  |  9 AM – 7 PM',
    contact: '+91 98765 43210',
    icon: 'water-drop',
  },
  {
    type: 'shop',
    name: 'Krishi Raksha Pesticides',
    category: 'Pesticides',
    description: 'Licensed stockist for all leading pesticide brands. Free spray demos available.',
    baseAddress: 'Agriculture Market Complex',
    timing: 'Mon – Sat  |  8 AM – 6 PM',
    contact: '+91 97654 32109',
    icon: 'pest-control',
  },
  {
    type: 'shop',
    name: 'Bharat Agro Tools',
    category: 'Tools & Equipment',
    description: 'Hand tools, sprayers, irrigation fittings, and small farm machinery on rent or purchase.',
    baseAddress: 'Main Market Road',
    timing: 'Mon – Sat  |  9 AM – 8 PM',
    contact: '+91 96543 21098',
    icon: 'hardware',
  },
  {
    type: 'shop',
    name: 'Satbeej Seeds Center',
    category: 'Seeds',
    description: 'Certified hybrid & open-pollinated seeds for Kharif and Rabi seasons.',
    baseAddress: 'Railway Station Road',
    timing: 'Mon – Sun  |  7 AM – 7 PM',
    contact: '+91 95432 10987',
    icon: 'eco',
  },
  {
    type: 'shop',
    name: 'Kisan Agro Center',
    category: 'Multi-purpose',
    description: 'One-stop shop: seeds, fertilizers, pesticides, tools and advisory services.',
    baseAddress: 'Collector Office Road',
    timing: 'Mon – Sun  |  8 AM – 8 PM',
    contact: '+91 94321 09876',
    icon: 'storefront',
  },
  // Events
  {
    type: 'event',
    name: 'Organic Farming Workshop',
    category: 'Education',
    description: 'Learn composting, bio-pesticides, and organic certification process from ICAR experts.',
    baseAddress: 'Agriculture College Campus',
    timing: '15 Mar 2026  |  10 AM – 4 PM',
    contact: 'Free Entry',
    icon: 'school',
  },
  {
    type: 'event',
    name: 'Soil Health Training Camp',
    category: 'Education',
    description: 'On-site soil testing + training on soil health card recommendations.',
    baseAddress: 'Zilla Parishad Hall',
    timing: '22 Mar 2026  |  9 AM – 1 PM',
    contact: 'Registration Required',
    icon: 'science',
  },
  {
    type: 'event',
    name: 'Drip & Sprinkler Irrigation Demo',
    category: 'Technical Training',
    description: 'Live demonstration by KVK officers on water-saving micro-irrigation setup.',
    baseAddress: 'Krishi Vigyan Kendra',
    timing: '29 Mar 2026  |  11 AM – 3 PM',
    contact: 'Free Entry',
    icon: 'water',
  },
  {
    type: 'event',
    name: 'PM-KISAN Beneficiary Camp',
    category: 'Government Scheme',
    description: 'Get enrolled in PM-KISAN, check payment status, and update eKYC on the spot.',
    baseAddress: 'Taluka Agriculture Office',
    timing: '5 Apr 2026  |  10 AM – 5 PM',
    contact: 'Free Entry',
    icon: 'account-balance',
  },
  // Exhibitions
  {
    type: 'exhibition',
    name: 'Agri Expo 2026',
    category: 'Exhibition',
    description: '200+ stalls of farm equipment, seeds, fertilizers and agri-tech startups. Lucky draw prizes for farmers.',
    baseAddress: 'District Sports Ground',
    timing: '10 – 12 Apr 2026  |  9 AM – 6 PM',
    contact: '₹20 Entry',
    icon: 'festival',
  },
  {
    type: 'exhibition',
    name: 'Kisan Mela 2026',
    category: 'Exhibition',
    description: 'Annual state-level farmer fair with live machinery demos, crop competitions and government stalls.',
    baseAddress: 'Agricultural University Campus',
    timing: '25 – 27 Apr 2026  |  8 AM – 7 PM',
    contact: 'Free Entry',
    icon: 'emoji-events',
  },
  {
    type: 'exhibition',
    name: 'Farm Machinery & Technology Show',
    category: 'Exhibition',
    description: 'Latest tractors, harvesters, drones and precision farming technology on display.',
    baseAddress: 'Industrial Exhibition Ground',
    timing: '5 – 6 May 2026  |  10 AM – 5 PM',
    contact: '₹50 Entry',
    icon: 'precision-manufacturing',
  },
];

// ─── Category accent colours ─────────────────────────────────────────────────
const TYPE_COLOR: Record<ResourceType, string> = {
  shop:       '#1565C0',
  event:      '#6A1B9A',
  exhibition: '#E65100',
};
const TYPE_LABEL: Record<ResourceType, string> = {
  shop:       'Shop',
  event:      'Event',
  exhibition: 'Exhibition',
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function ResourcesScreen() {
  const [city, setCity]           = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading]     = useState(false);
  const [seeding, setSeeding]     = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | ResourceType>('all');

  // ── Seed + load ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!submitted) return;
    setLoading(true);

    const unsub = onSnapshot(collection(db, 'resources'), async (snap) => {
      if (snap.empty && !seeding) {
        setSeeding(true);
        try {
          for (const r of SEED_RESOURCES) {
            await addDoc(collection(db, 'resources'), r);
          }
        } catch { /* silently handle seed errors */ }
        setSeeding(false);
        return;
      }
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Resource, 'id'>) }));
      setResources(data);
      setLoading(false);
    });

    return () => unsub();
  }, [submitted]);

  // ── Filtered list ────────────────────────────────────────────────────────
  const filtered = activeTab === 'all'
    ? resources
    : resources.filter((r) => r.type === activeTab);

  // ── City entry screen ────────────────────────────────────────────────────
  if (!submitted) {
    return (
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color={GREEN} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.headerLogoCircle}>
              <MaterialIcons name="place" size={18} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Resources Near You</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.cityScreenContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cityIllustration}>
            <MaterialIcons name="store" size={72} color={GREEN} />
          </View>
          <Text style={styles.cityHeading}>Where are you located?</Text>
          <Text style={styles.citySubtitle}>
            Enter your city or district to discover agri-shops, training events, and exhibitions nearby.
          </Text>

          <View style={styles.cityInputWrap}>
            <MaterialIcons name="location-city" size={22} color={GREEN} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.cityInput}
              placeholder="e.g. Satara, Pune, Nashik…"
              placeholderTextColor="#aaa"
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={() => city.trim() && setSubmitted(true)}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, !city.trim() && { opacity: 0.5 }]}
            disabled={!city.trim()}
            activeOpacity={0.85}
            onPress={() => setSubmitted(true)}
          >
            <MaterialIcons name="search" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>Find Resources</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Results screen ───────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => { setSubmitted(false); setCity(''); }}>
          <MaterialIcons name="arrow-back" size={22} color={GREEN} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerLogoCircle}>
            <MaterialIcons name="place" size={18} color="#fff" />
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>{city}</Text>
        </View>
        <TouchableOpacity
          style={styles.changeCityBtn}
          onPress={() => { setSubmitted(false); setCity(''); }}
        >
          <Text style={styles.changeCityText}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['all', 'shop', 'event', 'exhibition'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'all' ? 'All' : TYPE_LABEL[tab] + 's'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Body */}
      {loading || seeding ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={styles.loaderText}>Loading resources…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <MaterialIcons name="inbox" size={48} color={BORDER} />
              <Text style={styles.emptyText}>No resources found</Text>
            </View>
          ) : (
            filtered.map((r) => (
              <ResourceCard key={r.id} resource={r} city={city} />
            ))
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </View>
  );
}

// ─── Resource Card ────────────────────────────────────────────────────────────
function ResourceCard({ resource: r, city }: { resource: Resource; city: string }) {
  const accentColor = TYPE_COLOR[r.type];
  const fullAddress = `${r.baseAddress}, ${city}`;

  return (
    <View style={styles.card}>
      {/* Type badge */}
      <View style={[styles.badge, { backgroundColor: accentColor + '18' }]}>
        <View style={[styles.badgeDot, { backgroundColor: accentColor }]} />
        <Text style={[styles.badgeText, { color: accentColor }]}>
          {TYPE_LABEL[r.type]}  •  {r.category}
        </Text>
      </View>

      {/* Icon + name row */}
      <View style={styles.cardTopRow}>
        <View style={[styles.cardIconCircle, { backgroundColor: accentColor }]}>
          <MaterialIcons name={r.icon as any} size={22} color="#fff" />
        </View>
        <Text style={styles.cardName}>{r.name}</Text>
      </View>

      <Text style={styles.cardDesc}>{r.description}</Text>

      {/* Info rows */}
      <View style={styles.infoRow}>
        <MaterialIcons name="location-on" size={15} color={GREEN} />
        <Text style={styles.infoText}>{fullAddress}</Text>
      </View>
      <View style={styles.infoRow}>
        <MaterialIcons name="access-time" size={15} color={GREEN} />
        <Text style={styles.infoText}>{r.timing}</Text>
      </View>
      {r.contact ? (
        <View style={styles.infoRow}>
          <MaterialIcons name="info-outline" size={15} color={GREEN} />
          <Text style={styles.infoText}>{r.contact}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_BG },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: LIGHT_BG,
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginHorizontal: 8 },
  headerLogoCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: GREEN,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: GREEN, flexShrink: 1 },
  changeCityBtn: {
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: GREEN + '18',
    borderRadius: 10,
  },
  changeCityText: { fontSize: 13, fontWeight: '700', color: GREEN },

  /* ── City entry screen ── */
  cityScreenContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  cityIllustration: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: GREEN + '18',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  cityHeading: {
    fontSize: 22, fontWeight: '800', color: DARK_TEXT,
    marginBottom: 8, textAlign: 'center',
  },
  citySubtitle: {
    fontSize: 14, color: GRAY_TEXT, textAlign: 'center',
    lineHeight: 20, marginBottom: 28,
  },
  cityInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: BORDER,
    borderRadius: 14, backgroundColor: CARD_BG,
    paddingHorizontal: 14, height: 54,
    width: '100%', marginBottom: 16,
  },
  cityInput: { flex: 1, fontSize: 15, color: DARK_TEXT },
  primaryBtn: {
    backgroundColor: GREEN, borderRadius: 14,
    height: 52, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 8, width: '100%',
    shadowColor: GREEN, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  /* ── Tab bar ── */
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 6,
    backgroundColor: LIGHT_BG,
  },
  tab: {
    flex: 1, paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10, alignItems: 'center',
    borderWidth: 1.5, borderColor: BORDER,
  },
  tabActive: { backgroundColor: GREEN, borderColor: GREEN },
  tabText: { fontSize: 12, fontWeight: '600', color: GRAY_TEXT },
  tabTextActive: { color: '#fff' },

  /* ── Loader ── */
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText: { fontSize: 14, color: GRAY_TEXT },

  /* ── List ── */
  listContent: { paddingHorizontal: 14, paddingTop: 4 },
  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: GRAY_TEXT },

  /* ── Card ── */
  card: {
    backgroundColor: CARD_BG, borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
    marginBottom: 10, gap: 5,
  },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  cardTopRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 8,
  },
  cardIconCircle: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  cardName: { fontSize: 15, fontWeight: '800', color: DARK_TEXT, flex: 1 },
  cardDesc: { fontSize: 13, color: GRAY_TEXT, lineHeight: 18, marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  infoText: { fontSize: 12.5, color: DARK_TEXT, flex: 1, lineHeight: 16 },
});
