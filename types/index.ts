export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  createdAt: string;
  isAnonymous: boolean;
}

export interface WalletBalance {
  symbol: string;
  name: string;
  balance: string;
  usdValue: string;
  address: string;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
  status: 'pending' | 'confirmed' | 'failed' | 'processing';
  amount: string;
  symbol: string;
  fiatAmount?: string;
  fiatCurrency?: string;
  txHash?: string;
  createdAt: string;
  updatedAt: string;
  fee?: string;
  fromAddress?: string;
  toAddress?: string;
}

export interface PaystackTransaction {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  accountNumber?: string;
  bankName?: string;
}

export interface CryptoToken {
  symbol: string;
  name: string;
  icon: string;
  network: string;
  contractAddress?: string;
  decimals: number;
  minAmount: string;
  maxAmount: string;
}

export interface BankAccount {
  accountNumber: string;
  bankName: string;
  accountName: string;
  bankCode: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}