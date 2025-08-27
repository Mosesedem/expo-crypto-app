export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3000/api' 
    : 'https://your-backend-api.com/api',
  TIMEOUT: 30000,
};

export const PAYSTACK_CONFIG = {
  PUBLIC_KEY: __DEV__ 
    ? 'pk_test_your_test_key' 
    : 'pk_live_your_live_key',
  CURRENCY: 'NGN',
};

export const SUPPORTED_TOKENS: Array<{
  symbol: string;
  name: string;
  network: string;
  icon: string;
  decimals: number;
}> = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'Bitcoin',
    icon: '₿',
    decimals: 8,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    network: 'Ethereum',
    icon: 'Ξ',
    decimals: 18,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    network: 'Ethereum',
    icon: '₮',
    decimals: 6,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    network: 'Ethereum',
    icon: '$',
    decimals: 6,
  },
];

export const TRANSACTION_LIMITS = {
  DAILY_BUY_LIMIT: 500000, // NGN
  DAILY_SELL_LIMIT: 500000, // NGN
  MIN_BUY_AMOUNT: 1000, // NGN
  MIN_SELL_AMOUNT: 1000, // NGN
};

export const COLORS = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#10B981',
  secondaryDark: '#059669',
  background: '#FFFFFF',
  backgroundDark: '#1F2937',
  surface: '#F9FAFB',
  surfaceDark: '#374151',
  text: '#111827',
  textDark: '#F9FAFB',
  textSecondary: '#6B7280',
  textSecondaryDark: '#9CA3AF',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  border: '#E5E7EB',
  borderDark: '#4B5563',
};