export interface Transaction {
  referenceId: string;
  accountId: string;
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'INTERNAL_TRANSFER' | 'EXTERNAL_TRANSFER' | string;
  amount: number;
  localDateTime?: string;
  transactionStatus: 'COMPLETED' | 'PENDING' | 'FAILED' | string;
  comments?: string;
}

export interface MonthlySummary {
  month: string;
  year: number;
  totalCredit: number;
  totalDebit: number;
  count: number;
}

export interface TransactionSummary {
  accountId: string;
  totalCredited: number;
  totalDebited: number;
  totalTransactions: number;
  recentTransactions: Transaction[];
  monthlySummary: MonthlySummary[];
}

export interface AddTransactionRequest {
  accountId: string;
  transactionType: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  description: string;
}