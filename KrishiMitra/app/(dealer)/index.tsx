import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LangPicker from '@/components/lang-picker';
import { useLanguage } from '@/contexts/LanguageContext';

const BLUE = '#1A5276';
const LIGHT_BLUE_BG = '#EAF2F8';
const DARK_TEXT = '#1B2340';
const GRAY_TEXT = '#555';

// ── Mock data: deals submitted by farmers ──────────────────────────────────
const MOCK_DEALS = [
  {
    id: '1',
    farmerName: 'Ramesh Patil',
    location: 'Pune, Maharashtra',
    crop: 'Wheat',
    quantity: '80 qtl',
    askPrice: '₹2,600/qtl',
    date: '26 Feb 2026',
    status: 'New',
  },
  {
    id: '2',
    farmerName: 'Suresh Kumar',
    location: 'Nagpur, Maharashtra',
    crop: 'Soybeans',
    quantity: '50 qtl',
    askPrice: '₹4,400/qtl',
    date: '25 Feb 2026',
    status: 'New',
  },
  {
    id: '3',
    farmerName: 'Anita Devi',
    location: 'Nashik, Maharashtra',
    crop: 'Onion',
    quantity: '120 qtl',
    askPrice: '₹1,200/qtl',
    date: '24 Feb 2026',
    status: 'Negotiating',
  },
  {
    id: '4',
    farmerName: 'Vijay Shinde',
    location: 'Kolhapur, Maharashtra',
    crop: 'Rice',
    quantity: '60 qtl',
    askPrice: '₹3,200/qtl',
    date: '23 Feb 2026',
    status: 'New',
  },
  {
    id: '5',
    farmerName: 'Pandhari Lokhande',
    location: 'Amravati, Maharashtra',
    crop: 'Cotton',
    quantity: '30 qtl',
    askPrice: '₹7,500/qtl',
    date: '22 Feb 2026',
    status: 'Negotiating',
  },
  {
    id: '6',
    farmerName: 'Kavita Jadhav',
    location: 'Aurangabad, Maharashtra',
    crop: 'Maize',
    quantity: '90 qtl',
    askPrice: '₹2,100/qtl',
    date: '21 Feb 2026',
    status: 'New',
  },
];

const FILTER_OPTIONS = ['All', 'New', 'Negotiating'];
const SORT_OPTIONS = ['Latest First', 'Oldest First', 'Price: Low to High', 'Price: High to Low'];
const CROP_COLORS: Record<string, string> = {
  Wheat: '#F39C12',
  Soybeans: '#27AE60',
  Onion: '#8E44AD',
  Rice: '#16A085',
  Cotton: '#2980B9',
  Maize: '#D35400',
};

