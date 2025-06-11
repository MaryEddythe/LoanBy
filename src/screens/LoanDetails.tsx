import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  StatusBar,
  Linking
} from 'react-native';
import { LoanDetailsProps } from '../navigation/types';

const LoanDetails = ({ route, navigation }: LoanDetailsProps) => {
  const { loan } = route.params;
  const [showAllPayments, setShowAllPayments] = useState(false);

  // Enhanced payment history data
  const paymentHistory = [
    { id: 'p1', amount: 500, date: '2023-06-15', method: 'Cash', status: 'Completed' },
    { id: 'p2', amount: 500, date: '2023-07-15', method: 'Bank Transfer', status: 'Completed' },
    { id: 'p3', amount: 300, date: '2023-08-10', method: 'Cash', status: 'Completed' },
    { id: 'p4', amount: 200, date: '2023-09-05', method: 'Mobile Payment', status: 'Pending' },
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateLoanMetrics = () => {
    const totalPaid = paymentHistory
      .filter(p => p.status === 'Completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const remainingBalance = loan.amount - totalPaid;
    const progressPercentage = (totalPaid / loan.amount) * 100;
    
    // Calculate days
    const now = new Date();
    const startDate = loan.startDate ? new Date(loan.startDate) : null;
    const endDate = loan.endDate ? new Date(loan.endDate) : null;
    
    let daysElapsed = 0;
    let totalDays = 0;
    let daysRemaining = 0;
    
    if (startDate && endDate) {
      totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    }

    return {
      totalPaid,
      remainingBalance,
      progressPercentage: Math.min(progressPercentage, 100),
      daysElapsed: Math.max(0, daysElapsed),
      totalDays,
      daysRemaining,
      isOverdue: daysRemaining < 0
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#28a745';
      case 'Overdue': return '#dc3545';
      case 'Completed': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case 'Active': return '#d4edda';
      case 'Overdue': return '#f8d7da';
      case 'Completed': return '#e2e3e5';
      default: return '#e2e3e5';
    }
  };

  const handleCall = async () => {
    // This would need client phone number from the loan data
    Alert.alert('Call Client', 'This feature would call the client directly');
  };

  const handleAddPayment = () => {
    Alert.alert('Add Payment', 'This would open a form to add a new payment');
  };

  const handleEditLoan = () => {
    Alert.alert('Edit Loan', 'This would navigate to edit loan screen');
  };

  const metrics = calculateLoanMetrics();
  const displayedPayments = showAllPayments ? paymentHistory : paymentHistory.slice(0, 3);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={styles.clientName}>{loan.clientName}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusBackgroundColor(loan.status) }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getStatusColor(loan.status) }
              ]}>
                {loan.status}
              </Text>
            </View>
          </View>
          
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Total Loan Amount</Text>
            <Text style={styles.totalAmount}>${loan.amount.toLocaleString()}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Payment Progress</Text>
              <Text style={styles.progressPercentage}>{metrics.progressPercentage.toFixed(1)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${metrics.progressPercentage}%` }
                ]} 
              />
            </View>
            <View style={styles.progressDetails}>
              <Text style={styles.progressText}>
                ${metrics.totalPaid.toLocaleString()} paid
              </Text>
              <Text style={styles.progressText}>
                ${metrics.remainingBalance.toLocaleString()} remaining
              </Text>
            </View>
          </View>
        </View>

        {/* Loan Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Loan Details</Text>
          
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Start Date</Text>
              <Text style={styles.detailValue}>{formatDate(loan.startDate)}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>End Date</Text>
              <Text style={[
                styles.detailValue,
                metrics.isOverdue && styles.overdueText
              ]}>
                {formatDate(loan.endDate)}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Days Elapsed</Text>
              <Text style={styles.detailValue}>{metrics.daysElapsed} days</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>
                {metrics.isOverdue ? 'Days Overdue' : 'Days Remaining'}
              </Text>
              <Text style={[
                styles.detailValue,
                metrics.isOverdue ? styles.overdueText : styles.activeText
              ]}>
                {Math.abs(metrics.daysRemaining)} days
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Summary</Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>${metrics.totalPaid.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Total Paid</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{paymentHistory.filter(p => p.status === 'Completed').length}</Text>
              <Text style={styles.summaryLabel}>Payments Made</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, styles.remainingAmount]}>
                ${metrics.remainingBalance.toLocaleString()}
              </Text>
              <Text style={styles.summaryLabel}>Remaining</Text>
            </View>
          </View>
        </View>

        {/* Payment History Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Payment History</Text>
            {paymentHistory.length > 3 && (
              <TouchableOpacity onPress={() => setShowAllPayments(!showAllPayments)}>
                <Text style={styles.toggleText}>
                  {showAllPayments ? 'Show Less' : 'Show All'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {displayedPayments.length > 0 ? (
            displayedPayments.map((payment, index) => (
              <View key={payment.id} style={[
                styles.paymentItem,
                index === displayedPayments.length - 1 && styles.lastPaymentItem
              ]}>
                <View style={styles.paymentLeft}>
                  <View style={[
                    styles.paymentStatusDot,
                    { backgroundColor: payment.status === 'Completed' ? '#28a745' : '#ffc107' }
                  ]} />
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentAmount}>${payment.amount.toLocaleString()}</Text>
                    <Text style={styles.paymentMethod}>{payment.method}</Text>
                  </View>
                </View>
                
                <View style={styles.paymentRight}>
                  <Text style={styles.paymentDate}>{formatDate(payment.date)}</Text>
                  <Text style={[
                    styles.paymentStatus,
                    { color: payment.status === 'Completed' ? '#28a745' : '#ffc107' }
                  ]}>
                    {payment.status}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noPayments}>No payments recorded yet</Text>
          )}
        </View>

        {/* Next Payment Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Next Payment</Text>
          <View style={styles.nextPaymentContainer}>
            <Text style={styles.nextPaymentDate}>August 15, 2023</Text>
            <Text style={styles.nextPaymentNote}>
              Suggested payment: ${Math.min(500, metrics.remainingBalance).toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleCall}>
          <Text style={styles.secondaryButtonText}>📞 Call Client</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleAddPayment}>
          <Text style={styles.primaryButtonText}>+ Add Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  headerCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 14,
    color: '#6c757d',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  toggleText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  overdueText: {
    color: '#dc3545',
  },
  activeText: {
    color: '#28a745',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  remainingAmount: {
    color: '#dc3545',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  lastPaymentItem: {
    borderBottomWidth: 0,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  paymentMethod: {
    fontSize: 14,
    color: '#6c757d',
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentDate: {
    fontSize: 14,
    color: '#495057',
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  noPayments: {
    textAlign: 'center',
    color: '#6c757d',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  nextPaymentContainer: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  nextPaymentDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  nextPaymentNote: {
    fontSize: 14,
    color: '#856404',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoanDetails;