import { PAYSTACK_CONFIG } from "@/constants/config";

class PaystackService {
  private publicKey = PAYSTACK_CONFIG.PUBLIC_KEY;
  private baseURL = "https://api.paystack.co";

  async initializeTransaction(
    email: string,
    amount: number,
    reference: string,
    metadata?: any
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseURL}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.publicKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amount * 100, // Convert to kobo
          reference,
          currency: PAYSTACK_CONFIG.CURRENCY,
          metadata,
        }),
      });

      const data = await response.json();

      if (data.status) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Payment initialization failed",
      };
    }
  }

  async verifyTransaction(
    reference: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(
        `${this.baseURL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.publicKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.status) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Payment verification failed",
      };
    }
  }

  async createVirtualAccount(
    customerCode: string,
    preferredBank?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseURL}/dedicated_account`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.publicKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: customerCode,
          preferred_bank: preferredBank || "wema-bank",
        }),
      });

      const data = await response.json();

      if (data.status) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Virtual account creation failed",
      };
    }
  }

  generateReference(): string {
    return `cryptoramp_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 15)}`;
  }

  formatAmount(amount: number): string {
    return (amount / 100).toFixed(2);
  }
}

export const paystackService = new PaystackService();
