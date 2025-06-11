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

  const loans = [
    { id: '1', clientName: 'John Doe' },
    { id: '2', clientName: 'Jane Smith' },
  ];

  const renderItem = ({ item }: { item: Payment }) => {
    const client = loans.find(loan => loan.id === item.loanId);
    const clientName = client ? client.clientName : 'Unknown Client';

    return (
      <View style={styles.item}>
        <Text style={styles.clientName}>{clientName}</Text>
        <Text style={styles.amount}>${item.amount.toLocaleString()}</Text>
        <View style={styles.row}>
          <Text style={styles.date}>{item.date}</Text>
          <Text style={styles.method}>{item.method}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={payments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No payments found</Text>}
      />
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
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
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