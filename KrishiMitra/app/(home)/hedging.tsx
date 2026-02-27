import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../firebaseConfig';

const GREEN = '#2D7A3A';
const LIGHT_GREEN_BG = '#E8F5E9';
const DARK_TEXT = '#1B2B1C';
const GRAY_TEXT = '#555';
const BORDER = '#C8E6C9';

const OILSEEDS = ['Soybean', 'Groundnut', 'Sesame', 'Castor', 'Sunflower', 'Mustard'];

const formatDate = (text: string): string => {
  const digits = text.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
};

export default function HedgingScreen() {
  const [oilseed, setOilseed] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [location, setLocation] = useState('');
  const [mapModal, setMapModal] = useState(false);
  const [liveCoords, setLiveCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [watching, setWatching] = useState(false);
  const mapRef = useRef(null);
  const [quantity, setQuantity] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [transportDate, setTransportDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleDetectLocation = async () => {
    setMapModal(true);
    if (watching) return;
    setWatching(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Highest, timeInterval: 2000, distanceInterval: 1 },
        (pos: Location.LocationObject) => {
          setLiveCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        }
      );
      // Clean up on modal close
      return () => sub.remove();
    } catch {}
  };

  const handleSubmit = async () => {
    if (!oilseed)        { Alert.alert('Missing field', 'Please select an oilseed.'); return; }
    if (!location.trim()) { Alert.alert('Missing field', 'Please enter your location.'); return; }
    if (!quantity.trim()) { Alert.alert('Missing field', 'Please enter quantity.'); return; }
    if (!harvestDate.trim()) { Alert.alert('Missing field', 'Please enter harvest date.'); return; }
    if (!pricePerKg.trim()) { Alert.alert('Missing field', 'Please enter price per kg.'); return; }
    if (!transportDate.trim()) { Alert.alert('Missing field', 'Please enter transport date.'); return; }

    const user = auth.currentUser;
    const farmerName = user?.displayName ?? user?.email ?? 'Farmer';

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'deals'), {
        farmerName,
        farmerId: user?.uid ?? null,
        location: location.trim(),
        crop: oilseed,
        quantity: `${quantity.trim()} kg`,
        askPrice: `₹${pricePerKg.trim()}/kg`,
        harvestDate: harvestDate.trim(),
        transportDate: transportDate.trim(),
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'New',
        createdAt: serverTimestamp(),
      });
      Alert.alert(
        'Deal Created!',
        'Your deal has been submitted and is now visible to dealers.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to submit deal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={GREEN} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerLogoCircle}>
            <MaterialIcons name="trending-up" size={18} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Start Hedging</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Info banner ── */}
        <View style={styles.infoBanner}>
          <MaterialIcons name="info-outline" size={18} color={GREEN} />
          <Text style={styles.infoBannerText}>
            Fill in the details below to lock in a price for your oilseed crop.
          </Text>
        </View>

        {/* ── Form card ── */}
        <View style={styles.card}>

          {/* ── Oilseed dropdown ── */}
          <Text style={styles.label}>Which Oilseed?</Text>
          <TouchableOpacity
            style={[styles.inputWrap, styles.dropdownTrigger]}
            onPress={() => setDropdownOpen(true)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="grass" size={20} color={GREEN} style={styles.inputIcon} />
            <Text style={[styles.dropdownText, !oilseed && { color: '#aaa' }]}>
              {oilseed || 'Select oilseed'}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={22} color={GRAY_TEXT} />
          </TouchableOpacity>

          {/* Dropdown Modal */}
          <Modal
            transparent
            visible={dropdownOpen}
            animationType="fade"
            onRequestClose={() => setDropdownOpen(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setDropdownOpen(false)}
            >
              <View style={styles.dropdownModal}>
                <Text style={styles.dropdownModalTitle}>Select Oilseed</Text>
                {OILSEEDS.map((seed) => (
                  <TouchableOpacity
                    key={seed}
                    style={[
                      styles.dropdownItem,
                      oilseed === seed && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setOilseed(seed);
                      setDropdownOpen(false);
                    }}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        oilseed === seed && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {seed}
                    </Text>
                    {oilseed === seed && (
                      <MaterialIcons name="check" size={18} color={GREEN} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          {/* ── Location ── */}
          <Text style={styles.label}>Your Location</Text>
          <View style={styles.inputWrap}>
            <MaterialIcons name="location-on" size={20} color={GREEN} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Village / Taluka / District"
              placeholderTextColor="#aaa"
              value={location}
              onChangeText={setLocation}
              autoCapitalize="words"
            />
            <TouchableOpacity
              style={styles.detectBtn}
              onPress={handleDetectLocation}
              activeOpacity={0.75}
            >
              <MaterialIcons name="add-location" size={20} color={GREEN} />
            </TouchableOpacity>
            {/* Live GPS Map Modal */}
            <Modal visible={mapModal} animationType="slide" onRequestClose={() => { setMapModal(false); setWatching(false); }}>
              <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                  {liveCoords && (
                    <MapView
                      ref={mapRef}
                      style={{ flex: 1 }}
                      region={{
                        latitude: liveCoords.latitude,
                        longitude: liveCoords.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                      }}
                      showsUserLocation
                      followsUserLocation
                    >
                      <Marker coordinate={liveCoords} pinColor="blue" />
                    </MapView>
                  )}
                  {!liveCoords && (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Text>Getting live location…</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={{ backgroundColor: GREEN, padding: 18, alignItems: 'center' }}
                  onPress={async () => {
                    if (liveCoords) {
                      try {
                        const rev = await Location.reverseGeocodeAsync(liveCoords);
                        const place = rev[0];
                        if (place) {
                          // Ignore generic names like 'Shop No. 1', prefer street/city/region/country
                          const genericNames = ['Shop No. 1', 'Unnamed Road', ''];
                          const addressParts = [
                            place.street,
                            place.city || place.subregion,
                            place.region,
                            place.country,
                            place.postalCode
                          ].filter(Boolean);
                          // Only show address if it has city/region/country
                          if (addressParts.length >= 2) {
                            setLocation(addressParts.join(', '));
                          } else {
                            setLocation(`Lat: ${liveCoords.latitude.toFixed(6)}, Lng: ${liveCoords.longitude.toFixed(6)}`);
                          }
                        } else {
                          setLocation(`Lat: ${liveCoords.latitude}, Lng: ${liveCoords.longitude}`);
                        }
                      } catch {
                        setLocation(`Lat: ${liveCoords.latitude}, Lng: ${liveCoords.longitude}`);
                      }
                    }
                    setMapModal(false);
                    setWatching(false);
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Use This Location</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          </View>

          {/* ── Quantity ── */}
          <Text style={styles.label}>Quantity (in kg)</Text>
          <View style={styles.inputWrap}>
            <MaterialIcons name="scale" size={20} color={GREEN} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 500"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
            <Text style={styles.unitTag}>kg</Text>
          </View>

          {/* ── Harvest Date ── */}
          <Text style={styles.label}>Harvest Date</Text>
          <View style={styles.inputWrap}>
            <MaterialIcons name="calendar-today" size={20} color={GREEN} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={harvestDate}
              onChangeText={(text) => setHarvestDate(formatDate(text))}
              maxLength={10}
            />
          </View>

          {/* ── Price offered per kg ── */}
          <Text style={styles.label}>Price Offered per kg</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.rupeeIcon}>₹</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 4500"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={pricePerKg}
              onChangeText={setPricePerKg}
            />
            <Text style={styles.unitTag}>/ kg</Text>
          </View>

          {/* ── Expected Ready for Transport Date ── */}
          <Text style={styles.label}>Expected Ready for Transport Date</Text>
          <View style={[styles.inputWrap, { marginBottom: 0 }]}>
            <MaterialIcons name="local-shipping" size={20} color={GREEN} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={transportDate}
              onChangeText={(text) => setTransportDate(formatDate(text))}
              maxLength={10}
            />
          </View>
        </View>

        {/* ── Submit button ── */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} activeOpacity={0.85} disabled={submitting}>
          {submitting
            ? <ActivityIndicator size="small" color="#fff" />
            : <>
                <MaterialIcons name="lock" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>Lock My Price</Text>
              </>
          }
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_GREEN_BG },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: LIGHT_GREEN_BG,
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
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
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 19, fontWeight: '800', color: GREEN },

  /* Scroll */
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24 },

  /* Info banner */
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#D4EDDA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  infoBannerText: { flex: 1, fontSize: 13, color: '#2D7A3A', lineHeight: 18 },

  /* Card */
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 18,
  },

  /* Labels */
  label: { fontSize: 13, fontWeight: '600', color: DARK_TEXT, marginBottom: 6, marginTop: 16 },

  /* Input row */
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: '#FAFFF9',
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 0,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: DARK_TEXT },

  /* Detect location button inside input */
  detectBtn: {
    padding: 4,
    borderRadius: 8,
  },

  /* Unit tag */
  unitTag: {
    fontSize: 13,
    fontWeight: '600',
    color: GRAY_TEXT,
    marginLeft: 4,
  },

  /* Rupee prefix */
  rupeeIcon: {
    fontSize: 17,
    fontWeight: '700',
    color: GREEN,
    marginRight: 8,
  },

  /* Dropdown trigger */
  dropdownTrigger: {
    justifyContent: 'space-between',
  },
  dropdownText: { flex: 1, fontSize: 14, color: DARK_TEXT },

  /* Dropdown modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  dropdownModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  dropdownModalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DARK_TEXT,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F7F7',
  },
  dropdownItemSelected: { backgroundColor: '#F0FAF2' },
  dropdownItemText: { fontSize: 15, color: DARK_TEXT },
  dropdownItemTextSelected: { color: GREEN, fontWeight: '700' },

  /* Primary button */
  primaryBtn: {
    backgroundColor: GREEN,
    borderRadius: 14,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
