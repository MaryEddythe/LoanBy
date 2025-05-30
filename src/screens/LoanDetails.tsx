import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LoanDetailsProps } from '../navigation/types';

const LoanDetails = ({ route }: LoanDetailsProps) => {
  const { loan } = route.params;

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
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{loan.date}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Status:</Text>
        <Text style={[styles.value, { color: loan.status === 'Active' ? 'green' : 'blue' }]}>
          {loan.status}
        </Text>
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
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoanDetails;