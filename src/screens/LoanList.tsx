import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  StatusBar,
  ActivityIndicator,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoanListProps } from '../navigation/types';
import { Client } from '../navigation/types';

interface LoanWithClient extends Client {
  loanStatus: 'Active' | 'Overdue' | 'Completed';
  daysRemaining?: number;
  isOverdue: boolean;
}

const LoanList = ({ navigation }: LoanListProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<LoanWithClient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Active' | 'Overdue' | 'Completed'>('All');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadClients();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    filterLoans();
  }, [clients, searchQuery, selectedFilter]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const storedClients = await AsyncStorage.getItem('clients');
      if (storedClients) {
        const parsedClients = JSON.parse(storedClients);
        // Only include clients with loan amounts
        const clientsWithLoans = parsedClients.filter((client: Client) => 
          client.loanAmount && client.loanAmount > 0
        );
        setClients(clientsWithLoans);
      } else {
        setClients([]);
      }
    } catch (error) {
      console.error('Failed to load clients', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLoanStatus = (client: Client): LoanWithClient => {
    const now = new Date();
    let loanStatus: 'Active' | 'Overdue' | 'Completed' = 'Active';
    let daysRemaining: number | undefined;
    let isOverdue = false;

    if (client.endDate) {
      const endDate = new Date(client.endDate);
      const timeDiff = endDate.getTime() - now.getTime();
      daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (daysRemaining < 0) {
        loanStatus = 'Overdue';
        isOverdue = true;
      } else if (daysRemaining === 0) {
        loanStatus = 'Completed';
      }
    }

    return {
      ...client,
      loanStatus,
      daysRemaining,
      isOverdue
    };
  };

  const filterLoans = () => {
    let loansWithStatus = clients.map(calculateLoanStatus);

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      loansWithStatus = loansWithStatus.filter(loan => 
        loan.name.toLowerCase().includes(query) ||
        (loan.phone && loan.phone.includes(query))
      );
    }

    // Apply status filter
    if (selectedFilter !== 'All') {
      loansWithStatus = loansWithStatus.filter(loan => loan.loanStatus === selectedFilter);
    }

    setFilteredLoans(loansWithStatus);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const getTotalLoanAmount = () => {
    return filteredLoans.reduce((total, loan) => total + (loan.loanAmount || 0), 0);
  };

  const getStatusCounts = () => {
    const allLoans = clients.map(calculateLoanStatus);
    return {
      active: allLoans.filter(loan => loan.loanStatus === 'Active').length,
      overdue: allLoans.filter(loan => loan.loanStatus === 'Overdue').length,
      completed: allLoans.filter(loan => loan.loanStatus === 'Completed').length,
      total: allLoans.length
    };
  };

  const renderFilterButton = (filter: typeof selectedFilter, label: string, count?: number) => (
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
        {label} {count !== undefined && `(${count})`}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: LoanWithClient }) => {
    // Map local status to Loan type status
    let mappedStatus: "Active" | "Paid";
    if (item.loanStatus === "Active" || item.loanStatus === "Overdue") {
      mappedStatus = "Active";
    } else {
      mappedStatus = "Paid";
    }

    const loan = {
      id: item.id,
      clientName: item.name,
      amount: item.loanAmount || 0,
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      status: mappedStatus,
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('LoanDetails', { loan })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.clientName}>{item.name}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusBackgroundColor(item.loanStatus) }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(item.loanStatus) }
            ]}>
              {item.loanStatus}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Loan Amount</Text>
            <Text style={styles.amount}>PHP {item.loanAmount?.toLocaleString() || 0}</Text>
          </View>

          {item.phone && (
            <Text style={styles.phone}>📞 {item.phone}</Text>
          )}

          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <Text style={styles.dateValue}>
                {item.startDate ? formatDate(item.startDate) : 'Not set'}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>End Date</Text>
              <Text style={styles.dateValue}>
                {item.endDate ? formatDate(item.endDate) : 'Not set'}
              </Text>
            </View>
          </View>

          {item.daysRemaining !== undefined && (
            <View style={styles.daysContainer}>
              <Text style={[
                styles.daysText,
                item.isOverdue ? styles.overdueText : styles.activeText
              ]}>
                {item.isOverdue 
                  ? `${Math.abs(item.daysRemaining)} days overdue`
                  : item.daysRemaining === 0 
                    ? 'Due today'
                    : `${item.daysRemaining} days remaining`
                }
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" />
      ) : (
        <>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png' }} 
            style={styles.emptyIcon}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>
            {selectedFilter === 'All' ? 'No Loans Found' : `No ${selectedFilter} Loans`}
          </Text>
          <Text style={styles.emptyText}>
            {selectedFilter === 'All' 
              ? 'Create clients with loan amounts to see them here'
              : `There are no ${selectedFilter.toLowerCase()} loans at the moment`
            }
          </Text>
        </>
      )}
    </View>
  );

  const statusCounts = getStatusCounts();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Loan Management</Text>
        {filteredLoans.length > 0 && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalAmount}>PHP {getTotalLoanAmount().toLocaleString()}</Text>
          </View>
        )}
      </View>

      {clients.length > 0 && (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search loans by client name or phone..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          <View style={styles.filterContainer}>
            {renderFilterButton('All', 'All', statusCounts.total)}
            {renderFilterButton('Active', 'Active', statusCounts.active)}
            {renderFilterButton('Overdue', 'Overdue', statusCounts.overdue)}
            {renderFilterButton('Completed', 'Completed', statusCounts.completed)}
          </View>
        </>
      )}

      <FlatList
        data={filteredLoans}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyListComponent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
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
    marginBottom: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 20,
    color: '#1976d2',
    fontWeight: 'bold',
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cardContent: {
    padding: 16,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
  },
  amount: {
    fontSize: 20,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  phone: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 14,
    color: '#212529',
  },
  daysContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  daysText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeText: {
    color: '#28a745',
  },
  overdueText: {
    color: '#dc3545',
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

export default LoanList;