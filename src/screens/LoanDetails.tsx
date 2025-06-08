import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LoanDetailsProps } from '../navigation/types';

const LoanDetails = ({ route }: LoanDetailsProps) => {
  const { loan } = route.params;

  // Dummy payment history data for this loan
  const paymentHistory = [
    { id: 'p1', amount: 500, date: '2023-06-15', method: 'Cash' },
    { id: 'p2', amount: 500, date: '2023-07-15', method: 'Bank Transfer' },
  ];

  // Dummy next payment date
  const nextPaymentDate = '2023-08-15';

  return (
    <View style={styles.container}>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Client:</Text>
        <Text style={styles.value}>{loan.clientName}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Amount:</Text>
        <Text style={styles.value}>${loan.amount.toLocaleString()}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Start Date:</Text>
        <Text style={styles.value}>{loan.startDate}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>End Date:</Text>
        <Text style={styles.value}>{loan.endDate}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Status:</Text>
        <Text style={[styles.value, { color: loan.status === 'Active' ? 'green' : 'blue' }]}>
          {loan.status}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment History</Text>
        {paymentHistory.map(payment => (
          <View key={payment.id} style={styles.detailRow}>
            <Text style={styles.label}>Amount:</Text>
            <Text style={styles.value}>${payment.amount.toLocaleString()}</Text>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{payment.date}</Text>
            <Text style={styles.label}>Method:</Text>
            <Text style={styles.value}>{payment.method}</Text>
          </View>
        ))}
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Next Payment Date:</Text>
        <Text style={styles.value}>{nextPaymentDate}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 16,
    color: '#666',
    width: '30%',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    width: '70%',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});

export default LoanDetails;