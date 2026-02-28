import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LangPicker from '@/components/lang-picker';
import { useLanguage } from '@/contexts/LanguageContext';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { downloadAgreementPdf } from '@/utils/generateAgreementPdf';

const GREEN = '#2D7A3A';
const LIGHT_GREEN_BG = '#E8F5E9';
const DARK_TEXT = '#1B2B1C';
const GRAY_TEXT = '#555';

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  New:         { label: 'Pending',     bg: '#FFF8E1', color: '#F9A825' },
  Negotiating: { label: 'Negotiating', bg: '#E3F2FD', color: '#1565C0' },
  Accepted:    { label: 'Accepted',    bg: '#E8F5E9', color: GREEN      },
  Completed:   { label: 'Completed',   bg: '#F3E5F5', color: '#6A1B9A'  },
  Declined:    { label: 'Declined',    bg: '#FFEBEE', color: '#C62828'  },
};

export default function HistoryScreen() {
  const { t } = useLanguage();
  const [deals, setDeals]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }

    const q = query(
      collection(db, 'deals'),
      where('farmerId', '==', uid),
      orderBy('createdAt', 'desc'),
    );

    const unsub = onSnapshot(q, (snap) => {
      setDeals(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>{t.historyTitle}</Text>
          <LangPicker />
        </View>
        <Text style={styles.headerSub}>{t.historySubtitle}</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      ) : deals.length === 0 ? (
        <View style={styles.centered}>
          <MaterialIcons name="history" size={52} color="#C8E6C9" />
          <Text style={styles.emptyText}>
            No deals yet.{"\n"}Start hedging to see your history here.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {deals.map((item) => {
            const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG['New'];
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cropIcon}>
                    <MaterialIcons name="grass" size={22} color="#fff" />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cropName}>{item.crop}</Text>
                    <Text style={styles.cardMeta}>
                      {item.quantity}  •  {item.date ?? '—'}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.badgeText, { color: cfg.color }]}>
                      {cfg.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBottom}>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>{t.lockedPrice}</Text>
                    <Text style={styles.statValue}>{item.askPrice ?? '—'}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Transport Date</Text>
                    <Text style={styles.statValue}>{item.transportDate ?? '—'}</Text>
                  </View>
                </View>

                {item.status === 'Accepted' && item.dealerName && (
                  <View style={styles.acceptedBanner}>
                    <MaterialIcons name="handshake" size={14} color="#2D7A3A" />
                    <Text style={styles.acceptedText}>Accepted by {item.dealerName}</Text>
                    <TouchableOpacity
                      style={styles.downloadBtn}
                      activeOpacity={0.8}
                      onPress={() => downloadAgreementPdf({
                        dealId:         item.id,
                        farmerName:     item.farmerName ?? auth.currentUser?.displayName ?? 'Farmer',
                        farmerLocation: item.location ?? '',
                        dealerName:     item.dealerName,
                        dealerUid:      item.acceptedBy,
                        crop:           item.crop,
                        quantity:       item.quantity,
                        askPrice:       item.askPrice,
                        harvestDate:    item.harvestDate,
                        transportDate:  item.transportDate,
                        acceptedAt:     item.acceptedAtStr,
                        createdAt:      item.date,
                      })}
                    >
                      <MaterialIcons name="picture-as-pdf" size={14} color={GREEN} />
                      <Text style={styles.downloadText}>Download Agreement</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
  root: { flex: 1, backgroundColor: LIGHT_GREEN_BG },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  emptyText: {
    marginTop: 12,
    textAlign: 'center',
    color: GRAY_TEXT,
    fontSize: 14,
    lineHeight: 22,
  },

  header: {
    backgroundColor: LIGHT_GREEN_BG,
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: GREEN },
  headerSub: { fontSize: 13, color: GRAY_TEXT, marginTop: 2 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cropIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cropName: { fontSize: 16, fontWeight: '700', color: DARK_TEXT },
  cardMeta: { fontSize: 12, color: GRAY_TEXT, marginTop: 2 },

  badge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },

  cardBottom: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, color: GRAY_TEXT, marginBottom: 3 },
  statValue: { fontSize: 15, fontWeight: '600', color: DARK_TEXT },
  divider: { width: 1, backgroundColor: '#E0E0E0', marginHorizontal: 8 },

  acceptedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E8F5E9', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    marginTop: 10, flexWrap: 'wrap',
  },
  acceptedText: { fontSize: 12, color: '#2D7A3A', fontWeight: '600', flex: 1 },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fff', borderRadius: 8,
    borderWidth: 1.5, borderColor: '#2D7A3A',
    paddingHorizontal: 8, paddingVertical: 4,
  },
  downloadText: { fontSize: 11, fontWeight: '700', color: '#2D7A3A' },
});
