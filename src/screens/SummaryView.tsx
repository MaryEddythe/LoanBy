import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SummaryViewProps } from '../navigation/types';

const SummaryView = ({ navigation }: SummaryViewProps) => {
  // These would come from your actual data
  const activeLoans = 15;
  const totalOutstanding = 45000;
  const paymentsThisMonth = 8;
  const totalPaymentsThisMonth = 4000;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Summary</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Active Loans</Text>
        <Text style={styles.cardValue}>{activeLoans}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Outstanding</Text>
        <Text style={styles.cardValue}>${totalOutstanding.toLocaleString()}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payments This Month</Text>
        <Text style={styles.cardValue}>{paymentsThisMonth}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Amount Received</Text>
        <Text style={styles.cardValue}>${totalPaymentsThisMonth.toLocaleString()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
});

export default SummaryView;