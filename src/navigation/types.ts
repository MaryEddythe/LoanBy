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
  AddPayment: { loanId: string; clientName: string; loanAmount: number };
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
  LoanList: undefined;
  LoanDetails: {
    loan: Loan;
    newPayment?: Payment;
  };
  CreateLoan: undefined;
  AddPayment: {
    loanId: string;
    clientName: string;
    loanAmount: number;
    startDate: string;
    endDate: string;
  };
  Payments: NavigatorScreenParams<PaymentsStackParamList>;
};

// Screen props types
export type ClientListProps = NativeStackScreenProps<ClientsStackParamList, 'ClientList'>;
export type AddEditClientProps = NativeStackScreenProps<ClientsStackParamList, 'AddEditClient'>;
export type LoanListProps = NativeStackScreenProps<LoansStackParamList, 'LoanList'>;
export type CreateLoanProps = NativeStackScreenProps<LoansStackParamList, 'CreateLoan'>;
export type LoanDetailsProps = NativeStackScreenProps<LoansStackParamList, 'LoanDetails'>;
export type PaymentLogsProps = NativeStackScreenProps<PaymentsStackParamList, 'PaymentLogs'>;
export type AddPaymentProps = NativeStackScreenProps<RootStackParamList, 'AddPayment'>;
export type LoanCalculatorProps = NativeStackScreenProps<ToolsStackParamList, 'LoanCalculator'>;
export type SummaryViewProps = NativeStackScreenProps<ToolsStackParamList, 'SummaryView'>;

// Data models
export interface Client {
  id: string;
  name: string;
  phone?: string;
  employment?: string;
  facebookLink?: string;
  address?: string;
  loanAmount?: number;
  startDate?: string;
  endDate?: string;
}

export interface Loan {
  id: string;
  clientName: string;
  clientPhone?: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Paid';
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  method: string;
  status: string;
  date: string;
  description: string;
  notes?: string;
}

export interface CalculatorResult {
  monthlyPayment: number;
  totalInterest: number;
}