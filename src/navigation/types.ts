import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Clients Stack
export type ClientsStackParamList = {
  ClientList: undefined;
  AddEditClient: { client?: Client } | undefined;
};

// Loans Stack
export type LoansStackParamList = {
  LoanList: undefined;
  CreateLoan: undefined;
  LoanDetails: { loan: Loan };
};

// Payments Stack
export type PaymentsStackParamList = {
  PaymentLogs: undefined;
  AddPayment: undefined;
};

// Tools Stack
export type ToolsStackParamList = {
  LoanCalculator: undefined;
  SummaryView: undefined;
};

// Combine all stack param lists
export type RootStackParamList = {
  ClientsStack: NavigatorScreenParams<ClientsStackParamList>;
  LoansStack: NavigatorScreenParams<LoansStackParamList>;
  PaymentsStack: NavigatorScreenParams<PaymentsStackParamList>;
  ToolsStack: NavigatorScreenParams<ToolsStackParamList>;
};

// Screen props types
export type ClientListProps = NativeStackScreenProps<ClientsStackParamList, 'ClientList'>;
export type AddEditClientProps = NativeStackScreenProps<ClientsStackParamList, 'AddEditClient'>;
export type LoanListProps = NativeStackScreenProps<LoansStackParamList, 'LoanList'>;
export type CreateLoanProps = NativeStackScreenProps<LoansStackParamList, 'CreateLoan'>;
export type LoanDetailsProps = NativeStackScreenProps<LoansStackParamList, 'LoanDetails'>;
export type PaymentLogsProps = NativeStackScreenProps<PaymentsStackParamList, 'PaymentLogs'>;
export type AddPaymentProps = NativeStackScreenProps<PaymentsStackParamList, 'AddPayment'>;
export type LoanCalculatorProps = NativeStackScreenProps<ToolsStackParamList, 'LoanCalculator'>;
export type SummaryViewProps = NativeStackScreenProps<ToolsStackParamList, 'SummaryView'>;

// Data models
export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Loan {
  id: string;
  clientName: string;
  amount: number;
  date: string;
  status: 'Active' | 'Paid';
}

// Add to your existing types.ts
export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  method: string;
}

export interface CalculatorResult {
  monthlyPayment: number;
  totalInterest: number;
}