import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Linking } from 'react-native';

const GREEN = '#2D7A3A';
const LIGHT_GREEN_BG = '#E8F5E9';
const DARK_TEXT = '#1B2B1C';
const GRAY_TEXT = '#555';
const BORDER = '#C8E6C9';

interface Scheme {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  link: string;
}

const GOVERNMENT_SCHEMES: Scheme[] = [
  {
    id: '1',
    name: 'PM-KISAN scheme',
    description: 'Direct income support of ₹6000 annually to farmers',
    icon: 'attach-money',
    color: '#FF6B6B',
    link: 'https://pmkisan.gov.in/',
  },
  {
    id: '2',
    name: 'Kisan Credit Card (KCC)',
    description: 'Easy agricultural credit at low rates for farmers',
    icon: 'credit-card',
    color: '#4ECDC4',
    link: 'https://www.jansamarth.in/kisan-credit-card-scheme',
  },
  {
    id: '3',
    name: 'PM Kisan Maandhan Yojana',
    description: 'Monthly pension for farmers above 60 years',
    icon: 'people',
    color: '#95B85E',
    link: 'https://maandhan.in/',
  },
  {
    id: '4',
    name: 'PM Fasal Bima Yojana',
    description: 'Crop insurance against natural disasters & loss',
    icon: 'shield',
    color: '#FFB347',
    link: 'https://pmfby.gov.in/',
  },
  {
    id: '5',
    name: 'PM-KUSUM',
    description: 'Solar pump installation subsidy for farmers',
    icon: 'wb-sunny',
    color: '#9B59B6',
    link: 'https://pmkusum.mnre.gov.in/#/landing',
  },
  {
    id: '6',
    name: 'Agri Infrastructure Fund',
    description: 'Financing for farm infrastructure development',
    icon: 'domain',
    color: '#1ABC9C',
    link: 'https://agriinfra.dac.gov.in/',
  },
  {
    id: '7',
    name: 'Soil Health Card Scheme',
    description: 'Free soil testing & nutrient management guidance',
    icon: 'landscape',
    color: '#2ECC71',
    link: 'https://soilhealth.dac.gov.in/home',
  },
  {
    id: '8',
    name: 'Kisan Suvidha App/Portal',
    description: 'Real-time agricultural advisory & market info',
    icon: 'info',
    color: '#E74C3C',
    link: 'https://kisansuvidha.gov.in/',
  },
];

export default function GovSchemesScreen() {
  const handleOpenLink = (link: string) => {
    Linking.openURL(link).catch(err => console.error('Failed to open URL:', err));
  };

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Government Schemes</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Schemes Grid ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionDesc}>
          Explore financial aid, subsidies & schemes for agriculture
        </Text>

        <View style={styles.grid}>
          {GOVERNMENT_SCHEMES.map((scheme) => (
            <TouchableOpacity
              key={scheme.id}
              style={styles.schemeBlock}
              activeOpacity={0.85}
              onPress={() => handleOpenLink(scheme.link)}
            >
              {/* Icon Circle */}
              <View style={[styles.iconCircle, { backgroundColor: scheme.color }]}>
                <MaterialIcons name={scheme.icon} size={32} color="#fff" />
              </View>

              {/* Scheme Info */}
              <View style={styles.schemeContent}>
                <Text style={styles.schemeName}>{scheme.name}</Text>
                <Text style={styles.schemeDesc}>{scheme.description}</Text>
                <View style={styles.linkRow}>
                  <MaterialIcons name="open-in-new" size={14} color={GREEN} />
                  <Text style={styles.linkText}>Visit Scheme</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: LIGHT_GREEN_BG,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: LIGHT_GREEN_BG,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK_TEXT,
  },

  /* Scroll */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  /* Section Description */
  sectionDesc: {
    fontSize: 14,
    color: GRAY_TEXT,
    marginBottom: 16,
    fontWeight: '500',
  },

  /* Grid */
  grid: {
    gap: 12,
  },

  /* Scheme Block */
  schemeBlock: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: GREEN,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },

  /* Icon Circle */
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },

  /* Content */
  schemeContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  schemeName: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK_TEXT,
    marginBottom: 4,
  },
  schemeDesc: {
    fontSize: 12,
    color: GRAY_TEXT,
    marginBottom: 6,
  },

  /* Link Row */
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: 11,
    fontWeight: '600',
    color: GREEN,
  },
});
