import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const GREEN        = '#2D7A3A';
const LIGHT_BG     = '#E8F5E9';
const DARK_TEXT    = '#1B2B1C';
const GRAY_TEXT    = '#5C6B5D';

export default function AgriSuggestScreen() {
  const { t } = useLanguage();
  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={GREEN} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerLogoCircle}>
            <MaterialIcons name="spa" size={18} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>{t.agriSuggestTitle}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t.agriSuggestSubtitle}</Text>

        {/* ── Fertilizer Suggestor ── */}
        <TouchableOpacity
          style={[styles.bigCard, { borderColor: '#2E7D32' }]}
          activeOpacity={0.88}
          onPress={() => router.push('/(home)/fertilizer-suggest' as any)}
        >
          <View style={[styles.cardIconCircle, { backgroundColor: '#2E7D32' }]}>
            <MaterialIcons name="water-drop" size={36} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>{t.fertSuggestorTitle}</Text>

          <View style={styles.divider} />

          <BulletPoint
            icon="science"
            text={t.fertSuggestorBullet1}
          />
          <BulletPoint
            icon="search"
            text={t.fertSuggestorBullet2}
          />
          <BulletPoint
            icon="recommend"
            text={t.fertSuggestorBullet3}
          />
          <BulletPoint
            icon="savings"
            text={t.fertSuggestorBullet4}
          />

          <View style={[styles.ctaRow, { backgroundColor: '#2E7D32' + '15' }]}>
            <Text style={[styles.ctaText, { color: '#2E7D32' }]}>{t.fertSuggestorCta}</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#2E7D32" />
          </View>
        </TouchableOpacity>

        {/* ── Crop Suggestor ── */}
        <TouchableOpacity
          style={[styles.bigCard, { borderColor: '#F57F17' }]}
          activeOpacity={0.88}
          onPress={() => router.push('/(home)/crop-suggest' as any)}
        >
          <View style={[styles.cardIconCircle, { backgroundColor: '#F57F17' }]}>
            <MaterialIcons name="grass" size={36} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>{t.cropSuggestorTitle}</Text>

          <View style={styles.divider} />

          <BulletPoint
            icon="thermostat"
            text={t.cropSuggestorBullet1}
          />
          <BulletPoint
            icon="bar-chart"
            text={t.cropSuggestorBullet2}
          />
          <BulletPoint
            icon="eco"
            text={t.cropSuggestorBullet3}
          />
          <BulletPoint
            icon="trending-up"
            text={t.cropSuggestorBullet4}
          />

          <View style={[styles.ctaRow, { backgroundColor: '#F57F17' + '15' }]}>
            <Text style={[styles.ctaText, { color: '#F57F17' }]}>{t.cropSuggestorCta}</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#F57F17" />
          </View>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function BulletPoint({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.bullet}>
      <MaterialIcons name={icon as any} size={16} color={GRAY_TEXT} style={{ marginTop: 1 }} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerLogoCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: GREEN,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: GREEN },

  /* Body */
  body: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 13.5,
    color: GRAY_TEXT,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 19,
  },

  /* Big card */
  bigCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 22,
    marginBottom: 18,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardIconCircle: {
    width: 68, height: 68, borderRadius: 34,
    alignSelf: 'center',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: DARK_TEXT,
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#E8F5E9',
    marginBottom: 14,
  },

  /* Bullets */
  bullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 13.5,
    color: GRAY_TEXT,
    lineHeight: 19,
  },

  /* CTA row */
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 8,
  },
  ctaText: { fontSize: 14, fontWeight: '700' },
});