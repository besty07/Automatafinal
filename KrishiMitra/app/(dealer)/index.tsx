import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LangPicker from '@/components/lang-picker';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const BLUE = '#1A5276';
const LIGHT_BLUE_BG = '#EAF2F8';
const DARK_TEXT = '#1B2340';
const GRAY_TEXT = '#555';

// ── Seed data: written to Firestore once when the deals collection is empty ──
const SEED_DEALS = [
  { farmerName: 'Ramesh Patil',      location: 'Pune, Maharashtra',      crop: 'Wheat',    quantity: '80 qtl',  askPrice: '₹2,600/qtl', date: '26 Feb 2026', status: 'New' },
  { farmerName: 'Suresh Kumar',      location: 'Nagpur, Maharashtra',    crop: 'Soybeans', quantity: '50 qtl',  askPrice: '₹4,400/qtl', date: '25 Feb 2026', status: 'New' },
  { farmerName: 'Anita Devi',        location: 'Nashik, Maharashtra',    crop: 'Onion',    quantity: '120 qtl', askPrice: '₹1,200/qtl', date: '24 Feb 2026', status: 'Negotiating' },
  { farmerName: 'Vijay Shinde',      location: 'Kolhapur, Maharashtra',  crop: 'Rice',     quantity: '60 qtl',  askPrice: '₹3,200/qtl', date: '23 Feb 2026', status: 'New' },
  { farmerName: 'Pandhari Lokhande', location: 'Amravati, Maharashtra',  crop: 'Cotton',   quantity: '30 qtl',  askPrice: '₹7,500/qtl', date: '22 Feb 2026', status: 'Negotiating' },
  { farmerName: 'Kavita Jadhav',     location: 'Aurangabad, Maharashtra', crop: 'Maize',   quantity: '90 qtl',  askPrice: '₹2,100/qtl', date: '21 Feb 2026', status: 'New' },
];

const FILTER_OPTIONS = ['All', 'New', 'Negotiating'];
const SORT_OPTIONS   = ['Latest First', 'Oldest First'];
const CROP_COLORS: Record<string, string> = {
  Wheat: '#F39C12', Soybeans: '#27AE60', Onion: '#8E44AD',
  Rice: '#16A085', Cotton: '#2980B9', Maize: '#D35400',
};

