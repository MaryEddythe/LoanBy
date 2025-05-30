import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { PaymentLogsProps } from '../navigation/types';

interface Payment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  method: string;
}

const PaymentLogs = ({ navigation }: PaymentLogsProps) => {
  // Temporary dummy data - replace with your actual data
  const payments: Payment[] = [
    { id: '1', loanId: '1', amount: 500, date: '2023-06-15', method: 'Cash' },
    { id: '2', loanId: '1', amount: 500, date: '2023-07-15', method: 'Bank Transfer' },
    { id: '3', loanId: '2', amount: 300, date: '2023-07-20', method: 'Mobile Money' },
  ];

  const renderItem = ({ item }: { item: Payment }) => (
    <View style={styles.item}>
      <Text style={styles.amount}>${item.amount.toLocaleString()}</Text>
      <View style={styles.row}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.method}>{item.method}</Text>
      </View>
      <Text style={styles.loanId}>Loan ID: {item.loanId}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={payments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No payments found</Text>}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddPayment')}
      >
        <Text style={styles.addButtonText}>+ Add Payment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  amount: {
    fontSize: 18,
    color: 'green',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  method: {
    fontSize: 14,
    color: '#666',
  },
  loanId: {
    fontSize: 14,
    color: '#3b82f6',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PaymentLogs;