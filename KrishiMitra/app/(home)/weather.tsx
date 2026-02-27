import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from 'react-native';

const GREEN = '#2D7A3A';
const LIGHT_GREEN_BG = '#E8F5E9';
const DARK_TEXT = '#1B2B1C';
const GRAY_TEXT = '#555';
const BORDER = '#C8E6C9';

// ⚠️ IMPORTANT: Keep your OpenWeather API Key here
const API_KEY = process.env.EXPO_PUBLIC_WEATHER_KEY;

export default function WeatherScreen() {
  const [location, setLocation] = useState('');
  const [dailyForecasts, setDailyForecasts] = useState<any[]>([]); // Holds Today + 5 Future Days
  const [selectedIndex, setSelectedIndex] = useState(0); // Tracks which day is currently shown in the big card
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError('');
    setDailyForecasts([]);
    setSelectedIndex(0); // Reset to "Today" on new search

    try {
      // 1. Fetch Current Weather (for Today's data)
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      const currentData = await currentRes.json();

      // 2. Fetch 5-Day Forecast (for future dates)
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      const forecastJson = await forecastRes.json();

      if (currentRes.ok && forecastRes.ok) {
        
        // Format Today's data into a standard object
        const todayObj = {
          id: 'today',
          cityName: currentData.name,
          country: currentData.sys.country,
          dayName: 'Today',
          dateText: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          temp: Math.round(currentData.main.temp),
          desc: currentData.weather[0].description,
          icon: currentData.weather[0].icon,
          humidity: currentData.main.humidity,
          windSpeed: currentData.wind.speed,
          pressure: currentData.main.pressure,
        };

        // The forecast API returns data every 3 hours. Filter it to grab roughly midday readings.
        const upcomingDays = forecastJson.list.filter((reading: any) => 
          reading.dt_txt.includes("12:00:00")
        );

        // Format the upcoming days to match Today's data structure
        const formattedUpcoming = upcomingDays.map((day: any) => {
          const dateObj = new Date(day.dt_txt);
          return {
            id: day.dt_txt,
            cityName: forecastJson.city.name, // Keep city name consistent across all days
            country: forecastJson.city.country,
            dayName: dateObj.toLocaleDateString('en-US', { weekday: 'short' }), // e.g., "Mon"
            dateText: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // e.g., "Feb 28"
            temp: Math.round(day.main.temp),
            desc: day.weather[0].description,
            icon: day.weather[0].icon,
            humidity: day.main.humidity,
            windSpeed: day.wind.speed,
            pressure: day.main.pressure,
          };
        });

        // Combine Today + Upcoming Days into one list
        setDailyForecasts([todayObj, ...formattedUpcoming]);

      } else {
        setError(currentData.message || 'Location not found. Please try again.');
      }
    } catch (err) {
      setError('Failed to fetch weather. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // Determine the active data to show in the big card based on what user clicked
  const selectedData = dailyForecasts.length > 0 ? dailyForecasts[selectedIndex] : null;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weather Forecast</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Search Box */}
        <View style={styles.searchCard}>
          <Text style={styles.label}>Enter your Location/City</Text>
          <View style={styles.searchWrap}>
            <MaterialIcons name="location-on" size={20} color={GREEN} style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g., Pune"
              placeholderTextColor="#aaa"
              value={location}
              onChangeText={setLocation}
              onSubmitEditing={fetchWeather}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={fetchWeather}>
              <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={GREEN} />
            <Text style={styles.loadingText}>Fetching weather data...</Text>
          </View>
        )}

        {/* BIG CARD - Shows the currently selected day */}
        {selectedData && !loading && (
          <View style={styles.weatherCard}>
            <View style={styles.weatherHeader}>
              <Text style={styles.cityName}>{selectedData.cityName}, {selectedData.country}</Text>
              {/* Show the selected date at the top of the big card too */}
              <Text style={styles.selectedDateText}>{selectedData.dayName}, {selectedData.dateText}</Text>
              <Text style={styles.weatherDesc}>{selectedData.desc}</Text>
            </View>

            <View style={styles.mainWeather}>
              <Image 
                source={{ uri: `https://openweathermap.org/img/wn/${selectedData.icon}@4x.png` }} 
                style={styles.weatherIcon} 
              />
              <Text style={styles.temperature}>{selectedData.temp}°C</Text>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailBox}>
                <MaterialIcons name="water-drop" size={24} color="#4FC3F7" />
                <Text style={styles.detailValue}>{selectedData.humidity}%</Text>
                <Text style={styles.detailLabel}>Humidity</Text>
              </View>
              <View style={styles.detailBox}>
                <MaterialIcons name="air" size={24} color="#90A4AE" />
                <Text style={styles.detailValue}>{selectedData.windSpeed} m/s</Text>
                <Text style={styles.detailLabel}>Wind Speed</Text>
              </View>
              <View style={styles.detailBox}>
                <MaterialIcons name="compress" size={24} color="#FFB74D" />
                <Text style={styles.detailValue}>{selectedData.pressure} hPa</Text>
                <Text style={styles.detailLabel}>Pressure</Text>
              </View>
            </View>
          </View>
        )}

        {/* BOTTOM ROW - Scrollable List of All Days */}
        {dailyForecasts.length > 0 && !loading && (
          <View style={styles.forecastSection}>
            <Text style={styles.forecastTitle}>Upcoming Forecast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.forecastScroll}>
              {dailyForecasts.map((day, index) => (
                <TouchableOpacity 
                  key={index} 
                  activeOpacity={0.7}
                  onPress={() => setSelectedIndex(index)} // Swaps the data in the big card
                  style={[
                    styles.forecastCard, 
                    selectedIndex === index && styles.selectedForecastCard // Highlights the clicked card
                  ]}
                >
                  <Text style={[styles.forecastDay, selectedIndex === index && styles.selectedText]}>{day.dayName}</Text>
                  <Text style={[styles.forecastDate, selectedIndex === index && styles.selectedText]}>{day.dateText}</Text>
                  <Image 
                    source={{ uri: `https://openweathermap.org/img/wn/${day.icon}@2x.png` }} 
                    style={styles.forecastIcon} 
                  />
                  <Text style={[styles.forecastTemp, selectedIndex === index && styles.selectedText]}>{day.temp}°</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_GREEN_BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: LIGHT_GREEN_BG },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: GREEN },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },

  searchCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  label: { fontSize: 14, fontWeight: '600', color: DARK_TEXT, marginBottom: 10 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: BORDER, borderRadius: 12, backgroundColor: '#FAFFF9', paddingLeft: 12, height: 50, overflow: 'hidden' },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: DARK_TEXT },
  searchBtn: { backgroundColor: GREEN, height: '100%', paddingHorizontal: 16, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  errorText: { color: '#E53935', fontSize: 13, marginTop: 8 },

  loadingContainer: { alignItems: 'center', marginTop: 40 },
  loadingText: { marginTop: 12, color: GRAY_TEXT, fontSize: 15 },

  weatherCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3, marginBottom: 24 },
  weatherHeader: { alignItems: 'center', marginBottom: 16 },
  cityName: { fontSize: 22, fontWeight: '700', color: DARK_TEXT },
  selectedDateText: { fontSize: 15, fontWeight: '600', color: GREEN, marginTop: 4 },
  weatherDesc: { fontSize: 16, color: GRAY_TEXT, textTransform: 'capitalize', marginTop: 4 },
  mainWeather: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  weatherIcon: { width: 100, height: 100 },
  temperature: { fontSize: 48, fontWeight: '800', color: GREEN, marginLeft: 8 },
  detailsGrid: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#EEEEEE', paddingTop: 20 },
  detailBox: { alignItems: 'center', flex: 1 },
  detailValue: { fontSize: 16, fontWeight: '700', color: DARK_TEXT, marginTop: 8 },
  detailLabel: { fontSize: 12, color: GRAY_TEXT, marginTop: 4 },

  /* Forecast Horizontal Row */
  forecastSection: { marginTop: 4 },
  forecastTitle: { fontSize: 18, fontWeight: '700', color: DARK_TEXT, marginBottom: 12 },
  forecastScroll: { gap: 12, paddingBottom: 10 },
  forecastCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', width: 90, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1.5, borderColor: 'transparent' },
  selectedForecastCard: { borderColor: GREEN, backgroundColor: '#F0FFF0' }, // Highlight color for active card
  forecastDay: { fontSize: 15, fontWeight: '700', color: DARK_TEXT },
  forecastDate: { fontSize: 12, color: GRAY_TEXT, marginTop: 2 },
  forecastIcon: { width: 45, height: 45, marginVertical: 6 },
  forecastTemp: { fontSize: 18, fontWeight: '700', color: DARK_TEXT },
  selectedText: { color: GREEN }, // Makes text green when selected
});