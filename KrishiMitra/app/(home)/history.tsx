import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const GREEN = '#2D7A3A';
const LIGHT_GREEN_BG = '#E8F5E9';
const DARK_TEXT = '#1B2B1C';
const GRAY_TEXT = '#555';

const MOCK_HISTORY = [
  {
    id: '1',
    crop: 'Wheat',
    quantity: '50 qtl',
    lockedPrice: '₹2,500/qtl',
    date: '15 Jan 2026',
    status: 'Active',
    profit: '+₹12,500',
  },
  {
    id: '2',
    crop: 'Soybeans',
    quantity: '30 qtl',
    lockedPrice: '₹4,100/qtl',
    date: '2 Dec 2025',
    status: 'Completed',
    profit: '+₹4,500',
  },
  {
    id: '3',
    crop: 'Rice',
    quantity: '80 qtl',
    lockedPrice: '₹3,000/qtl',
    date: '18 Nov 2025',
    status: 'Completed',
    profit: '-₹2,000',
  },
  {
    id: '4',
    crop: 'Cotton',
    quantity: '20 qtl',
    lockedPrice: '₹6,900/qtl',
    date: '5 Oct 2025',
    status: 'Completed',
    profit: '+₹6,000',
  },
];

export default function HistoryScreen() {
  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Previous History</Text>
        <Text style={styles.headerSub}>Your hedging activity</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_HISTORY.map((item) => {
          const isProfit = item.profit.startsWith('+');
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cropIcon}>
                  <MaterialIcons name="grass" size={22} color="#fff" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cropName}>{item.crop}</Text>
                  <Text style={styles.cardMeta}>
                    {item.quantity}  •  {item.date}
                  </Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: item.status === 'Active' ? '#E8F5E9' : '#F5F5F5' },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: item.status === 'Active' ? GREEN : '#888' },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Locked Price</Text>
                  <Text style={styles.statValue}>{item.lockedPrice}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>P&amp;L</Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: isProfit ? GREEN : '#E53935', fontWeight: '700' },
                    ]}
                  >
                    {item.profit}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_GREEN_BG },

  header: {
    backgroundColor: LIGHT_GREEN_BG,
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
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
});
