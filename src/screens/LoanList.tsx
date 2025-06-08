import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { LoanListProps } from '../navigation/types';
import { Loan } from '../navigation/types';

const LoanList = ({ navigation }: LoanListProps) => {
  // Temporary dummy data - replace with your actual data
const loans: Loan[] = [
    { id: '1', clientName: 'John Doe', amount: 5000, startDate: '2023-05-01', endDate: '2024-05-01', status: 'Active' },
    { id: '2', clientName: 'Jane Smith', amount: 3000, startDate: '2023-06-01', endDate: '2024-06-01', status: 'Active' },
    { id: '3', clientName: 'Robert Johnson', amount: 7000, startDate: '2023-04-01', endDate: '2024-04-01', status: 'Paid' },
  ];

  const renderItem = ({ item }: { item: Loan }) => (
    <TouchableOpacity 
      style={styles.item}
      onPress={() => navigation.navigate('LoanDetails', { loan: item })}
    >
      <Text style={styles.clientName}>{item.clientName}</Text>
      <Text style={styles.amount}>${item.amount.toLocaleString()}</Text>
      <View style={styles.row}>
        <Text style={styles.date}>Start: {item.startDate}</Text>
        <Text style={styles.date}>End: {item.endDate}</Text>
        <Text style={[styles.status, { color: item.status === 'Active' ? 'green' : 'blue' }]}>
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={loans}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No loans found</Text>}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateLoan')}
      >
        <Text style={styles.addButtonText}>+ Create Loan</Text>
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
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amount: {
    fontSize: 18,
    color: '#3b82f6',
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
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

export default LoanList;