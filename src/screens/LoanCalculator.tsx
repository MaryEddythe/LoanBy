import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LoanCalculatorProps } from '../navigation/types';

const LoanCalculator = ({ navigation }: LoanCalculatorProps) => {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);

  const calculateLoan = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12;
    const t = parseFloat(time) * 12;
    
    if (p && r && t) {
      const payment = (p * r * Math.pow(1 + r, t)) / (Math.pow(1 + r, t) - 1);
      const total = payment * t;
      
      setMonthlyPayment(payment);
      setTotalInterest(total - p);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Loan Calculator</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Loan Amount"
        value={principal}
        onChangeText={setPrincipal}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Annual Interest Rate (%)"
        value={rate}
        onChangeText={setRate}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Loan Term (years)"
        value={time}
        onChangeText={setTime}
        keyboardType="numeric"
      />
      
      <TouchableOpacity style={styles.button} onPress={calculateLoan}>
        <Text style={styles.buttonText}>Calculate</Text>
      </TouchableOpacity>
      
      {monthlyPayment !== null && totalInterest !== null && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            Monthly Payment: ${monthlyPayment.toFixed(2)}
          </Text>
          <Text style={styles.resultText}>
            Total Interest: ${totalInterest.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default LoanCalculator;