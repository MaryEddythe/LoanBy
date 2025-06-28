import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  StatusBar,
  Alert,
  Share,
  Platform
} from 'react-native';
import { LoanCalculatorProps } from '../navigation/types';

interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principalAmount: number;
}

interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

const LoanCalculator = ({ navigation }: LoanCalculatorProps) => {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [termValue, setTermValue] = useState('');
  const [termType, setTermType] = useState<'months' | 'years'>('years');
  const [result, setResult] = useState<LoanResult | null>(null);
  const [amortization, setAmortization] = useState<AmortizationEntry[]>([]);
  const [showAmortization, setShowAmortization] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return numericValue;
  };

  const validateInputs = () => {
    const newErrors: Record<string, string> = {};

    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseFloat(termValue);

    if (!principal || p <= 0) {
      newErrors.principal = 'Please enter a valid loan amount';
    }

    if (!rate || r <= 0 || r > 100) {
      newErrors.rate = 'Please enter a valid interest rate (0-100%)';
    }

    if (!termValue || t <= 0) {
      newErrors.term = 'Please enter a valid loan term';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateLoan = () => {
    if (!validateInputs()) {
      Alert.alert('Validation Error', 'Please correct the errors and try again.');
      return;
    }

    const p = parseFloat(principal);
    const annualRate = parseFloat(rate) / 100;
    const monthlyRate = annualRate / 12;
    const totalMonths = termType === 'years' ? parseFloat(termValue) * 12 : parseFloat(termValue);
    
    if (monthlyRate === 0) {
      // Simple calculation for 0% interest
      const monthlyPayment = p / totalMonths;
      const totalPayment = p;
      const totalInterest = 0;

      setResult({
        monthlyPayment,
        totalPayment,
        totalInterest,
        principalAmount: p
      });
    } else {
      // Standard loan calculation
      const monthlyPayment = (p * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                            (Math.pow(1 + monthlyRate, totalMonths) - 1);
      const totalPayment = monthlyPayment * totalMonths;
      const totalInterest = totalPayment - p;

      setResult({
        monthlyPayment,
        totalPayment,
        totalInterest,
        principalAmount: p
      });

      // Generate amortization schedule
      generateAmortizationSchedule(p, monthlyRate, totalMonths, monthlyPayment);
    }
  };

  const generateAmortizationSchedule = (
    principal: number, 
    monthlyRate: number, 
    totalMonths: number, 
    monthlyPayment: number
  ) => {
    const schedule: AmortizationEntry[] = [];
    let balance = principal;

    for (let month = 1; month <= Math.min(totalMonths, 12); month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;

      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });
    }

    setAmortization(schedule);
  };

  const clearAll = () => {
    setPrincipal('');
    setRate('');
    setTermValue('');
    setResult(null);
    setAmortization([]);
    setErrors({});
  };

  const shareResults = async () => {
    if (!result) return;

    const message = `Loan Calculation Results:
Loan Amount: ${formatCurrency(result.principalAmount).replace('PHP', '₱')}
Interest Rate: ${rate}% annually
Term: ${termValue} ${termType}

Monthly Payment: ${formatCurrency(result.monthlyPayment).replace('PHP', '₱')}
Total Payment: ${formatCurrency(result.totalPayment).replace('PHP', '₱')}
Total Interest: ${formatCurrency(result.totalInterest).replace('PHP', '₱')}`;

    try {
      await Share.share({ message });
    } catch (error) {
      Alert.alert('Error', 'Failed to share results');
    }
  };

  const getInterestPercentage = () => {
    if (!result) return 0;
    return (result.totalInterest / result.totalPayment) * 100;
  };

  return (
    <View style={styles.gradientBackground}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
      <View style={styles.stickyHeader}>
        <Text style={styles.title}>Loan Calculator</Text>
        <Text style={styles.subtitle}>Calculate your loan payments and interest</Text>
      </View>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Input Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Loan Amount *</Text>
            <View style={styles.inputShadow}>
              <TextInput
                style={[
                  styles.input,
                  styles.currencyInput,
                  errors.principal && styles.inputError
                ]}
                placeholder="0"
                value={principal}
                onChangeText={(value) => {
                  setPrincipal(formatNumber(value));
                  if (errors.principal) setErrors(prev => ({ ...prev, principal: '' }));
                }}
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
              <Text style={styles.currencySymbol}>₱</Text>
            </View>
            {errors.principal && <Text style={styles.errorText}>{errors.principal}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Annual Interest Rate *</Text>
            <View style={styles.inputShadow}>
              <TextInput
                style={[
                  styles.input,
                  styles.percentInput,
                  errors.rate && styles.inputError
                ]}
                placeholder="0.0"
                value={rate}
                onChangeText={(value) => {
                  setRate(formatNumber(value));
                  if (errors.rate) setErrors(prev => ({ ...prev, rate: '' }));
                }}
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
              <Text style={styles.percentSymbol}>%</Text>
            </View>
            {errors.rate && <Text style={styles.errorText}>{errors.rate}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Loan Term *</Text>
            <View style={styles.termContainer}>
              <View style={[styles.inputShadow, {flex: 1}]}>
                <TextInput
                  style={[
                    styles.input,
                    styles.termInput,
                    errors.term && styles.inputError
                  ]}
                  placeholder="0"
                  value={termValue}
                  onChangeText={(value) => {
                    setTermValue(formatNumber(value));
                    if (errors.term) setErrors(prev => ({ ...prev, term: '' }));
                  }}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.termToggle}>
                <TouchableOpacity
                  style={[
                    styles.termButton,
                    termType === 'years' && styles.termButtonActive
                  ]}
                  onPress={() => setTermType('years')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.termButtonText,
                    termType === 'years' && styles.termButtonTextActive
                  ]}>
                    Years
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.termButton,
                    termType === 'months' && styles.termButtonActive
                  ]}
                  onPress={() => setTermType('months')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.termButtonText,
                    termType === 'months' && styles.termButtonTextActive
                  ]}>
                    Months
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {errors.term && <Text style={styles.errorText}>{errors.term}</Text>}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={clearAll} activeOpacity={0.8}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.calculateButton} onPress={calculateLoan} activeOpacity={0.8}>
            <Text style={styles.calculateButtonText}>Calculate</Text>
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {result && (
          <View style={styles.section}>
            <View style={styles.resultHeader}>
              <Text style={styles.sectionTitle}>Calculation Results</Text>
              <TouchableOpacity style={styles.shareButton} onPress={shareResults} activeOpacity={0.8}>
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            </View>

            {/* Main Results */}
            <View style={styles.resultGrid}>
              <View style={styles.resultCardShadow}>
                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>Monthly Payment</Text>
                  <Text style={styles.resultValue}>
                    {formatCurrency(result.monthlyPayment)}
                  </Text>
                </View>
              </View>
              <View style={styles.resultCardShadow}>
                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>Total Payment</Text>
                  <Text style={styles.resultValue}>
                    {formatCurrency(result.totalPayment)}
                  </Text>
                </View>
              </View>
              <View style={styles.resultCardShadow}>
                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>Total Interest</Text>
                  <Text style={[styles.resultValue, styles.interestValue]}>
                    {formatCurrency(result.totalInterest)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Payment Breakdown */}
            <View style={styles.breakdownContainer}>
              <Text style={styles.breakdownTitle}>Payment Breakdown</Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      styles.principalFill,
                      { width: `${100 - getInterestPercentage()}%` }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.progressFill,
                      styles.interestFill,
                      { width: `${getInterestPercentage()}%` }
                    ]} 
                  />
                </View>
                
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, styles.principalDot]} />
                    <Text style={styles.legendText}>
                      Principal: {formatCurrency(result.principalAmount)} 
                      ({(100 - getInterestPercentage()).toFixed(1)}%)
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, styles.interestDot]} />
                    <Text style={styles.legendText}>
                      Interest: {formatCurrency(result.totalInterest)} 
                      ({getInterestPercentage().toFixed(1)}%)
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Amortization Schedule */}
            {amortization.length > 0 && (
              <View style={styles.amortizationContainer}>
                <TouchableOpacity
                  style={styles.amortizationHeader}
                  onPress={() => setShowAmortization(!showAmortization)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.amortizationTitle}>
                    First Year Payment Schedule
                  </Text>
                  <Text style={styles.amortizationToggle}>
                    {showAmortization ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>

                {showAmortization && (
                  <View style={styles.amortizationTable}>
                    <View style={styles.tableHeader}>
                      <Text style={styles.tableHeaderText}>Month</Text>
                      <Text style={styles.tableHeaderText}>Payment</Text>
                      <Text style={styles.tableHeaderText}>Principal</Text>
                      <Text style={styles.tableHeaderText}>Interest</Text>
                      <Text style={styles.tableHeaderText}>Balance</Text>
                    </View>
                    
                    {amortization.map((entry, idx) => (
                      <View key={entry.month} style={[
                        styles.tableRow,
                        idx % 2 === 1 && styles.tableRowAlt
                      ]}>
                        <Text style={styles.tableCellText}>{entry.month}</Text>
                        <Text style={styles.tableCellText}>
                          {formatCurrency(entry.payment)}
                        </Text>
                        <Text style={styles.tableCellText}>
                          {formatCurrency(entry.principal)}
                        </Text>
                        <Text style={styles.tableCellText}>
                          {formatCurrency(entry.interest)}
                        </Text>
                        <Text style={styles.tableCellText}>
                          {formatCurrency(entry.balance)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    backgroundColor: '#e0e7ff',
  },
  stickyHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
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
    marginTop: 20,
    marginHorizontal: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 8,
    letterSpacing: 0.2,
  },
  presetContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  presetButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  presetName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 4,
  },
  presetDetails: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  inputContainer: {
    marginBottom: 22,
    position: 'relative',
  },
  inputShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    height: 54,
    borderColor: '#dee2e6',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    backgroundColor: '#fff',
    color: '#212529',
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  currencyInput: {
    paddingLeft: 40,
    textAlign: 'right',
  },
  currencySymbol: {
    position: 'absolute',
    left: 16,
    top: 18,
    fontSize: 18,
    color: '#6c757d',
    fontWeight: '500',
    zIndex: 2,
  },
  percentInput: {
    paddingRight: 40,
    textAlign: 'right',
  },
  percentSymbol: {
    position: 'absolute',
    right: 16,
    top: 18,
    fontSize: 18,
    color: '#6c757d',
    fontWeight: '500',
    zIndex: 2,
  },
  termContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termInput: {
    flex: 1,
    marginRight: 12,
  },
  termToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 2,
    marginLeft: 0,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  termButtonActive: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  termButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  termButtonTextActive: {
    color: '#fff',
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
    marginTop: 2,
    marginBottom: 2,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  calculateButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  shareButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  resultGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 8,
  },
  resultCardShadow: {
    flex: 1,
    borderRadius: 12,
    marginHorizontal: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
    backgroundColor: 'transparent',
  },
  resultCard: {
    backgroundColor: '#f8f9fa',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  resultLabel: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  interestValue: {
    color: '#dc3545',
  },
  breakdownContainer: {
    marginBottom: 24,
    marginTop: 8,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 16,
    letterSpacing: 0.1,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 22,
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  progressFill: {
    height: '100%',
  },
  principalFill: {
    backgroundColor: '#28a745',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  interestFill: {
    backgroundColor: '#dc3545',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  principalDot: {
    backgroundColor: '#28a745',
  },
  interestDot: {
    backgroundColor: '#dc3545',
  },
  legendText: {
    fontSize: 12,
    color: '#6c757d',
    flex: 1,
    fontWeight: '500',
  },
  amortizationContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 20,
    marginTop: 12,
  },
  amortizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  amortizationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#495057',
  },
  amortizationToggle: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: '700',
    marginLeft: 8,
  },
  amortizationTable: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0e7ff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#495057',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    backgroundColor: '#fff',
  },
  tableRowAlt: {
    backgroundColor: '#f8f9fa',
  },
  tableCellText: {
    flex: 1,
    color: '#6c757d',
    textAlign: 'center',
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    paddingTop: 8,
  },
});

export default LoanCalculator;