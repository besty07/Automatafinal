import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LangPicker from '@/components/lang-picker';
import { collection, doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { downloadAgreementPdf } from '@/utils/generateAgreementPdf';

const BLUE = '#1A5276';
const LIGHT_BLUE_BG = '#EAF2F8';
const DARK_TEXT = '#1B2340';
const GRAY_TEXT = '#555';

const formatDate = (ts: any): string => {
  if (!ts) return '—';
  if (ts.toDate) return ts.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  return String(ts);
};

export default function PrevDealsScreen() {
  const [history, setHistory]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [dealerProfile, setDealerProfile] = useState<any>(null);
  const [farmerProfiles, setFarmerProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }

    // fetch dealer profile once
    getDoc(doc(db, 'dealers', uid)).then((snap) => {
      if (snap.exists()) setDealerProfile(snap.data());
    });

    const q = query(
      collection(db, 'dealers', uid, 'history'),
      orderBy('date', 'desc')
    );

    const unsub = onSnapshot(q, async (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setHistory(list);
      setLoading(false);

      // fetch farmer profiles to populate phone/aadhar in PDF
      const fids = [...new Set(list
        .filter((d: any) => d.farmerId)
        .map((d: any) => d.farmerId as string)
      )];
      const profileMap: Record<string, any> = {};
      await Promise.all(fids.map(async (fid) => {
        const snap2 = await getDoc(doc(db, 'users', fid));
        if (snap2.exists()) profileMap[fid] = snap2.data();
      }));
      setFarmerProfiles(profileMap);
    });

    return () => unsub();
  }, []);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="storefront" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Previous Deals</Text>
            <Text style={styles.headerSub}>Your completed transactions</Text>
          </View>
        </View>
        <LangPicker />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={styles.loadingText}>Loading history…</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyWrap}>
          <MaterialIcons name="history" size={48} color="#AED6F1" />
          <Text style={styles.emptyText}>No deals yet. Accept or decline deals from the Home tab.</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {history.map((deal) => {
            const isCompleted = deal.status === 'Completed';
            return (
              <View key={deal.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.farmerIcon}>
                    <MaterialIcons name="person" size={22} color="#fff" />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.farmerName}>{farmerProfiles[deal.farmerId]?.name ?? deal.farmerName}</Text>
                    <View style={styles.locationRow}>
                      <MaterialIcons name="location-on" size={12} color={GRAY_TEXT} />
                      <Text style={styles.locationText}>{deal.location}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: isCompleted ? '#D5F5E3' : '#FADBD8' }]}>
                    <Text style={[styles.statusText, { color: isCompleted ? '#1E8449' : '#E74C3C' }]}>
                      {deal.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Crop</Text>
                    <Text style={styles.statValue}>{deal.crop}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Quantity</Text>
                    <Text style={styles.statValue}>{deal.quantity}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Final Price</Text>
                    <Text style={[styles.statValue, { color: BLUE, fontWeight: '700' }]}>{deal.finalPrice}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.dateRow}>
                    <MaterialIcons name="calendar-today" size={12} color={GRAY_TEXT} />
                    <Text style={styles.dateText}>{formatDate(deal.date)}</Text>
                  </View>
                  {isCompleted && (
                    <TouchableOpacity
                      style={styles.downloadBtn}
                      activeOpacity={0.8}
                      onPress={() => {
                        const fp = farmerProfiles[deal.farmerId] ?? {};
                        downloadAgreementPdf({
                          dealId:              deal.dealId ?? deal.id,
                          farmerName:          fp.name ?? deal.farmerName,
                          farmerPhone:         fp.phone,
                          farmerAadhar:        fp.aadhar,
                          farmerAddress:       fp.state ?? deal.location ?? '',
                          dealerName:          dealerProfile?.businessName ?? deal.dealerName ?? 'Dealer',
                          dealerUid:           deal.dealerUid,
                          dealerContact:       dealerProfile?.contactName,
                          dealerPhone:         dealerProfile?.phone,
                          dealerEmail:         dealerProfile?.email,
                          dealerBusinessType:  dealerProfile?.businessType,
                          dealerState:         dealerProfile?.state,
                          crop:                deal.crop,
                          quantity:            deal.quantity,
                          askPrice:            deal.finalPrice,
                          harvestDate:         deal.harvestDate,
                          transportDate:       deal.transportDate,
                          acceptedAt:          deal.acceptedAtStr,
                          createdAt:           formatDate(deal.date),
                        });
                      }}
                    >
                      <MaterialIcons name="picture-as-pdf" size={15} color={BLUE} />
                      <Text style={styles.downloadText}>Agreement PDF</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_BLUE_BG },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: LIGHT_BLUE_BG, paddingHorizontal: 16, paddingTop: 48, paddingBottom: 14,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: BLUE,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: BLUE },
  headerSub:   { fontSize: 12, color: GRAY_TEXT, marginTop: 1 },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: GRAY_TEXT },
  emptyWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 40 },
  emptyText:   { fontSize: 14, color: GRAY_TEXT, textAlign: 'center', lineHeight: 22 },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12,
    borderLeftWidth: 4, borderLeftColor: BLUE,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  cardTop:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  farmerIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: BLUE,
    alignItems: 'center', justifyContent: 'center',
  },
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
  stat:        { flex: 1, alignItems: 'center', gap: 3 },
  statDivider: { width: 1, backgroundColor: '#AED6F1', marginVertical: 4 },
  statLabel:   { fontSize: 10, color: GRAY_TEXT },
  statValue:   { fontSize: 13, fontWeight: '600', color: DARK_TEXT, textAlign: 'center' },
  cardFooter:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateRow:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText:    { fontSize: 11, color: GRAY_TEXT },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#D6EAF8', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  downloadText: { fontSize: 12, fontWeight: '700', color: BLUE },
});
