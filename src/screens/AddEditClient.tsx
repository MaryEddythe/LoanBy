import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AddEditClientProps } from '../navigation/types';
import { Client } from '../navigation/types';

const AddEditClient = ({ navigation, route }: AddEditClientProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  useEffect(() => {
    if (route.params?.client) {
      const { client } = route.params;
      setName(client.name);
      setPhone(client.phone);
      setEmail(client.email || '');
      setAddress(client.address || '');
    }
  }, [route.params]);

  const saveClient = async () => {
    const client: Client = {
      id: route.params?.client?.id || Date.now().toString(),
      name,
      phone,
      email,
      address,
    };

    try {
      const storedClients = await AsyncStorage.getItem('clients');
      let clients: Client[] = storedClients ? JSON.parse(storedClients) : [];
      
      if (route.params?.client) {
        // Update existing client
        clients = clients.map(c => c.id === client.id ? client : c);
      } else {
        // Add new client
        clients.push(client);
      }
      
      await AsyncStorage.setItem('clients', JSON.stringify(clients));
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save client', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
        multiline
      />
      <TouchableOpacity style={styles.saveButton} onPress={saveClient}>
        <Text style={styles.saveButtonText}>Save Client</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddEditClient;