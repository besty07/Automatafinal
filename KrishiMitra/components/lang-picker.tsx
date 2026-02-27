/**
 * Reusable language-picker dropdown.
 * Drop it anywhere — it reads and writes to the global LanguageContext.
 */
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { useLanguage } from '@/contexts/LanguageContext';
import { Locale } from '@/constants/translations';

const GREEN = '#2D7A3A';
const DARK_TEXT = '#1B2B1C';

const LOCALES: Locale[] = ['en', 'hi', 'mr'];

export default function LangPicker() {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const LABELS: Record<Locale, string> = {
    en: t.langEnglish,
    hi: t.langHindi,
    mr: t.langMarathi,
  };

  return (
    <View>
      {/* Trigger button */}
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <MaterialIcons name="language" size={16} color={DARK_TEXT} />
        <Text style={styles.triggerText}>{t.langLabel}</Text>
        <MaterialIcons name="arrow-drop-down" size={18} color={DARK_TEXT} />
      </TouchableOpacity>

      {/* Dropdown modal */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdown}>
                {LOCALES.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    style={[styles.option, locale === loc && styles.optionActive]}
                    onPress={() => {
                      setLocale(loc);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, locale === loc && styles.optionTextActive]}>
                      {LABELS[loc]}
                    </Text>
                    {locale === loc && (
                      <MaterialIcons name="check" size={16} color={GREEN} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 3,
    backgroundColor: '#fff',
  },
  triggerText: {
    fontSize: 13,
    color: DARK_TEXT,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    paddingTop: 90,
    paddingLeft: 16,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 6,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionActive: {
    backgroundColor: '#E8F5E9',
  },
  optionText: {
    fontSize: 15,
    color: DARK_TEXT,
  },
  optionTextActive: {
    color: GREEN,
    fontWeight: '700',
  },
});
