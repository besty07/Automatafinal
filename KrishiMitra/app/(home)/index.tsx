import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LangPicker from '@/components/lang-picker';
import { useLanguage } from '@/contexts/LanguageContext';

const GREEN = '#2D7A3A';
const LIGHT_GREEN_BG = '#E8F5E9';
const DARK_TEXT = '#1B2B1C';
const GRAY_TEXT = '#555';
const SCREEN_W = Dimensions.get('window').width;

const TICKER_ITEMS = [
  { name: 'Soybeans', price: '₹4,250', change: '+2.5%', up: true },
  { name: 'Sunflower', price: '₹6,800', change: '-1.2%', up: false },
  { name: 'Wheat', price: '₹2,500', change: '+0.8%', up: true },
  { name: 'Rice', price: '₹3,100', change: '-0.5%', up: false },
  { name: 'Cotton', price: '₹7,200', change: '+3.1%', up: true },
  { name: 'Maize', price: '₹1,980', change: '-1.8%', up: false },
];

export default function LoggedInHome() {
  const { t } = useLanguage();

  const HEDGING_STEPS = [
    { icon: 'grass' as const, text: t.step1 },
    { icon: 'calendar-today' as const, text: t.step2 },
    { icon: 'lock' as const, text: t.step3 },
    { icon: 'description' as const, text: t.step4 },
  ];

  const FEATURE_TILES = [
    { icon: 'receipt-long' as const, label: t.tileGovSchemes },
    { icon: 'cloud' as const, label: t.tileWeather },
    { icon: 'eco' as const, label: t.tileCropSeed },
    { icon: 'spa' as const, label: t.tileFertilizer },
  ];

  // ── Ticker animation ──
  const tickerX = useRef(new Animated.Value(0)).current;
  const TICKER_CONTENT_W = TICKER_ITEMS.length * 180;

  useEffect(() => {
    const animate = () => {
      tickerX.setValue(0);
      Animated.timing(tickerX, {
        toValue: -TICKER_CONTENT_W,
        duration: TICKER_ITEMS.length * 3000,
        useNativeDriver: true,
      }).start(() => animate());
    };
    animate();
    return () => tickerX.stopAnimation();
  }, []);

  return (
    <View style={styles.root}>
      {/* ── Top Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogoCircle}>
            <MaterialIcons name="trending-up" size={20} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Krishi-Mitra</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <MaterialIcons name="wb-sunny" size={20} color={DARK_TEXT} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <MaterialIcons name="language" size={20} color={DARK_TEXT} />
          </TouchableOpacity>
          <LangPicker />
          <TouchableOpacity style={styles.headerIcon}>
            <MaterialIcons name="person" size={20} color={DARK_TEXT} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Price Ticker ── */}
      <View style={styles.tickerContainer}>
        <Animated.View
          style={[styles.tickerRow, { transform: [{ translateX: tickerX }] }]}
        >
          {/* Duplicate for seamless loop */}
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <View key={i} style={styles.tickerItem}>
              <Text style={styles.tickerName}>{item.name} </Text>
              <Text style={styles.tickerPrice}>{item.price} </Text>
              <Text style={[styles.tickerChange, { color: item.up ? GREEN : '#E53935' }]}>
                {item.up ? '↑' : '↓'}{item.change}
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Steps card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.stepsTitle}</Text>
          {HEDGING_STEPS.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepIconCircle}>
                <MaterialIcons name={step.icon} size={20} color="#fff" />
              </View>
              <Text style={styles.stepText}>
                <Text style={styles.stepNum}>{i + 1}.  </Text>
                {step.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Start Hedging button */}
        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>{t.startHedging}</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Feature grid */}
        <View style={styles.grid}>
          {FEATURE_TILES.map((tile, i) => (
            <TouchableOpacity key={i} style={styles.tile} activeOpacity={0.8}>
              <View style={styles.tileIconCircle}>
                <MaterialIcons name={tile.icon} size={28} color="#fff" />
              </View>
              <Text style={styles.tileLabel}>{tile.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Historical Data – centered single tile */}
        <View style={styles.gridSingle}>
          <TouchableOpacity style={styles.tile} activeOpacity={0.8}>
            <View style={styles.tileIconCircle}>
              <MaterialIcons name="bar-chart" size={28} color="#fff" />
            </View>
            <Text style={styles.tileLabel}>{t.tileHistorical}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

const TILE_W = (SCREEN_W - 48) / 2;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_GREEN_BG },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: LIGHT_GREEN_BG,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerLogoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: GREEN },
  headerRight: { flexDirection: 'row', gap: 4 },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },

  /* Ticker */
  tickerContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  tickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    width: 148,
  },
  tickerName: { fontSize: 12, fontWeight: '600', color: DARK_TEXT },
  tickerPrice: { fontSize: 12, color: DARK_TEXT },
  tickerChange: { fontSize: 12, fontWeight: '700' },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  /* Card */
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: DARK_TEXT, marginBottom: 16 },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 14,
  },
  stepIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 15, color: DARK_TEXT, flex: 1 },
  stepNum: { fontWeight: '700' },

  /* Hedging button */
  primaryBtn: {
    backgroundColor: GREEN,
    borderRadius: 14,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  /* Feature grid */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  gridSingle: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tile: {
    width: TILE_W,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  tileIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tileLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: DARK_TEXT,
    textAlign: 'center',
    lineHeight: 18,
  },
});
