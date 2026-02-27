import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const BLUE = '#1A5276';

function DealerTabBar({ state, descriptors, navigation }: any) {
  const tabs = [
    { icon: 'home' as const, label: 'Home' },
    { icon: 'history' as const, label: 'Previous Deals' },
  ];

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const color = isFocused ? BLUE : '#888';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <MaterialIcons name={tabs[index].icon} size={24} color={color} />
            <Text style={[styles.tabLabel, { color }]}>{tabs[index].label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function DealerLayout() {
  return (
    <Tabs
      tabBar={(props) => <DealerTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="prev-deals" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#D6EAF8',
    height: 68,
    alignItems: 'center',
    paddingBottom: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 3,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
