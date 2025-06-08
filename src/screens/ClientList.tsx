import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClientListProps } from '../navigation/types';
import { Client } from '../navigation/types';

const ClientList = ({ navigation }: ClientListProps) => {
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

  const handleOpenURL = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  };

  const renderItem = ({ item }: { item: Client }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('AddEditClient', { client: item })}
    >
      <Text style={styles.name}>{item.name}</Text>
      {item.employment ? <Text style={styles.employment}>{item.employment}</Text> : null}
      <Text style={styles.phone}>{item.phone}</Text>
      {item.facebookLink && (
        <Text style={styles.facebookLink} onPress={() => handleOpenURL(item.facebookLink!)}>
          Facebook Profile
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={clients}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No clients found</Text>}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddEditClient')}
      >
        <Text style={styles.addButtonText}>+ Add Client</Text>
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
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  employment: {
    fontSize: 14,
    color: '#444',
    fontStyle: 'italic',
  },
  phone: {
    fontSize: 14,
    color: '#666',
  },
  facebookLink: {
    fontSize: 14,
    color: '#3b5998',
    textDecorationLine: 'underline',
    marginTop: 4,
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

export default ClientList;