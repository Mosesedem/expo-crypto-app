import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { WalletBalance, Transaction } from '../types';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

interface WalletState {
  balances: WalletBalance[];
  transactions: Transaction[];
  isLoading: boolean;
  isRefreshing: boolean;
}

interface WalletContextType extends WalletState {
  refreshBalances: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  getDepositAddress: (symbol: string) => Promise<string | null>;
  exportMnemonic: () => Promise<string | null>;
}

type WalletAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_BALANCES'; payload: WalletBalance[] }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction };

const initialState: WalletState = {
  balances: [],
  transactions: [],
  isLoading: false,
  isRefreshing: false,
};

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.payload };
    case 'SET_BALANCES':
      return { ...state, balances: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(tx =>
          tx.id === action.payload.id ? action.payload : tx
        ),
      };
    default:
      return state;
  }
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(walletReducer, initialState);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await Promise.all([
      refreshBalances(),
      refreshTransactions(),
    ]);
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const refreshBalances = async () => {
    try {
      const response = await apiService.getWalletBalances();
      if (response.success && response.data) {
        dispatch({ type: 'SET_BALANCES', payload: response.data });
      }
    } catch (error) {
      console.error('Failed to refresh balances:', error);
    }
  };

  const refreshTransactions = async () => {
    try {
      const response = await apiService.getTransactions();
      if (response.success && response.data) {
        dispatch({ type: 'SET_TRANSACTIONS', payload: response.data });
      }
    } catch (error) {
      console.error('Failed to refresh transactions:', error);
    }
  };

  const getDepositAddress = async (symbol: string): Promise<string | null> => {
    try {
      const response = await apiService.getDepositAddress(symbol);
      return response.success && response.data ? response.data.address : null;
    } catch (error) {
      console.error('Failed to get deposit address:', error);
      return null;
    }
  };

  const exportMnemonic = async (): Promise<string | null> => {
    try {
      const response = await apiService.exportMnemonic();
      return response.success && response.data ? response.data.mnemonic : null;
    } catch (error) {
      console.error('Failed to export mnemonic:', error);
      return null;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        ...state,
        refreshBalances,
        refreshTransactions,
        getDepositAddress,
        exportMnemonic,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}