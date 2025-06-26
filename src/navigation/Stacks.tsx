import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  ClientsStackParamList, 
  LoansStackParamList,
  ToolsStackParamList 
} from './types';

// Clients Screens
import ClientList from '../screens/ClientList';
import AddEditClient from '../screens/AddEditClient';

// Loans Screens
import LoanList from '../screens/LoanList';
import CreateLoan from '../screens/CreateLoan';
import LoanDetails from '../screens/LoanDetails';
import AddPayment from '../screens/AddPayment';

// Tools Screens
import LoanCalculator from '../screens/LoanCalculator';
import SummaryView from '../screens/SummaryView';

export const ClientsStack = createNativeStackNavigator<ClientsStackParamList>();
export const LoansStack = createNativeStackNavigator<LoansStackParamList>();
export const ToolsStack = createNativeStackNavigator<ToolsStackParamList>();

export const ClientsStackScreen = () => (
  <ClientsStack.Navigator>
    <ClientsStack.Screen name="ClientList" component={ClientList} options={{ title: 'Client List' }} />
    <ClientsStack.Screen name="AddEditClient" component={AddEditClient} options={{ title: 'Add/Edit Client' }} />
  </ClientsStack.Navigator>
);

export const LoansStackScreen = () => (
  <LoansStack.Navigator>
    <LoansStack.Screen name="LoanList" component={LoanList} options={{ title: 'Loan List' }} />
    <LoansStack.Screen name="CreateLoan" component={CreateLoan} options={{ title: 'Create Loan' }} />
    <LoansStack.Screen name="LoanDetails" component={LoanDetails} options={{ title: 'Loan Details' }} />
    <LoansStack.Screen name="AddPayment" component={AddPayment} options={{ title: 'Add Payment' }} />
  </LoansStack.Navigator>
);

export const ToolsStackScreen = () => (
  <ToolsStack.Navigator>
    <ToolsStack.Screen name="LoanCalculator" component={LoanCalculator} options={{ title: 'Loan Calculator' }} />
    <ToolsStack.Screen name="SummaryView" component={SummaryView} options={{ title: 'Summary View' }} />
  </ToolsStack.Navigator>
);