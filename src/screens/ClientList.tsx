import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Linking, 
  Alert,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClientListProps } from '../navigation/types';
import { Client } from '../navigation/types';

const ClientList = ({ navigation }: ClientListProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadClients();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(query) || 
        (client.phone && client.phone.includes(query)) ||
        (client.address && client.address.toLowerCase().includes(query))
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const storedClients = await AsyncStorage.getItem('clients');
      if (storedClients) {
        const parsedClients = JSON.parse(storedClients);
        setClients(parsedClients);
        setFilteredClients(parsedClients);
      } else {
        setClients([]);
        setFilteredClients([]);
      }
    } catch (error) {
      console.error('Failed to load clients', error);
      Alert.alert('Error', 'Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenURL = async (url: string) => {
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(`Cannot open this URL: ${url}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open the URL');
    }
  };

  const handleCall = async (phone: string) => {
    const phoneUrl = `tel:${phone}`;
    try {
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Phone calls are not supported on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to make the call');
    }
  };

  const renderItem = ({ item }: { item: Client }) => {
    // Calculate loan status
    const now = new Date();
    const endDate = item.endDate ? new Date(item.endDate) : null;
    const isOverdue = endDate && now > endDate;
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AddEditClient', { client: item })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.name}</Text>
          {isOverdue && <View style={styles.overdueBadge}><Text style={styles.overdueBadgeText}>OVERDUE</Text></View>}
        </View>
        
        <View style={styles.cardContent}>
          {item.employment && (
            <Text style={styles.employment}>{item.employment}</Text>
          )}
          
          <View style={styles.infoRow}>
            {item.phone && (
              <TouchableOpacity 
                style={styles.phoneContainer} 
                onPress={() => handleCall(item.phone)}
              >
                <Text style={styles.phone}>{item.phone}</Text>
                <Text style={styles.callText}>Call</Text>
              </TouchableOpacity>
            )}
            
            {item.facebookLink && (
              <TouchableOpacity 
                style={styles.facebookButton}
                onPress={() => item.facebookLink && handleOpenURL(item.facebookLink)}
              >
                <Text style={styles.facebookButtonText}>Facebook Profile</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {item.address && (
            <Text style={styles.address}>{item.address}</Text>
          )}
          
          {item.loanAmount && (
            <View style={styles.loanContainer}>
              <Text style={styles.loanLabel}>Loan Amount:</Text>
              <Text style={styles.loanAmount}>PHP {item.loanAmount.toLocaleString()}</Text>
            </View>
          )}
          
          {(item.startDate || item.endDate) && (
            <View style={styles.dateContainer}>
              {item.startDate && (
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>Start:</Text>
                  <Text style={styles.dateValue}>
                    {new Date(item.startDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              )}
              
              {item.endDate && (
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>End:</Text>
                  <Text style={[
                    styles.dateValue, 
                    isOverdue ? styles.overdueDate : null
                  ]}>
                    {new Date(item.endDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              )}
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
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1170/1170577.png' }} 
            style={styles.emptyIcon}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>No Clients Yet</Text>
          <Text style={styles.emptyText}>
            Add your first client by tapping the + button below
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('AddEditClient')}
          >
            <Text style={styles.emptyButtonText}>Add Your First Client</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clients</Text>
        {clients.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{clients.length}</Text>
          </View>
        )}
      </View>
      
      {clients.length > 0 && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      )}
      
      <FlatList
        data={filteredClients}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyListComponent}
        showsVerticalScrollIndicator={false}
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditClient')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  countBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 10,
  },
  countText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
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
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
  },
  employment: {
    fontSize: 16,
    color: '#495057',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phone: {
    fontSize: 16,
    color: '#3b82f6',
    marginRight: 8,
  },
  callText: {
    fontSize: 14,
    color: '#fff',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  facebookButton: {
    backgroundColor: '#4267B2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  facebookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  address: {
    fontSize: 15,
    color: '#495057',
    marginBottom: 12,
    lineHeight: 20,
  },
  loanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  loanLabel: {
    fontSize: 15,
    color: '#495057',
    fontWeight: '500',
    marginRight: 8,
  },
  loanAmount: {
    fontSize: 16,
    color: '#212529',
    fontWeight: 'bold',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
  },
  overdueDate: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  overdueBadge: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  overdueBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    lineHeight: 56,
  },
});

export default ClientList;