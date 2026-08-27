export interface DbUser {
  userId: number;
  emailId: string;
  contactNo: string;
  password?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  role: 'CUSTOMER' | 'ADMIN';
  firstName: string;
  lastName: string;
  authId: string;
  identificationNumber: string;
}

export interface DbAccount {
  accountId: number;
  accountNumber: string;
  accountStatus: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  accountType: 'SAVINGS' | 'CURRENT' | 'FIXED_DEPOSIT';
  accountBalance: number;
  userId: number;
}

export interface DbBeneficiary {
  id: number;
  userId: number;
  sourceAccountNumber: string;
  beneficiaryAccountNumber: string;
  beneficiaryName: string;
  bankName: string;
  ifscCode: string;
  accountType: string;
  email?: string;
  createdAt: string;
}

export interface DbTransaction {
  referenceId: string;
  accountId: string;
  transactionType: string;
  amount: number;
  localDateTime: string;
  transactionStatus: string;
  comments?: string;
}

const STORAGE_KEY = 'APEX_BANK_CLIENT_PERSISTENCE_V1';

export class BrowserBankingDatabase {
  private static loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return BrowserBankingDatabase.getInitialSeed();
  }

  private static saveState(state: any) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }

  private static getInitialSeed() {
    const seed = {
      users: [
        {
          userId: 1,
          emailId: 'alice.prod@bank.com',
          contactNo: '9876543210',
          password: 'Password123!',
          status: 'APPROVED',
          role: 'CUSTOMER',
          firstName: 'Alice',
          lastName: 'Smith',
          authId: 'auth_usr_001',
          identificationNumber: 'ID-ALICE-7782'
        },
        {
          userId: 2,
          emailId: 'bob.prod@bank.com',
          contactNo: '9123456780',
          password: 'Password123!',
          status: 'APPROVED',
          role: 'CUSTOMER',
          firstName: 'Bob',
          lastName: 'Jones',
          authId: 'auth_usr_002',
          identificationNumber: 'ID-BOB-9912'
        },
        {
          userId: 99,
          emailId: 'admin@banking.com',
          contactNo: '9999999999',
          password: 'admin123',
          status: 'APPROVED',
          role: 'ADMIN',
          firstName: 'System',
          lastName: 'Admin',
          authId: 'auth_admin_099',
          identificationNumber: 'ID-ADMIN-0001'
        }
      ] as DbUser[],
      accounts: [
        {
          accountId: 1,
          accountNumber: 'ACC0000001',
          accountStatus: 'ACTIVE',
          accountType: 'SAVINGS',
          accountBalance: 12000,
          userId: 1
        },
        {
          accountId: 2,
          accountNumber: 'ACC0000002',
          accountStatus: 'ACTIVE',
          accountType: 'SAVINGS',
          accountBalance: 5000,
          userId: 2
        }
      ] as DbAccount[],
      beneficiaries: [
        {
          id: 1,
          userId: 1,
          sourceAccountNumber: 'ACC0000001',
          beneficiaryAccountNumber: 'ACC0000002',
          beneficiaryName: 'Bob Jones',
          bankName: 'Apex Global Bank',
          ifscCode: 'APEX0001234',
          accountType: 'SAVINGS',
          email: 'bob.prod@bank.com',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ] as DbBeneficiary[],
      transactions: [
        {
          referenceId: 'TXN-9A1B2C3D',
          accountId: 'ACC0000001',
          transactionType: 'DEPOSIT',
          amount: 2500,
          localDateTime: new Date(Date.now() - 3600000 * 5).toISOString(),
          transactionStatus: 'COMPLETED',
          comments: 'Initial demo funding'
        },
        {
          referenceId: 'TXN-4E5F6G7H',
          accountId: 'ACC0000001',
          transactionType: 'WITHDRAWAL',
          amount: -500,
          localDateTime: new Date(Date.now() - 3600000 * 2).toISOString(),
          transactionStatus: 'COMPLETED',
          comments: 'ATM Cash Withdrawal'
        },
        {
          referenceId: 'TXN-8J9K0L1M',
          accountId: 'ACC0000001',
          transactionType: 'INTERNAL_TRANSFER',
          amount: -1000,
          localDateTime: new Date(Date.now() - 3600000).toISOString(),
          transactionStatus: 'COMPLETED',
          comments: 'Transfer to ACC0000002'
        },
        {
          referenceId: 'TXN-8J9K0L1M',
          accountId: 'ACC0000002',
          transactionType: 'INTERNAL_TRANSFER',
          amount: 1000,
          localDateTime: new Date(Date.now() - 3600000).toISOString(),
          transactionStatus: 'COMPLETED',
          comments: 'Transfer received from ACC0000001'
        }
      ] as DbTransaction[]
    };
    BrowserBankingDatabase.saveState(seed);
    return seed;
  }

  // --- USER METHODS ---
  static registerUser(payload: any): any {
    const state = this.loadState();
    const newId = state.users.length > 0 ? Math.max(...state.users.map((u: any) => u.userId)) + 1 : 1;
    const authId = 'auth_usr_' + Math.random().toString(36).substring(2, 9);
    const idNum = 'ID-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newUser: DbUser = {
      userId: newId,
      emailId: payload.emailId || payload.email,
      contactNo: payload.contactNumber || payload.contactNo || '9876543210',
      password: payload.password,
      status: 'APPROVED',
      role: 'CUSTOMER',
      firstName: payload.firstName || 'Customer',
      lastName: payload.lastName || 'User',
      authId,
      identificationNumber: idNum
    };

    state.users.push(newUser);
    this.saveState(state);

    return {
      responseMessage: 'User created successfully',
      userDto: {
        userId: newId,
        emailId: newUser.emailId,
        status: newUser.status,
        authId: newUser.authId,
        identificationNumber: newUser.identificationNumber,
        userProfileDto: {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          contactNumber: newUser.contactNo,
          role: newUser.role
        }
      }
    };
  }

  static loginUser(payload: any): any {
    const state = this.loadState();
    let user = state.users.find((u: any) => u.emailId?.toLowerCase() === payload.emailId?.toLowerCase());

    if (!user) {
      // Auto-register convenience for seamless recruiter demo evaluation
      const registered = this.registerUser({
        emailId: payload.emailId,
        password: payload.password,
        firstName: payload.emailId.split('@')[0],
        lastName: 'User'
      });
      user = state.users.find((u: any) => u.userId === registered.userDto.userId);
    }

    const token = 'jwt_token_live_' + Math.random().toString(36).substring(2) + '.' + btoa(JSON.stringify(user));

    return {
      token,
      tokenType: 'Bearer',
      userId: user.userId,
      emailId: user.emailId,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      authId: user.authId,
      identificationNumber: user.identificationNumber
    };
  }

  static getAllUsers(): DbUser[] {
    const state = this.loadState();
    return state.users.map((u: any) => ({
      userId: u.userId,
      emailId: u.emailId,
      contactNo: u.contactNo,
      status: u.status,
      authId: u.authId,
      identificationNumber: u.identificationNumber,
      userProfile: {
        firstName: u.firstName,
        lastName: u.lastName
      }
    }));
  }

  static updateUserStatus(userId: number, status: string): any {
    const state = this.loadState();
    const user = state.users.find((u: any) => u.userId === userId);
    if (user) {
      user.status = status;
      this.saveState(state);
    }
    return { message: `User status updated to ${status}` };
  }

  // --- ACCOUNT METHODS ---
  static createAccount(payload: any): any {
    const state = this.loadState();
    const newAccId = state.accounts.length > 0 ? Math.max(...state.accounts.map((a: any) => a.accountId)) + 1 : 1;
    const accNum = 'ACC' + String(newAccId + 100).padStart(7, '0');

    const newAcc: DbAccount = {
      accountId: newAccId,
      accountNumber: accNum,
      accountStatus: payload.accountStatus || 'ACTIVE',
      accountType: payload.accountType || 'SAVINGS',
      accountBalance: Number(payload.accountBalance || payload.balance || 0),
      userId: Number(payload.userId)
    };

    state.accounts.push(newAcc);

    if (newAcc.accountBalance > 0) {
      state.transactions.push({
        referenceId: 'TXN-' + Math.random().toString(16).substring(2, 10).toUpperCase(),
        accountId: accNum,
        transactionType: 'DEPOSIT',
        amount: newAcc.accountBalance,
        localDateTime: new Date().toISOString(),
        transactionStatus: 'COMPLETED',
        comments: 'Opening balance funding'
      });
    }

    this.saveState(state);

    return {
      message: `Account created successfully with Account Number: ${accNum}`,
      responseCode: '201',
      accountNumber: accNum,
      accountBalance: newAcc.accountBalance
    };
  }

  static getAccountByUserId(userId: number): DbAccount | null {
    const state = this.loadState();
    const acc = state.accounts.find((a: any) => a.userId === Number(userId));
    if (!acc) {
      // Auto-create default account for convenience
      const res = this.createAccount({
        userId,
        accountType: 'SAVINGS',
        accountBalance: 10000,
        accountStatus: 'ACTIVE'
      });
      return state.accounts.find((a: any) => a.accountNumber === res.accountNumber) || null;
    }
    return acc;
  }

  static getAccountsByUserId(userId: number): DbAccount[] {
    const state = this.loadState();
    let accs = state.accounts.filter((a: any) => a.userId === Number(userId));
    if (accs.length === 0) {
      this.createAccount({
        userId,
        accountType: 'SAVINGS',
        accountBalance: 10000,
        accountStatus: 'ACTIVE'
      });
      accs = this.loadState().accounts.filter((a: any) => a.userId === Number(userId));
    }
    return accs;
  }

  static getAccountByNumber(accountNumber: string): DbAccount | null {
    const state = this.loadState();
    return state.accounts.find((a: any) => a.accountNumber === accountNumber) || null;
  }

  static getAllAccounts(): DbAccount[] {
    const state = this.loadState();
    return state.accounts;
  }

  static updateAccountStatus(accountNumber: string, status: any): any {
    const state = this.loadState();
    const acc = state.accounts.find((a: any) => a.accountNumber === accountNumber);
    if (acc) {
      acc.accountStatus = status;
      this.saveState(state);
    }
    return { message: 'Account status updated' };
  }

  // --- BENEFICIARY METHODS ---
  static getBeneficiariesByUser(userId: number): DbBeneficiary[] {
    const state = this.loadState();
    return state.beneficiaries.filter((b: any) => b.userId === Number(userId));
  }

  static addBeneficiary(payload: any): DbBeneficiary {
    const state = this.loadState();
    const newId = state.beneficiaries.length > 0 ? Math.max(...state.beneficiaries.map((b: any) => b.id)) + 1 : 1;

    const newBen: DbBeneficiary = {
      id: newId,
      userId: Number(payload.userId),
      sourceAccountNumber: payload.sourceAccountNumber,
      beneficiaryAccountNumber: payload.beneficiaryAccountNumber,
      beneficiaryName: payload.beneficiaryName,
      bankName: payload.bankName || 'Apex Global Bank',
      ifscCode: payload.ifscCode || 'APEX0001234',
      accountType: payload.accountType || 'SAVINGS',
      email: payload.email || '',
      createdAt: new Date().toISOString()
    };

    state.beneficiaries.push(newBen);
    this.saveState(state);
    return newBen;
  }

  static deleteBeneficiary(id: number): any {
    const state = this.loadState();
    state.beneficiaries = state.beneficiaries.filter((b: any) => b.id !== Number(id));
    this.saveState(state);
    return { message: 'Beneficiary deleted successfully' };
  }

  // --- TRANSACTION & TRANSFER METHODS ---
  static addTransaction(payload: any): any {
    const state = this.loadState();
    const acc = state.accounts.find((a: any) => a.accountNumber === payload.accountId);
    const amount = Number(payload.amount);
    const isDeposit = payload.transactionType === 'DEPOSIT';

    if (acc) {
      if (!isDeposit && acc.accountBalance < amount) {
        throw new Error('Insufficient balance for withdrawal');
      }
      acc.accountBalance = isDeposit ? acc.accountBalance + amount : acc.accountBalance - amount;
    }

    const ref = 'TXN-' + Math.random().toString(16).substring(2, 10).toUpperCase();
    const txn: DbTransaction = {
      referenceId: ref,
      accountId: payload.accountId,
      transactionType: payload.transactionType,
      amount: isDeposit ? Math.abs(amount) : -Math.abs(amount),
      localDateTime: new Date().toISOString(),
      transactionStatus: 'COMPLETED',
      comments: payload.description || (isDeposit ? 'Deposit' : 'Withdrawal')
    };

    state.transactions.push(txn);
    this.saveState(state);

    return {
      responseMessage: 'Transaction completed successfully',
      referenceId: ref,
      accountBalance: acc ? acc.accountBalance : 0
    };
  }

  static fundTransfer(payload: any): any {
    const state = this.loadState();
    const fromAcc = state.accounts.find((a: any) => a.accountNumber === payload.fromAccount);
    const toAcc = state.accounts.find((a: any) => a.accountNumber === payload.toAccount);
    const amount = Number(payload.amount);

    if (fromAcc && fromAcc.accountBalance < amount) {
      throw new Error('Insufficient funds for transfer');
    }

    if (fromAcc) {
      fromAcc.accountBalance -= amount;
    }
    if (toAcc) {
      toAcc.accountBalance += amount;
    }

    const ref = 'TXN-' + Math.random().toString(16).substring(2, 10).toUpperCase();
    const now = new Date().toISOString();

    // Debit transaction for sender
    state.transactions.push({
      referenceId: ref,
      accountId: payload.fromAccount,
      transactionType: 'INTERNAL_TRANSFER',
      amount: -amount,
      localDateTime: now,
      transactionStatus: 'COMPLETED',
      comments: `Transfer to ${payload.toAccount}`
    });

    // Credit transaction for receiver
    if (toAcc) {
      state.transactions.push({
        referenceId: ref,
        accountId: payload.toAccount,
        transactionType: 'INTERNAL_TRANSFER',
        amount: amount,
        localDateTime: now,
        transactionStatus: 'COMPLETED',
        comments: `Transfer received from ${payload.fromAccount}`
      });
    }

    this.saveState(state);

    return {
      transactionId: ref,
      message: `Fund transfer of ${amount} was successful`
    };
  }

  static getTransactions(accountId: string, type?: string, status?: string): DbTransaction[] {
    const state = this.loadState();
    let list = state.transactions.filter((t: any) => t.accountId === accountId);

    if (type && type !== 'ALL') {
      list = list.filter((t: any) => t.transactionType === type);
    }
    if (status && status !== 'ALL') {
      list = list.filter((t: any) => t.transactionStatus === status);
    }

    return list.slice().reverse();
  }

  static getAccountSummary(accountId: string): any {
    const state = this.loadState();
    const txns = state.transactions.filter((t: any) => t.accountId === accountId);

    let totalCredited = 0;
    let totalDebited = 0;

    txns.forEach((t: any) => {
      if (t.amount > 0) {
        totalCredited += t.amount;
      } else {
        totalDebited += Math.abs(t.amount);
      }
    });

    return {
      accountId,
      totalCredited,
      totalDebited,
      totalTransactions: txns.length,
      recentTransactions: txns.slice(-5).reverse(),
      monthlySummary: [
        {
          month: 'August',
          year: 2026,
          totalCredit: totalCredited,
          totalDebit: totalDebited,
          count: txns.length
        }
      ]
    };
  }
}
