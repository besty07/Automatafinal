import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface PriceData {
  date: string;
  closingPrice: number;
  highPrice: number;
  lowPrice: number;
}

interface PriceChartProps {
  data: PriceData[];
  cropLabel: string;
  height?: number;
}

export default function PriceChart({
  data,
  cropLabel,
  height = 280
}: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  // Prepare data for chart
  const chartData = {
    labels: data.slice(-6).map((d) => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        data: data.slice(-6).map((d) => d.closingPrice),
        color: (opacity = 1) => `rgba(45, 122, 58, ${opacity})`, // Green
        strokeWidth: 3,
      },
    ],
    legend: ['Closing Price'],
  };

  const minPrice = Math.min(...data.map((d) => d.lowPrice)) * 0.98;
  const maxPrice = Math.max(...data.map((d) => d.highPrice)) * 1.02;

  return (
    <View style={styles.container}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>{cropLabel} - Price Trend</Text>
      </View>

      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
        height={height}
        yAxisLabel="₹"
        yAxisSuffix=""
        ymin={minPrice}
        ymax={maxPrice}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(45, 122, 58, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(27, 43, 28, ${opacity})`,
          style: {
            borderRadius: 12,
          },
          propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: '#2D7A3A',
            fill: '#fff',
          },
          propsForBackgroundLines: {
            strokeDasharray: '5',
            stroke: '#ddd',
            strokeWidth: 1,
          },
        }}
        bezier
        style={styles.chart}
      />

      {/* Stats below chart */}
      <View style={styles.statsContainer}>
        <StatCard
          label="High"
          value={`₹${Math.max(...data.map((d) => d.highPrice)).toFixed(0)}`}
          color="#4CAF50"
        />
        <StatCard
          label="Low"
          value={`₹${Math.min(...data.map((d) => d.lowPrice)).toFixed(0)}`}
          color="#FF9800"
        />
        <StatCard
          label="Current"
          value={`₹${data[data.length - 1].closingPrice.toFixed(0)}`}
          color="#2D7A3A"
        />
        <StatCard
          label="Avg"
          value={`₹${(data.reduce((sum, d) => sum + d.closingPrice, 0) / data.length).toFixed(0)}`}
          color="#2196F3"
        />
      </View>
    </View>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  color: string;
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statColorBar, { backgroundColor: color }]} />
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B2B1C',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  statColorBar: {
    width: 4,
  },
  statContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B2B1C',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});
