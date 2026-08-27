export interface Account {
  accountId?: number;
  accountNumber: string;
  accountStatus: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  accountType: 'SAVINGS' | 'CURRENT' | 'FIXED_DEPOSIT';
  accountBalance: number;
  userId: number;
}

export interface CreateAccountRequest {
  userId: number;
  accountType: 'SAVINGS' | 'CURRENT' | 'FIXED_DEPOSIT';
  accountBalance?: number;
  accountStatus?: 'PENDING' | 'ACTIVE';
}

export interface AccountStatusUpdate {
  accountStatus: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'CLOSED';
}