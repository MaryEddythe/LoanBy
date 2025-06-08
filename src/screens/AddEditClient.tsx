import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AddEditClientProps } from '../navigation/types';
import { Client } from '../navigation/types';

const AddEditClient = ({ navigation, route }: AddEditClientProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [employment, setEmployment] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [address, setAddress] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    if (route.params?.client) {
      const { client } = route.params;
      setName(client.name);
      setPhone(client.phone);
      setEmployment(client.employment || '');
      setFacebookLink(client.facebookLink || '');
      setAddress(client.address || '');
      setLoanAmount(client.loanAmount?.toString() || '');
      setStartDate(client.startDate ? new Date(client.startDate) : undefined);
      setEndDate(client.endDate ? new Date(client.endDate) : undefined);
    }
  }, [route.params]);

  const onChangeStartDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowStartPicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      setStartDate(selectedDate);
    } else if (event.type === 'dismissed') {
      setShowStartPicker(false);
    }
  };

  const onChangeEndDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowEndPicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      setEndDate(selectedDate);
    } else if (event.type === 'dismissed') {
      setShowEndPicker(false);
    }
  };

  const saveClient = async () => {
    const client: Client = {
      id: route.params?.client?.id || Date.now().toString(),
      name,
      phone,
      employment,
      facebookLink,
      address,
      loanAmount: loanAmount ? parseFloat(loanAmount) : undefined,
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
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
        placeholder="Employment/Job"
        value={employment}
        onChangeText={setEmployment}
      />
      <TextInput
        style={styles.input}
        placeholder="Loan Amount"
        value={loanAmount}
        onChangeText={setLoanAmount}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Facebook Link"
        value={facebookLink}
        onChangeText={setFacebookLink}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
        multiline
      />
      <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.datePickerButton}>
        <Text style={styles.datePickerText}>
          {startDate ? startDate.toDateString() : 'Select Start Date'}
        </Text>
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={onChangeStartDate}
        />
      )}
      <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.datePickerButton}>
        <Text style={styles.datePickerText}>
          {endDate ? endDate.toDateString() : 'Select End Date'}
        </Text>
      </TouchableOpacity>
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={onChangeEndDate}
        />
      )}
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
  datePickerButton: {
    height: 50,
    justifyContent: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
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
