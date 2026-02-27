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

interface Option {
  key: string;
  label: string;
}

type Props = {
  value: string;
  options: Option[];
  onChange: (key: string) => void;
};

const DARK_TEXT = '#1B2B1C';
const GREEN = '#2D7A3A';

export default function CropPicker({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const currentLabel = options.find((o) => o.key === value)?.label || '';

  return (
    <View>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={styles.triggerText}>{currentLabel || 'Select crop'}</Text>
        <MaterialIcons name="arrow-drop-down" size={18} color={DARK_TEXT} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdown}>
                {options.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.option, value === opt.key && styles.optionActive]}
                    onPress={() => {
                      onChange(opt.key);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, value === opt.key && styles.optionTextActive]}>
                      {opt.label}
                    </Text>
                    {value === opt.key && <MaterialIcons name="check" size={16} color={GREEN} />}
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
    width: 220,
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
