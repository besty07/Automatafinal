import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const GREEN          = '#2D7A3A';
const LIGHT_GREEN_BG = '#E8F5E9';
const DARK_TEXT      = '#1B2B1C';
const GRAY_TEXT      = '#555';

// ── Request permission helper ─────────────────────────────────────────────────
async function requestPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ── Schedule a local notification ─────────────────────────────────────────────
async function scheduleReminder(title: string, date: Date): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌾 KrishiMitra Reminder',
      body: title,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });
  return id;
}

// ── Format a JS Date nicely ───────────────────────────────────────────────────
function fmtDate(d: Date) {
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

interface Reminder {
  id: string;
  title: string;
  remindAt?: Timestamp;
  notifId?: string;
  createdAt?: Timestamp;
}

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle]             = useState('');
  const [pickedDate, setPickedDate]   = useState<Date>(new Date(Date.now() + 60_000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving]           = useState(false);

  const notifListener = useRef<Notifications.Subscription | null>(null);

  // ── Permission + notification listener ──────────────────────────────────────
  useEffect(() => {
    requestPermission();
    return () => {
      notifListener.current?.remove();
    };
  }, []);

  // ── Real-time listener ───────────────────────────────────────────────────────
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    // No orderBy to avoid needing a Firestore composite index — sort client-side
    const q = query(collection(db, 'users', uid, 'reminders'));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reminder));
      docs.sort((a, b) => (a.remindAt?.seconds ?? 0) - (b.remindAt?.seconds ?? 0));
      setReminders(docs);
    });
    return () => unsub();
  }, []);

  // ── Open add-modal ───────────────────────────────────────────────────────────
  const openModal = () => {
    setTitle('');
    setPickedDate(new Date(Date.now() + 60_000));
    setModalVisible(true);
  };

  // ── Save reminder ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Missing', 'Please enter a reminder title.'); return; }
    if (pickedDate <= new Date()) { Alert.alert('Invalid Time', 'Please pick a future time.'); return; }

    const granted = await requestPermission();
    if (!granted) {
      Alert.alert('Permission Denied', 'Enable notifications in device settings to receive reminders.');
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) { Alert.alert('Error', 'Not logged in.'); return; }

    setSaving(true);
    let notifId = '';
    try {
      notifId = await scheduleReminder(title.trim(), pickedDate);
    } catch (e) {
      console.error('Notification scheduling error:', e);
      Alert.alert('Notification Error', 'Could not schedule notification. Check permissions.');
      setSaving(false);
      return;
    }

    try {
      await addDoc(collection(db, 'users', uid, 'reminders'), {
        title: title.trim(),
        remindAt: Timestamp.fromDate(pickedDate),
        notifId,
        createdAt: serverTimestamp(),
      });
      setModalVisible(false);
    } catch (e: any) {
      console.error('Firestore save error:', e?.message ?? e);
      // Notification is already scheduled — still close modal and show a non-blocking warning
      setModalVisible(false);
      Alert.alert(
        'Reminder Set',
        'Notification scheduled, but could not save to cloud (check Firestore rules). It will ring at the chosen time.',
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Delete reminder ──────────────────────────────────────────────────────────
  const handleDelete = (item: any) => {
    Alert.alert('Delete Reminder', `Delete "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const uid = auth.currentUser?.uid;
          if (!uid) return;
          try {
            if (item.notifId) await Notifications.cancelScheduledNotificationAsync(item.notifId);
            await deleteDoc(doc(db, 'users', uid, 'reminders', item.id));
          } catch {
            Alert.alert('Error', 'Could not delete reminder.');
          }
        },
      },
    ]);
  };

  // ── Date/time picker handlers ────────────────────────────────────────────────
  const onDateChange = (_: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      // merge date part with existing time
      const merged = new Date(pickedDate);
      merged.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setPickedDate(merged);
      if (Platform.OS === 'android') setShowTimePicker(true); // chain time picker on Android
    }
  };

  const onTimeChange = (_: any, selected?: Date) => {
    setShowTimePicker(false);
    if (selected) {
      const merged = new Date(pickedDate);
      merged.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setPickedDate(merged);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const isPast  = (item: any) => item.remindAt?.toDate?.() < new Date();
  const isPending = (item: any) => !isPast(item);

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={GREEN} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerLogoCircle}>
            <MaterialIcons name="alarm" size={18} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Reminders</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openModal}>
          <MaterialIcons name="add" size={24} color={GREEN} />
        </TouchableOpacity>
      </View>

      {reminders.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="alarm-add" size={60} color="#C8E6C9" />
          <Text style={styles.emptyTitle}>No reminders yet</Text>
          <Text style={styles.emptyText}>Tap + to add your first reminder</Text>
        </View>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const past = isPast(item);
            const dateStr = item.remindAt?.toDate ? fmtDate(item.remindAt.toDate()) : '—';
            return (
              <View style={[styles.card, past && styles.cardPast]}>
                <View style={styles.cardLeft}>
                  <View style={[styles.cardIconCircle, past && { backgroundColor: '#9E9E9E' }]}>
                    <MaterialIcons name="alarm" size={20} color="#fff" />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, past && { color: '#999' }]}>{item.title}</Text>
                    <Text style={styles.cardTime}>{dateStr}</Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <View style={[styles.badge, { backgroundColor: past ? '#F5F5F5' : '#E8F5E9' }]}>
                    <Text style={[styles.badgeText, { color: past ? '#9E9E9E' : GREEN }]}>
                      {past ? 'Done' : 'Pending'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                    <MaterialIcons name="delete-outline" size={22} color="#E53935" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* ── Add Reminder Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Reminder</Text>

            {/* Title input */}
            <Text style={styles.fieldLabel}>Reminder Title</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons name="edit" size={20} color={GREEN} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Apply fertilizer, Check market rates…"
                placeholderTextColor="#aaa"
                value={title}
                onChangeText={setTitle}
                autoFocus
                returnKeyType="done"
              />
            </View>

            {/* Date & time selector */}
            <Text style={styles.fieldLabel}>Date &amp; Time</Text>

            {Platform.OS === 'ios' ? (
              /* iOS: inline spinner, no button needed */
              <DateTimePicker
                value={pickedDate}
                mode="datetime"
                display="spinner"
                minimumDate={new Date()}
                onChange={(_, d) => d && setPickedDate(d)}
                style={{ marginBottom: 12 }}
              />
            ) : (
              /* Android: tap button → date dialog → time dialog */
              <>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="calendar-today" size={20} color={GREEN} />
                  <Text style={styles.dateButtonText}>{fmtDate(pickedDate)}</Text>
                  <MaterialIcons name="arrow-drop-down" size={22} color={GRAY_TEXT} />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={pickedDate}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={onDateChange}
                  />
                )}
                {showTimePicker && (
                  <DateTimePicker
                    value={pickedDate}
                    mode="time"
                    display="default"
                    onChange={onTimeChange}
                  />
                )}
              </>
            )}

            {/* Action buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                activeOpacity={0.85}
                disabled={saving}
              >
                <MaterialIcons name="alarm-add" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Set Reminder'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
  headerTitle: { fontSize: 19, fontWeight: '800', color: GREEN },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },

  /* Empty */
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: DARK_TEXT, marginTop: 16 },
  emptyText:  { fontSize: 14, color: GRAY_TEXT, marginTop: 6 },

  /* List */
  list: { padding: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  cardPast: { opacity: 0.65 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cardIconCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: GREEN,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: DARK_TEXT },
  cardTime:  { fontSize: 12, color: GRAY_TEXT, marginTop: 2 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  deleteBtn: { padding: 4 },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center', marginBottom: 18,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: DARK_TEXT, marginBottom: 20 },

  fieldLabel: { fontSize: 13, fontWeight: '600', color: GRAY_TEXT, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 18,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: DARK_TEXT, paddingVertical: 10 },

  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 20,
  },
  dateButtonText: { flex: 1, fontSize: 15, color: DARK_TEXT },

  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: GRAY_TEXT },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
