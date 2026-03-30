// Mic tab – full voice-command navigation screen
// Opened when the user taps the FAB mic button in the home tab bar.
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';

let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = null;

try {
  const speechModule = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = speechModule.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = speechModule.useSpeechRecognitionEvent;
} catch (e) {
  // Speech recognition not available in Expo Go
}
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ALL_COMMANDS, executeVoiceNavigation, matchVoiceCommand } from '@/utils/voiceCommands';

const GREEN = '#2D7A3A';
const LIGHT_GREEN_BG = '#E8F5E9';
const DARK_TEXT = '#1B2B1C';
const GRAY = '#555';
const WHITE = '#fff';

export default function MicScreen() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusMsg, setStatusMsg] = useState('Tap the mic to start speaking');
  const [matchedLabel, setMatchedLabel] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);

  // Pulse animation for the mic ring
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  const startPulse = () => {
    pulseLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.35, duration: 650, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 650, useNativeDriver: true }),
      ])
    );
    pulseLoopRef.current.start();
  };

  const stopPulse = () => {
    pulseLoopRef.current?.stop();
    Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  /* ── Speech recognition events ───────────────────────────────────────── */

  if (useSpeechRecognitionEvent) {
    useSpeechRecognitionEvent('start', () => {
      setListening(true);
      setTranscript('');
      setMatchedLabel(null);
      setNavigating(false);
      setStatusMsg('Listening… speak a command');
      startPulse();
    });

    useSpeechRecognitionEvent('end', () => {
      setListening(false);
      stopPulse();
      if (!navigating) {
        setStatusMsg('Tap the mic to try again');
      }
    });

    useSpeechRecognitionEvent('result', (event: any) => {
      const text: string = event.results?.[0]?.transcript ?? '';
      setTranscript(text);
      if (!text) return;

      const result = matchVoiceCommand(text);
      if (result.matched && result.route) {
        setMatchedLabel(result.label ?? '');
        setStatusMsg(`Navigating to: ${result.label}…`);
        setNavigating(true);
        // Give user 700 ms to read the feedback before navigating
        setTimeout(() => {
          ExpoSpeechRecognitionModule.stop();
          executeVoiceNavigation(result);
        }, 700);
      } else if (text) {
        setStatusMsg(`Not recognised — try again\n(heard: "${text}")`);
      }
    });

    useSpeechRecognitionEvent('error', (event: any) => {
      setListening(false);
      stopPulse();
      const msg: string = event.message ?? event.error ?? 'unknown error';
      setStatusMsg(`Mic error: ${msg}\nTap to retry`);
    });
  }

  /* ── Handlers ─────────────────────────────────────────────────────────── */

  const handleMicPress = async () => {
    if (!ExpoSpeechRecognitionModule) {
      Alert.alert('Not supported', 'Voice commands require a development build. Please use "eas build".');
      return;
    }
    
    if (listening) {
      await ExpoSpeechRecognitionModule.stop();
      return;
    }

    // Request mic permission
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      Alert.alert(
        'Microphone Permission Needed',
        'Please allow microphone access so Krishi-Mitra can hear your voice commands.',
        [{ text: 'OK' }]
      );
      return;
    }

    setMatchedLabel(null);
    setTranscript('');

    await ExpoSpeechRecognitionModule.start({
      lang: 'en-IN',      // Indian English; tolerates Hindi/Marathi words well
      interimResults: true,
      maxAlternatives: 1,
      continuous: false,
    });
  };

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice Navigation</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Mic area ── */}
      <View style={styles.micSection}>
        {/* Pulsing outer ring */}
        <Animated.View
          style={[styles.micRing, { transform: [{ scale: pulseAnim }] }]}
          pointerEvents="none"
        />

        {/* Mic button */}
        <TouchableOpacity
          style={[styles.micBtn, listening && styles.micBtnActive]}
          onPress={handleMicPress}
          activeOpacity={0.85}
        >
          <MaterialIcons
            name={listening ? 'mic' : 'mic-none'}
            size={52}
            color={WHITE}
          />
        </TouchableOpacity>

        {/* Status text */}
        <Text style={styles.statusMsg}>{statusMsg}</Text>

        {/* Live transcript */}
        {transcript ? (
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptLabel}>You said:</Text>
            <Text style={styles.transcriptText}>"{transcript}"</Text>
          </View>
        ) : null}

        {/* Match badge */}
        {matchedLabel ? (
          <View style={styles.matchedBadge}>
            <MaterialIcons name="check-circle" size={18} color={GREEN} />
            <Text style={styles.matchedText}>{matchedLabel}</Text>
          </View>
        ) : null}
      </View>

      {/* ── Commands reference ── */}
      <ScrollView
        style={styles.cmdScroll}
        contentContainerStyle={styles.cmdContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.cmdTitle}>Available Commands  🎤</Text>
        {ALL_COMMANDS.map((cmd, i) => (
          <View key={i} style={styles.cmdRow}>
            <MaterialIcons name="record-voice-over" size={15} color={GREEN} style={styles.cmdIcon} />
            <View style={styles.cmdText}>
              <Text style={styles.cmdLabel}>{cmd.label}</Text>
              <Text style={styles.cmdHint}>
                Say: "{cmd.keywords[0]}"{cmd.keywords.length > 1 ? ` or "${cmd.keywords[1]}"` : ''}
              </Text>
            </View>
          </View>
        ))}
        {/* Back entry */}
        <View style={styles.cmdRow}>
          <MaterialIcons name="record-voice-over" size={15} color={GREEN} style={styles.cmdIcon} />
          <View style={styles.cmdText}>
            <Text style={styles.cmdLabel}>Go Back</Text>
            <Text style={styles.cmdHint}>Say: "back" or "go back"</Text>
          </View>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const MIC_SIZE = 100;
const RING_SIZE = MIC_SIZE + 36;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_GREEN_BG },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 44 : 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: WHITE,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: DARK_TEXT },

  /* Mic section */
  micSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  micRing: {
    position: 'absolute',
    top: 40 - (RING_SIZE - MIC_SIZE) / 2,
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: 'rgba(45,122,58,0.15)',
  },
  micBtn: {
    width: MIC_SIZE,
    height: MIC_SIZE,
    borderRadius: MIC_SIZE / 2,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: GREEN,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  micBtnActive: {
    backgroundColor: '#E53935',   // red while listening
    shadowColor: '#E53935',
  },
  statusMsg: {
    marginTop: 20,
    fontSize: 14,
    color: GRAY,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  transcriptBox: {
    marginTop: 16,
    backgroundColor: WHITE,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '100%',
    elevation: 1,
  },
  transcriptLabel: { fontSize: 11, color: GRAY, marginBottom: 4 },
  transcriptText: { fontSize: 15, color: DARK_TEXT, fontStyle: 'italic', textAlign: 'center' },
  matchedBadge: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C8E6C9',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  matchedText: { fontSize: 13, fontWeight: '700', color: GREEN },

  /* Commands list */
  cmdScroll: { flex: 1 },
  cmdContent: { paddingHorizontal: 20, paddingTop: 4 },
  cmdTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: GRAY,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  cmdRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 10,
    elevation: 1,
  },
  cmdIcon: { marginRight: 10, marginTop: 1 },
  cmdText: { flex: 1 },
  cmdLabel: { fontSize: 13, fontWeight: '600', color: DARK_TEXT },
  cmdHint: { fontSize: 11, color: GRAY, marginTop: 2 },
});
