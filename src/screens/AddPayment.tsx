import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { AddPaymentProps } from '../navigation/types';

interface Client {
  id: string;
  name: string;
  loanAmount?: number;
}

const AddPayment = ({ navigation }: AddPaymentProps) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [status, setStatus] = useState('Completed');
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock client data - replace with actual data from your storage
  const clients: Client[] = [
    { id: '1', name: 'John Doe', loanAmount: 5000 },
    { id: '2', name: 'Jane Smith', loanAmount: 3000 },
    { id: '3', name: 'Mike Johnson', loanAmount: 7500 },
    { id: '4', name: 'Sarah Wilson', loanAmount: 2000 },
  ];

  const paymentMethods = [
    { value: 'Cash', icon: '💵', color: '#28a745' },
    { value: 'Bank Transfer', icon: '🏦', color: '#007bff' },
    { value: 'Mobile Money', icon: '📱', color: '#fd7e14' },
    { value: 'Check', icon: '📝', color: '#6f42c1' },
    { value: 'Credit Card', icon: '💳', color: '#dc3545' },
  ];

  const paymentStatuses = [
    { value: 'Completed', color: '#28a745', bg: '#d4edda' },
    { value: 'Pending', color: '#ffc107', bg: '#fff3cd' },
    { value: 'Failed', color: '#dc3545', bg: '#f8d7da' },
  ];

  const formatAmount = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return numericValue;
  };

  const handleAmountChange = (value: string) => {
    const formatted = formatAmount(value);
    setAmount(formatted);
    
    // Clear amount error when user starts typing
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedClient) {
      newErrors.client = 'Please select a client';
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!description.trim()) {
      newErrors.description = 'Please enter a payment description';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      setDate(selectedDate);
    }
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSelectedClient = () => {
    return clients.find(client => client.id === selectedClient);
  };

  const handleAddPayment = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    const client = getSelectedClient();
    const paymentData = {
      clientId: selectedClient,
      clientName: client?.name,
      amount: parseFloat(amount),
      method,
      status,
      date: date.toISOString(),
      description: description.trim(),
      notes: notes.trim(),
    };

    Alert.alert(
      'Confirm Payment',
      `Record payment of $${parseFloat(amount).toLocaleString()} from ${client?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            // Here you would save the payment data
            console.log('Payment recorded:', paymentData);
            Alert.alert('Success', 'Payment recorded successfully!', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          }
        }
      ]
    );
  };

  const renderMethodButton = (methodData: typeof paymentMethods[0]) => (
    <TouchableOpacity
      key={methodData.value}
      style={[
        styles.methodButton,
        method === methodData.value && styles.methodButtonActive,
        { borderColor: methodData.color }
      ]}
      onPress={() => setMethod(methodData.value)}
    >
      <Text style={styles.methodIcon}>{methodData.icon}</Text>
      <Text style={[
        styles.methodText,
        method === methodData.value && { color: methodData.color }
      ]}>
        {methodData.value}
      </Text>
    </TouchableOpacity>
  );

  const renderStatusButton = (statusData: typeof paymentStatuses[0]) => (
    <TouchableOpacity
      key={statusData.value}
      style={[
        styles.statusButton,
        status === statusData.value && { 
          backgroundColor: statusData.bg,
          borderColor: statusData.color 
        }
      ]}
      onPress={() => setStatus(statusData.value)}
    >
      <Text style={[
        styles.statusText,
        status === statusData.value && { color: statusData.color }
      ]}>
        {statusData.value}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Record Payment</Text>
          <Text style={styles.subtitle}>Add a new payment record</Text>
        </View>

        {/* Client Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Select Client *</Text>
            <View style={[
              styles.pickerContainer,
              errors.client && styles.inputError
            ]}>
              <Picker
                selectedValue={selectedClient}
                onValueChange={setSelectedClient}
                style={styles.picker}
              >
                <Picker.Item label="Choose a client..." value="" />
                {clients.map(client => (
                  <Picker.Item 
                    key={client.id} 
                    label={`${client.name} (Loan: $${client.loanAmount?.toLocaleString() || 0})`} 
                    value={client.id} 
                  />
                ))}
              </Picker>
            </View>
            {errors.client && <Text style={styles.errorText}>{errors.client}</Text>}
          </View>

          {selectedClient && (
            <View style={styles.clientInfo}>
              <Text style={styles.clientInfoText}>
                Selected: {getSelectedClient()?.name}
              </Text>
              <Text style={styles.clientLoanAmount}>
                Loan Amount: ${getSelectedClient()?.loanAmount?.toLocaleString() || 0}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Payment Amount *</Text>
            <TextInput
              style={[
                styles.input,
                styles.amountInput,
                errors.amount && styles.inputError
              ]}
              placeholder="0.00"
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />
            {amount && (
              <Text style={styles.amountDisplay}>
                ${parseFloat(amount || '0').toLocaleString()}
              </Text>
            )}
            {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Payment Description *</Text>
            <TextInput
              style={[
                styles.input,
                errors.description && styles.inputError
              ]}
              placeholder="e.g., Monthly payment, Partial payment, etc."
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#999"
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Payment Date</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
              <Text style={styles.dateIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.methodGrid}>
            {paymentMethods.map(renderMethodButton)}
          </View>
        </View>

        {/* Payment Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Status</Text>
          <View style={styles.statusGrid}>
            {paymentStatuses.map(renderStatusButton)}
          </View>
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any additional notes about this payment..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.saveButton,
            (!selectedClient || !amount || !description.trim()) && styles.saveButtonDisabled
          ]} 
          onPress={handleAddPayment}
          disabled={!selectedClient || !amount || !description.trim()}
        >
          <Text style={styles.saveButtonText}>Record Payment</Text>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
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
  amountInput: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  amountDisplay: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  pickerContainer: {
    borderColor: '#dee2e6',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  clientInfo: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  clientInfoText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  clientLoanAmount: {
    fontSize: 14,
    color: '#1976d2',
    marginTop: 2,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    borderColor: '#dee2e6',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#212529',
  },
  dateIcon: {
    fontSize: 20,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  methodButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  methodButtonActive: {
    backgroundColor: '#f8f9ff',
  },
  methodIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  methodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
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
  saveButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AddPayment;