export default function DealerDashboard() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Latest First');
  const [filterModal, setFilterModal] = useState(false);
  const [sortModal, setSortModal] = useState(false);

  const filtered = MOCK_DEALS.filter(
    (d) => activeFilter === 'All' || d.status === activeFilter
  );

  const sorted = [...filtered].sort((a, b) => {
    if (activeSort === 'Latest First') return parseInt(b.id) - parseInt(a.id);
    if (activeSort === 'Oldest First') return parseInt(a.id) - parseInt(b.id);
    return 0;
  });

  return (
    <View style={styles.root}>
      {/* ── Top Header (same as farmer) ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogoCircle}>
            <MaterialIcons name="storefront" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Krishi-Mitra</Text>
            <View style={styles.dealerChip}>
              <Text style={styles.dealerChipText}>DEALER</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <MaterialIcons name="notifications-none" size={20} color={DARK_TEXT} />
          </TouchableOpacity>
          <LangPicker />
          <TouchableOpacity style={styles.headerIcon}>
            <MaterialIcons name="person" size={20} color={DARK_TEXT} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Filter / Sort bar ── */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterBtn, activeFilter !== 'All' && styles.filterBtnActive]}
          onPress={() => setFilterModal(true)}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="filter-list"
            size={16}
            color={activeFilter !== 'All' ? '#fff' : BLUE}
          />
          <Text style={[styles.filterBtnText, activeFilter !== 'All' && styles.filterBtnTextActive]}>
            Filter by{activeFilter !== 'All' ? `: ${activeFilter}` : ''}
          </Text>
          <MaterialIcons
            name="arrow-drop-down"
            size={18}
            color={activeFilter !== 'All' ? '#fff' : BLUE}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sortBtn, activeSort !== 'Latest First' && styles.filterBtnActive]}
          onPress={() => setSortModal(true)}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="sort"
            size={16}
            color={activeSort !== 'Latest First' ? '#fff' : BLUE}
          />
          <Text style={[styles.filterBtnText, activeSort !== 'Latest First' && styles.filterBtnTextActive]}>
            Sort by
          </Text>
          <MaterialIcons
            name="arrow-drop-down"
            size={18}
            color={activeSort !== 'Latest First' ? '#fff' : BLUE}
          />
        </TouchableOpacity>
      </View>

      {/* ── Deals count ── */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {sorted.length} deal{sorted.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* ── Deal Cards ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sorted.map((deal) => {
          const cropColor = CROP_COLORS[deal.crop] ?? BLUE;
          const isNew = deal.status === 'New';
          return (
            <View key={deal.id} style={styles.card}>
              {/* Card top row */}
              <View style={styles.cardTop}>
                <View style={[styles.cropDot, { backgroundColor: cropColor }]} />
                <View style={styles.cardInfo}>
                  <Text style={styles.farmerName}>{deal.farmerName}</Text>
                  <View style={styles.locationRow}>
                    <MaterialIcons name="location-on" size={12} color={GRAY_TEXT} />
                    <Text style={styles.locationText}>{deal.location}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: isNew ? '#D6EAF8' : '#FEF9E7' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: isNew ? BLUE : '#D68910' },
                    ]}
                  >
                    {deal.status}
                  </Text>
                </View>
              </View>

              {/* Stats row */}
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <MaterialIcons name="grass" size={14} color={cropColor} />
                  <Text style={styles.statLabel}>Crop</Text>
                  <Text style={styles.statValue}>{deal.crop}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <MaterialIcons name="inventory" size={14} color={GRAY_TEXT} />
                  <Text style={styles.statLabel}>Quantity</Text>
                  <Text style={styles.statValue}>{deal.quantity}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <MaterialIcons name="currency-rupee" size={14} color={GRAY_TEXT} />
                  <Text style={styles.statLabel}>Ask Price</Text>
                  <Text style={[styles.statValue, { color: BLUE, fontWeight: '700' }]}>
                    {deal.askPrice}
                  </Text>
                </View>
              </View>

              {/* Date + action */}
              <View style={styles.cardFooter}>
                <View style={styles.dateRow}>
                  <MaterialIcons name="calendar-today" size={12} color={GRAY_TEXT} />
                  <Text style={styles.dateText}>{deal.date}</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.rejectBtn}>
                    <Text style={styles.rejectText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.acceptBtn}>
                    <Text style={styles.acceptText}>Accept Deal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Filter Modal ── */}
      <Modal visible={filterModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFilterModal(false)}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Filter by Status</Text>
            {FILTER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.modalOption}
                onPress={() => { setActiveFilter(opt); setFilterModal(false); }}
              >
                <Text style={[styles.modalOptionText, activeFilter === opt && styles.modalOptionActive]}>
                  {opt}
                </Text>
                {activeFilter === opt && (
                  <MaterialIcons name="check" size={18} color={BLUE} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Sort Modal ── */}
      <Modal visible={sortModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortModal(false)}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Sort by</Text>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.modalOption}
                onPress={() => { setActiveSort(opt); setSortModal(false); }}
              >
                <Text style={[styles.modalOptionText, activeSort === opt && styles.modalOptionActive]}>
                  {opt}
                </Text>
                {activeSort === opt && (
                  <MaterialIcons name="check" size={18} color={BLUE} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_BLUE_BG },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: LIGHT_BLUE_BG,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerLogoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: BLUE },
  dealerChip: {
    backgroundColor: '#D6EAF8',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: BLUE,
    marginTop: 2,
  },
  dealerChipText: { fontSize: 9, fontWeight: '700', color: BLUE, letterSpacing: 0.8 },
  headerRight: { flexDirection: 'row', gap: 6, alignItems: 'center' },
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

  /* Filter bar */
  filterBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BLUE,
    paddingVertical: 9,
  },
  sortBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BLUE,
    paddingVertical: 9,
  },
  filterBtnActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: BLUE },
  filterBtnTextActive: { color: '#fff' },

  /* Count */
  countRow: { paddingHorizontal: 18, paddingBottom: 6 },
  countText: { fontSize: 12, color: GRAY_TEXT },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  /* Deal Card */
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: BLUE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cropDot: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  farmerName: { fontSize: 15, fontWeight: '700', color: DARK_TEXT },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  locationText: { fontSize: 12, color: GRAY_TEXT },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 12, fontWeight: '700' },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    backgroundColor: LIGHT_BLUE_BG,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statDivider: { width: 1, backgroundColor: '#AED6F1', marginVertical: 4 },
  statLabel: { fontSize: 10, color: GRAY_TEXT },
  statValue: { fontSize: 13, fontWeight: '600', color: DARK_TEXT, textAlign: 'center' },

  /* Footer */
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 11, color: GRAY_TEXT },
  actionRow: { flexDirection: 'row', gap: 8 },
  rejectBtn: {
    borderWidth: 1.5,
    borderColor: '#E74C3C',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rejectText: { fontSize: 12, color: '#E74C3C', fontWeight: '600' },
  acceptBtn: {
    backgroundColor: BLUE,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  acceptText: { fontSize: 12, color: '#fff', fontWeight: '700' },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: DARK_TEXT, marginBottom: 14 },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAF2F8',
  },
  modalOptionText: { fontSize: 14, color: DARK_TEXT },
  modalOptionActive: { color: BLUE, fontWeight: '700' },
});
