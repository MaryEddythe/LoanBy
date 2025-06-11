import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  StatusBar,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { PaymentLogsProps } from '../navigation/types';

interface Payment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  method: string;
  status: 'Completed' | 'Pending' | 'Failed';
  description?: string;
}

interface GroupedPayment {
  date: string;
  payments: Payment[];
  totalAmount: number;
}

const PaymentLogs = ({ navigation }: PaymentLogsProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Cash' | 'Bank Transfer' | 'Mobile Money'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Completed' | 'Pending' | 'Failed'>('All');
  const [loading, setLoading] = useState(false);
  const [groupByDate, setGroupByDate] = useState(true);

  const loans = [
    { id: '1', clientName: 'John Doe' },
    { id: '2', clientName: 'Jane Smith' },
    { id: '3', clientName: 'Mike Johnson' },
    { id: '4', clientName: 'Sarah Wilson' },
  ];

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchQuery, selectedFilter, selectedStatus]);

  const loadPayments = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(payment => {
        const client = loans.find(loan => loan.id === payment.loanId);
        const clientName = client ? client.clientName.toLowerCase() : '';
        return clientName.includes(query) || 
               payment.method.toLowerCase().includes(query) ||
               payment.amount.toString().includes(query);
      });
    }

    // Apply method filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(payment => payment.method === selectedFilter);
    }

    // Apply status filter
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(payment => payment.status === selectedStatus);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredPayments(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Cash': return '💵';
      case 'Bank Transfer': return '🏦';
      case 'Mobile Money': return '📱';
      default: return '💳';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'Cash': return '#28a745';
      case 'Bank Transfer': return '#007bff';
      case 'Mobile Money': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#28a745';
      case 'Pending': return '#ffc107';
      case 'Failed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#d4edda';
      case 'Pending': return '#fff3cd';
      case 'Failed': return '#f8d7da';
      default: return '#e2e3e5';
    }
  };

  const groupPaymentsByDate = (payments: Payment[]): GroupedPayment[] => {
    const grouped = payments.reduce((acc, payment) => {
      const date = payment.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          payments: [],
          totalAmount: 0
        };
      }
      acc[date].payments.push(payment);
      acc[date].totalAmount += payment.amount;
      return acc;
    }, {} as Record<string, GroupedPayment>);

    return Object.values(grouped).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const calculateSummary = () => {
    const total = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const completed = filteredPayments.filter(p => p.status === 'Completed');
    const completedAmount = completed.reduce((sum, payment) => sum + payment.amount, 0);
    const pending = filteredPayments.filter(p => p.status === 'Pending').length;
    const failed = filteredPayments.filter(p => p.status === 'Failed').length;

    return {
      total,
      completedAmount,
      completedCount: completed.length,
      pendingCount: pending,
      failedCount: failed,
      totalCount: filteredPayments.length
    };
  };

  const renderFilterButton = (filter: typeof selectedFilter, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderStatusButton = (status: typeof selectedStatus, label: string) => (
    <TouchableOpacity
      style={[
        styles.statusButton,
        selectedStatus === status && styles.statusButtonActive
      ]}
      onPress={() => setSelectedStatus(status)}
    >
      <Text style={[
        styles.statusButtonText,
        selectedStatus === status && styles.statusButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderPaymentItem = ({ item }: { item: Payment }) => {
    const client = loans.find(loan => loan.id === item.loanId);
    const clientName = client ? client.clientName : 'Unknown Client';

    return (
      <TouchableOpacity 
        style={styles.paymentCard}
        onPress={() => Alert.alert('Payment Details', `Payment ID: ${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.paymentHeader}>
          <View style={styles.paymentLeft}>
            <Text style={styles.methodIcon}>{getMethodIcon(item.method)}</Text>
            <View style={styles.paymentInfo}>
              <Text style={styles.clientName}>{clientName}</Text>
              <Text style={styles.paymentDescription}>{item.description || 'Payment'}</Text>
            </View>
          </View>
          
          <View style={styles.paymentRight}>
            <Text style={styles.amount}>PHP {item.amount.toLocaleString()}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusBackgroundColor(item.status) }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getStatusColor(item.status) }
              ]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.paymentFooter}>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
          <View style={styles.methodContainer}>
            <View style={[
              styles.methodDot,
              { backgroundColor: getMethodColor(item.method) }
            ]} />
            <Text style={[
              styles.method,
              { color: getMethodColor(item.method) }
            ]}>
              {item.method}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroupedItem = ({ item }: { item: GroupedPayment }) => (
    <View style={styles.groupContainer}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupDate}>{formatDate(item.date)}</Text>
        <Text style={styles.groupTotal}>PHP {item.totalAmount.toLocaleString()}</Text>
      </View>
      {item.payments.map(payment => (
        <View key={payment.id} style={styles.groupedPaymentItem}>
          {renderPaymentItem({ item: payment })}
        </View>
      ))}
    </View>
  );

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" />
      ) : (
        <>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3004/3004458.png' }} 
            style={styles.emptyIcon}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>No Payments Found</Text>
          <Text style={styles.emptyText}>
            {searchQuery || selectedFilter !== 'All' || selectedStatus !== 'All'
              ? 'Try adjusting your search or filters'
              : 'Payment logs will appear here once transactions are recorded'
            }
          </Text>
        </>
      )}
    </View>
  );

  const summary = calculateSummary();
  const groupedPayments = groupByDate ? groupPaymentsByDate(filteredPayments) : [];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment Logs</Text>
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={() => setGroupByDate(!groupByDate)}
        >
          <Text style={styles.toggleButtonText}>
            {groupByDate ? 'List View' : 'Group View'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      {filteredPayments.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>PHP {summary.completedAmount.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.totalCount}</Text>
            <Text style={styles.summaryLabel}>Total Payments</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, styles.pendingValue]}>{summary.pendingCount}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>
      )}

      {/* Search */}
      {payments.length > 0 && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by client name, method, or amount..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      )}

      {/* Filters */}
      {payments.length > 0 && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Method:</Text>
            <View style={styles.filterButtons}>
              {renderFilterButton('All', 'All')}
              {renderFilterButton('Cash', 'Cash')}
              {renderFilterButton('Bank Transfer', 'Bank')}
              {renderFilterButton('Mobile Money', 'Mobile')}
            </View>
          </View>
          
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Status:</Text>
            <View style={styles.filterButtons}>
              {renderStatusButton('All', 'All')}
              {renderStatusButton('Completed', 'Completed')}
              {renderStatusButton('Pending', 'Pending')}
              {renderStatusButton('Failed', 'Failed')}
            </View>
          </View>
        </View>
      )}

      {/* Payment List */}
      {groupByDate ? (
        <FlatList<GroupedPayment>
          data={groupedPayments}
          renderItem={renderGroupedItem}
          keyExtractor={(_item, index) => `group-${index}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={EmptyListComponent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadPayments}
        />
      ) : (
        <FlatList<Payment>
          data={filteredPayments}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={EmptyListComponent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadPayments}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
  },
  toggleButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  pendingValue: {
    color: '#ffc107',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6c757d',
    textTransform: 'uppercase',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInput: {
    backgroundColor: '#f1f3f5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    width: 60,
  },
  filterButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  statusButtonActive: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  statusButtonText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    marginBottom: 8,
  },
  groupDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
  },
  groupTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  groupedPaymentItem: {
    marginBottom: 8,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: '#495057',
  },
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  method: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default PaymentLogs;