export default function DealerDashboard() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort,   setActiveSort]   = useState('Latest First');
  const [filterModal,  setFilterModal]  = useState(false);
  const [sortModal,    setSortModal]    = useState(false);
  const [deals,        setDeals]        = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [seeding,      setSeeding]      = useState(false);
  const [confirmDeal,  setConfirmDeal]  = useState<any | null>(null);
  const [accepting,    setAccepting]    = useState(false);

  // ── Real-time listener on the 'deals' Firestore collection ────────────────
  useEffect(() => {
    const q = query(
      collection(db, 'deals'),
      where('status', 'in', ['New', 'Negotiating'])
    );

    const unsub = onSnapshot(q, async (snap) => {
      if (snap.empty && !seeding) {
        // First run: seed sample deals
        setSeeding(true);
        try {
          for (const deal of SEED_DEALS) {
            await addDoc(collection(db, 'deals'), { ...deal, createdAt: serverTimestamp() });
          }
        } catch {
          Alert.alert('Error', 'Could not seed deals. Check Firestore rules.');
        } finally {
          setSeeding(false);
        }
        return;
      }
      setDeals(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ── Accept a deal (called after confirmation) ───────────────────────────
  const handleAccept = async (deal: any) => {
    const user = auth.currentUser;
    const uid  = user?.uid;
    if (!uid) { Alert.alert('Error', 'Not logged in.'); return; }
    const dealerName = user?.displayName ?? user?.email ?? 'Dealer';
    setAccepting(true);
    try {
      const acceptedAt = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      await updateDoc(doc(db, 'deals', deal.id), {
        status: 'Accepted',
        acceptedBy: uid,
        dealerName,
        acceptedAt: serverTimestamp(),
        acceptedAtStr: acceptedAt,
      });
      await addDoc(collection(db, 'dealers', uid, 'history'), {
        farmerName:    deal.farmerName,
        location:      deal.location ?? '',
        crop:          deal.crop,
        quantity:      deal.quantity,
        finalPrice:    deal.askPrice,
        harvestDate:   deal.harvestDate ?? '',
        transportDate: deal.transportDate ?? '',
        dealerName,
        dealerUid:     uid,
        date:          serverTimestamp(),
        acceptedAtStr: acceptedAt,
        status:        'Completed',
        dealId:        deal.id,
      });
      setConfirmDeal(null);
      Alert.alert('Deal Accepted', 'Agreement ready. Download it from Previous Deals.');
    } catch {
      Alert.alert('Error', 'Failed to accept deal. Try again.');
    } finally {
      setAccepting(false);
    }
  };

  // ── Decline a deal ────────────────────────────────────────────────────────
  const handleDecline = async (deal: any) => {
    const uid = auth.currentUser?.uid;
    if (!uid) { Alert.alert('Error', 'Not logged in.'); return; }
    try {
      await updateDoc(doc(db, 'deals', deal.id), {
        status: 'Declined', declinedBy: uid, declinedAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'dealers', uid, 'history'), {
        farmerName: deal.farmerName, location: deal.location ?? '',
        crop: deal.crop, quantity: deal.quantity, finalPrice: deal.askPrice,
        date: serverTimestamp(), status: 'Declined', dealId: deal.id,
      });
    } catch {
      Alert.alert('Error', 'Failed to decline deal. Try again.');
    }
  };

  const filtered = deals.filter(
    (d) => activeFilter === 'All' || d.status === activeFilter
  );
  const sorted = [...filtered].sort((a, b) => {
    const aT = a.createdAt?.seconds ?? 0;
    const bT = b.createdAt?.seconds ?? 0;
    return activeSort === 'Latest First' ? bT - aT : aT - bT;
  });

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
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
          <MaterialIcons name="filter-list" size={16} color={activeFilter !== 'All' ? '#fff' : BLUE} />
          <Text style={[styles.filterBtnText, activeFilter !== 'All' && styles.filterBtnTextActive]}>
            Filter by{activeFilter !== 'All' ? `: ${activeFilter}` : ''}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={18} color={activeFilter !== 'All' ? '#fff' : BLUE} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sortBtn, activeSort !== 'Latest First' && styles.filterBtnActive]}
          onPress={() => setSortModal(true)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="sort" size={16} color={activeSort !== 'Latest First' ? '#fff' : BLUE} />
          <Text style={[styles.filterBtnText, activeSort !== 'Latest First' && styles.filterBtnTextActive]}>
            Sort by
          </Text>
          <MaterialIcons name="arrow-drop-down" size={18} color={activeSort !== 'Latest First' ? '#fff' : BLUE} />
        </TouchableOpacity>
      </View>

      {/* ── Loading / count row ── */}
      {loading || seeding ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={BLUE} />
          <Text style={styles.loadingText}>{seeding ? 'Setting up deals…' : 'Loading deals…'}</Text>
        </View>
      ) : (
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {sorted.length} deal{sorted.length !== 1 ? 's' : ''} found
          </Text>
        </View>
      )}

      {/* ── Deal Cards ── */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {sorted.map((deal) => {
          const cropColor = CROP_COLORS[deal.crop] ?? BLUE;
          const isNew = deal.status === 'New';
          return (
            <View key={deal.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.cropDot, { backgroundColor: cropColor }]} />
                <View style={styles.cardInfo}>
                  <Text style={styles.farmerName}>{deal.farmerName}</Text>
                  <View style={styles.locationRow}>
                    <MaterialIcons name="location-on" size={12} color={GRAY_TEXT} />
                    <Text style={styles.locationText}>{deal.location}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: isNew ? '#D6EAF8' : '#FEF9E7' }]}>
                  <Text style={[styles.statusText, { color: isNew ? BLUE : '#D68910' }]}>{deal.status}</Text>
                </View>
              </View>

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
                  <Text style={[styles.statValue, { color: BLUE, fontWeight: '700' }]}>{deal.askPrice}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.dateRow}>
                  <MaterialIcons name="calendar-today" size={12} color={GRAY_TEXT} />
                  <Text style={styles.dateText}>{deal.date}</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => handleDecline(deal)}>
                    <Text style={styles.rejectText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => setConfirmDeal(deal)}>
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
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFilterModal(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Filter by Status</Text>
            {FILTER_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt} style={styles.modalOption} onPress={() => { setActiveFilter(opt); setFilterModal(false); }}>
                <Text style={[styles.modalOptionText, activeFilter === opt && styles.modalOptionActive]}>{opt}</Text>
                {activeFilter === opt && <MaterialIcons name="check" size={18} color={BLUE} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Sort Modal ── */}
      <Modal visible={sortModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSortModal(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Sort by</Text>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt} style={styles.modalOption} onPress={() => { setActiveSort(opt); setSortModal(false); }}>
                <Text style={[styles.modalOptionText, activeSort === opt && styles.modalOptionActive]}>{opt}</Text>
                {activeSort === opt && <MaterialIcons name="check" size={18} color={BLUE} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Confirm Accept Modal ── */}
      <Modal visible={!!confirmDeal} transparent animationType="slide" onRequestClose={() => !accepting && setConfirmDeal(null)}>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            {/* Header */}
            <View style={styles.confirmHeader}>
              <MaterialIcons name="handshake" size={24} color={BLUE} />
              <Text style={styles.confirmTitle}>Confirm Deal Acceptance</Text>
            </View>
            <Text style={styles.confirmSubtitle}>Please review all details before accepting.</Text>

            {/* Details grid */}
            {confirmDeal && (
              <View style={styles.confirmDetails}>
                <ConfirmRow label="Farmer"     value={confirmDeal.farmerName} icon="person" />
                <ConfirmRow label="Location"   value={confirmDeal.location}   icon="location-on" />
                <ConfirmRow label="Crop"        value={confirmDeal.crop}       icon="grass" />
                <ConfirmRow label="Quantity"   value={confirmDeal.quantity}   icon="inventory" />
                <ConfirmRow label="Ask Price"  value={confirmDeal.askPrice}   icon="currency-rupee" highlight />
                {confirmDeal.harvestDate   ? <ConfirmRow label="Harvest Date"    value={confirmDeal.harvestDate}   icon="calendar-today" /> : null}
                {confirmDeal.transportDate ? <ConfirmRow label="Transport Date"  value={confirmDeal.transportDate} icon="local-shipping" /> : null}
                <ConfirmRow label="Listed On" value={confirmDeal.date ?? '—'}   icon="event" />
              </View>
            )}

            <Text style={styles.confirmNote}>
              A downloadable PDF agreement will be generated after acceptance.
            </Text>

            {/* Actions */}
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setConfirmDeal(null)}
                disabled={accepting}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmAcceptBtn}
                onPress={() => confirmDeal && handleAccept(confirmDeal)}
                disabled={accepting}
                activeOpacity={0.85}
              >
                {accepting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <>
                      <MaterialIcons name="check-circle" size={18} color="#fff" />
                      <Text style={styles.confirmAcceptText}>Yes, Accept Deal</Text>
                    </>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Confirm row sub-component ───────────────────────────────────────────────
function ConfirmRow({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <View style={styles.confirmRow}>
      <MaterialIcons name={icon as any} size={16} color={BLUE} />
      <Text style={styles.confirmRowLabel}>{label}</Text>
      <Text style={[styles.confirmRowValue, highlight && styles.confirmRowHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_BLUE_BG },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: LIGHT_BLUE_BG, paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerLogoCircle: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: BLUE,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: BLUE },
  dealerChip: {
    backgroundColor: '#D6EAF8', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1,
    borderWidth: 1, borderColor: BLUE, marginTop: 2,
  },
  dealerChipText: { fontSize: 9, fontWeight: '700', color: BLUE, letterSpacing: 0.8 },
  headerRight: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  headerIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2, elevation: 2,
  },
  filterBar: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 10 },
  filterBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5, borderColor: BLUE, paddingVertical: 9,
  },
  sortBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5, borderColor: BLUE, paddingVertical: 9,
  },
  filterBtnActive:     { backgroundColor: BLUE, borderColor: BLUE },
  filterBtnText:       { fontSize: 13, fontWeight: '600', color: BLUE },
  filterBtnTextActive: { color: '#fff' },
  loadingRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingBottom: 6 },
  loadingText:  { fontSize: 12, color: GRAY_TEXT },
  countRow:     { paddingHorizontal: 18, paddingBottom: 6 },
  countText:    { fontSize: 12, color: GRAY_TEXT },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12,
    borderLeftWidth: 4, borderLeftColor: BLUE,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  cardTop:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cropDot:      { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardInfo:     { flex: 1 },
  farmerName:   { fontSize: 15, fontWeight: '700', color: DARK_TEXT },
  locationRow:  { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  locationText: { fontSize: 12, color: GRAY_TEXT },
  statusBadge:  { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusText:   { fontSize: 12, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row', backgroundColor: LIGHT_BLUE_BG,
    borderRadius: 10, padding: 10, marginBottom: 12,
  },
  stat:         { flex: 1, alignItems: 'center', gap: 3 },
  statDivider:  { width: 1, backgroundColor: '#AED6F1', marginVertical: 4 },
  statLabel:    { fontSize: 10, color: GRAY_TEXT },
  statValue:    { fontSize: 13, fontWeight: '600', color: DARK_TEXT, textAlign: 'center' },
  cardFooter:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateRow:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText:     { fontSize: 11, color: GRAY_TEXT },
  actionRow:    { flexDirection: 'row', gap: 8 },
  rejectBtn:    { borderWidth: 1.5, borderColor: '#E74C3C', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  rejectText:   { fontSize: 12, color: '#E74C3C', fontWeight: '600' },
  acceptBtn:    { backgroundColor: BLUE, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  acceptText:   { fontSize: 12, color: '#fff', fontWeight: '700' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, width: 260,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 8,
  },
  modalTitle:       { fontSize: 16, fontWeight: '700', color: DARK_TEXT, marginBottom: 14 },
  modalOption:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EAF2F8' },
  modalOptionText:  { fontSize: 14, color: DARK_TEXT },
  modalOptionActive:{ color: BLUE, fontWeight: '700' },

  /* ── Confirm modal ── */
  confirmOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  confirmBox: {
    backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26,
    padding: 24, paddingBottom: 36,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12, shadowRadius: 10, elevation: 10,
  },
  confirmHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  confirmTitle:  { fontSize: 18, fontWeight: '800', color: DARK_TEXT },
  confirmSubtitle: { fontSize: 13, color: GRAY_TEXT, marginBottom: 16 },
  confirmDetails: { marginBottom: 14 },
  confirmNote: {
    fontSize: 12, color: '#888', textAlign: 'center',
    marginBottom: 18, fontStyle: 'italic',
  },
  confirmActions: { flexDirection: 'row', gap: 10 },
  confirmCancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: BLUE,
    borderRadius: 12, height: 48,
    alignItems: 'center', justifyContent: 'center',
  },
  confirmCancelText: { fontSize: 14, fontWeight: '600', color: BLUE },
  confirmAcceptBtn: {
    flex: 2, backgroundColor: BLUE,
    borderRadius: 12, height: 48,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  confirmAcceptText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  /* Confirm row */
  confirmRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#F0F4F8',
  },
  confirmRowLabel: { fontSize: 12, color: GRAY_TEXT, flex: 1 },
  confirmRowValue: { fontSize: 14, fontWeight: '600', color: DARK_TEXT, textAlign: 'right', flex: 2 },
  confirmRowHighlight: { color: BLUE, fontSize: 15, fontWeight: '800' },
});
