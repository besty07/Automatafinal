// Mic tab – acts as a voice command launcher from the home tab bar
// Tapping the FAB in the tab bar navigates here
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

export default function MicScreen() {
  // Immediately bounce back to home
  useEffect(() => {
    router.replace('/(home)/' as any);
  }, []);
  return <View style={{ flex: 1 }} />;
}
