import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoanListProps } from '../navigation/types';
import { Client } from '../navigation/types';

const LoanList = ({ navigation }: LoanListProps) => {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const storedClients = await AsyncStorage.getItem('clients');
      if (storedClients) {
        setClients(JSON.parse(storedClients));
      }
    } catch (error) {
      console.error('Failed to load clients', error);
    }
  };

  const renderItem = ({ item }: { item: Client }) => {
    const loan = {
      id: item.id,
      clientName: item.name,
      amount: item.loanAmount || 0,
      startDate: '',
      endDate: '',
      status: 'Active' as const,
    };
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('LoanDetails', { loan })}
      >
        <Text style={styles.clientName}>{item.name}</Text>
      <Text style={styles.amount}>${item.loanAmount?.toLocaleString() || 0}</Text>
      <View style={styles.row}>
        <Text style={styles.amount}>Start: {loan.startDate || 'N/A'}</Text>
        <Text style={styles.amount}>End: {loan.endDate || 'N/A'}</Text>
        <Text style={styles.status}>Loan</Text>
      </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={clients}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No loans found</Text>}
      />
      {/* Removed the Create Loan button as per user request */}
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
  status: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
});

export default LoanList;
