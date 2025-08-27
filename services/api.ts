import { API_CONFIG } from "@/constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ApiResponse,
  BankAccount,
  Transaction,
  User,
  WalletBalance,
} from "../types";

class ApiService {
  private baseURL = API_CONFIG.BASE_URL;
  private timeout = API_CONFIG.TIMEOUT;

  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem("auth_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Request failed",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Authentication
  async signInWithGoogle(
    idToken: string
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
  }

  async signInAnonymous(
    username?: string
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request("/auth/anonymous", {
      method: "POST",
      body: JSON.stringify({ username }),
    });
  }

  async signInWithCredentials(
    username: string,
    password: string
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  async signUp(
    username: string,
    password: string,
    email?: string
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, email }),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request("/auth/me");
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Wallet
  async getWalletBalances(): Promise<ApiResponse<WalletBalance[]>> {
    return this.request("/wallet/balances");
  }

  async getDepositAddress(
    symbol: string
  ): Promise<ApiResponse<{ address: string }>> {
    return this.request(`/wallet/deposit-address/${symbol}`);
  }

  async exportMnemonic(): Promise<ApiResponse<{ mnemonic: string }>> {
    return this.request("/wallet/export-mnemonic");
  }

  // Transactions
  async getTransactions(
    type?: "incoming" | "outgoing"
  ): Promise<ApiResponse<Transaction[]>> {
    const query = type ? `?type=${type}` : "";
    return this.request(`/transactions${query}`);
  }

  async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
    return this.request(`/transactions/${id}`);
  }

  // Buy/Sell
  async initiateBuy(
    symbol: string,
    amount: string,
    fiatAmount: string
  ): Promise<ApiResponse<{ transaction: Transaction; paystackData: any }>> {
    return this.request("/transactions/buy", {
      method: "POST",
      body: JSON.stringify({ symbol, amount, fiatAmount }),
    });
  }

  async initiateSell(
    symbol: string,
    amount: string,
    bankAccount: BankAccount
  ): Promise<
    ApiResponse<{ transaction: Transaction; depositAddress: string }>
  > {
    return this.request("/transactions/sell", {
      method: "POST",
      body: JSON.stringify({ symbol, amount, bankAccount }),
    });
  }

  async sendCrypto(
    symbol: string,
    amount: string,
    toAddress: string
  ): Promise<ApiResponse<Transaction>> {
    return this.request("/transactions/send", {
      method: "POST",
      body: JSON.stringify({ symbol, amount, toAddress }),
    });
  }

  // Bank accounts
  async getBankList(): Promise<ApiResponse<{ name: string; code: string }[]>> {
    return this.request("/banks");
  }

  async verifyBankAccount(
    accountNumber: string,
    bankCode: string
  ): Promise<ApiResponse<{ accountName: string }>> {
    return this.request("/banks/verify", {
      method: "POST",
      body: JSON.stringify({ accountNumber, bankCode }),
    });
  }
}

export const apiService = new ApiService();
