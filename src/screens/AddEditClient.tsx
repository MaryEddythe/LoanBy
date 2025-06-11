import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  ScrollView,
  KeyboardAvoidingView 
} from 'react-native';
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
    if (event.type === 'set' && selectedDate) {
      setStartDate(selectedDate);
    }
    if (Platform.OS !== 'ios') {
      setShowStartPicker(false);
    }
  };

  const onChangeEndDate = (event: any, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      setEndDate(selectedDate);
    }
    if (Platform.OS !== 'ios') {
      setShowEndPicker(false);
    }
  };

  // Helper function to format date as "Month day year"
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString(undefined, options);
  };

  const saveClient = async () => {
    if (!name.trim()) {
      alert('Please enter a name');
      return;
    }

    const client: Client = {
      id: route.params?.client?.id || Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      employment: employment.trim(),
      facebookLink: facebookLink.trim(),
      address: address.trim(),
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
      alert('Failed to save client. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {route.params?.client ? 'Edit Client' : 'Add New Client'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[styles.input, !name.trim() && styles.inputError]}
              placeholder="Enter full name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Employment/Job</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter job title or employment status"
              value={employment}
              onChangeText={setEmployment}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter full address"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Facebook Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Facebook profile link"
              value={facebookLink}
              onChangeText={setFacebookLink}
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Loan Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter loan amount"
              value={loanAmount}
              onChangeText={setLoanAmount}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateContainer}>
              <Text style={styles.label}>Start Date</Text>
              <TouchableOpacity 
                onPress={() => setShowStartPicker(true)} 
                style={[styles.datePickerButton, startDate && styles.datePickerButtonSelected]}
              >
                <Text style={[
                  styles.datePickerText, 
                  startDate ? styles.datePickerTextSelected : styles.datePickerTextPlaceholder
                ]}>
                  {startDate ? formatDate(startDate) : 'Select Start Date'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateContainer}>
              <Text style={styles.label}>End Date</Text>
              <TouchableOpacity 
                onPress={() => setShowEndPicker(true)} 
                style={[styles.datePickerButton, endDate && styles.datePickerButtonSelected]}
              >
                <Text style={[
                  styles.datePickerText, 
                  endDate ? styles.datePickerTextSelected : styles.datePickerTextPlaceholder
                ]}>
                  {endDate ? formatDate(endDate) : 'Select End Date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={onChangeStartDate}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={onChangeEndDate}
          />
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={saveClient}>
          <Text style={styles.saveButtonText}>
            {route.params?.client ? 'Update Client' : 'Save Client'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderColor: '#dee2e6',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#212529',
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateContainer: {
    flex: 1,
  },
  datePickerButton: {
    height: 50,
    justifyContent: 'center',
    borderColor: '#dee2e6',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  datePickerButtonSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#f8f9ff',
  },
  datePickerText: {
    fontSize: 16,
  },
  datePickerTextSelected: {
    color: '#212529',
    fontWeight: '500',
  },
  datePickerTextPlaceholder: {
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AddEditClient;