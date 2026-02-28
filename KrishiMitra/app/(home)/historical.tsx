import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { OILSEED_CROPS, HISTORICAL_DATA } from '@/constants/historicalData';
import CropPicker from '@/components/crop-picker';

const GREEN = '#2D7A3A';
const LIGHT_GREEN_BG = '#E8F5E9';
const DARK_TEXT = '#1B2B1C';

export default function HistoricalScreen() {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState(OILSEED_CROPS[0].key);

  // display exactly the 8 requested columns in the specified order
  const DISPLAY_FIELDS: (keyof typeof HISTORICAL_DATA[string][0])[] = [
    'symbol',
    'date',
    'highPrice',
    'lowPrice',
    'openingPrice',
    'closingPrice',
    'quantityTradedToday',
    'tradedValueInLacs',
  ];
  const FIELD_LABELS: Record<string, string> = {
    symbol: 'Symbol',
    date: 'Date',
    highPrice: 'High Price',
    lowPrice: 'Low Price',
    openingPrice: 'Opening Price',
    closingPrice: 'Closing Price',
    quantityTradedToday: 'Quantity Traded',
    tradedValueInLacs: 'Trade Value (Lacs)',
  };

  const data = (HISTORICAL_DATA[selectedCrop] || []).slice().sort((a, b) => {
    if (a.symbol !== b.symbol) return a.symbol.localeCompare(b.symbol);
    return a.date.localeCompare(b.date);
  });

  // specify a minimum width per column to make table readable on phones
  const COL_WIDTHS: Record<string, number> = {
    symbol: 80,
    date: 100,
    highPrice: 80,
    lowPrice: 80,
    openingPrice: 80,
    closingPrice: 80,
    quantityTradedToday: 100,
    tradedValueInLacs: 100,
  };

  return (
    <View style={styles.root}>
      {/* header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color={GREEN} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t.tileHistorical}
            {selectedCrop && ` - ${OILSEED_CROPS.find((c) => c.key === selectedCrop)?.label}`}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionDesc}>{t.historicalSelectCrop}</Text>
        <View style={styles.pickerWrapper}>
          <CropPicker
            value={selectedCrop}
            options={OILSEED_CROPS}
            onChange={setSelectedCrop}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.tableHeader}>
              {DISPLAY_FIELDS.map((field) => (
                <Text
                  key={field}
                  style={[
                    styles.cell,
                    styles.headerCell,
                    { minWidth: COL_WIDTHS[field] || 80 },
                  ]}
                >
                  {FIELD_LABELS[field] || field}
                </Text>
              ))}
            </View>
            <FlatList
              data={data}
              keyExtractor={(item, index) => `${item.date}-${index}`}
              renderItem={({ item, index }) => (
                <View
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.evenRow : undefined,
                  ]}
                >
                  {DISPLAY_FIELDS.map((field) => (
                    <Text
                      key={field}
                      style={[styles.cell, { minWidth: COL_WIDTHS[field] || 80 }]}
                    >
                      {String(item[field] ?? '-')}
                    </Text>
                  ))}
                </View>
              )}
              style={styles.list}
            />
          </View>
        </ScrollView>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const GRAY_TEXT = '#555';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_GREEN_BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: LIGHT_GREEN_BG,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: DARK_TEXT },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },
  sectionDesc: { fontSize: 14, color: GRAY_TEXT, marginBottom: 12 },
  list: { flex: 1, paddingHorizontal: 16 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: GREEN,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  headerCell: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#fff',
    flex: 1, 
    textAlign: 'center', 
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderColor: '#fff',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ddd',
  },
  evenRow: { backgroundColor: '#F5F5F5' },
  cell: { 
    fontSize: 12, 
    color: DARK_TEXT, 
    flex: 1, 
    textAlign: 'center',
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderColor: '#ddd',
  },
  pickerWrapper: {
    marginBottom: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});
