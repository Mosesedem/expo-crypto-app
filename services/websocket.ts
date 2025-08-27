import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";
import { API_CONFIG } from "../constants/config";

class WebSocketService {
  private socket: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        console.warn("No auth token found, skipping WebSocket connection");
        return;
      }

      this.socket = io(API_CONFIG.BASE_URL.replace("/api", ""), {
        auth: {
          token,
        },
        transports: ["websocket"],
      });

      this.socket.on("connect", () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
      });

      this.socket.on("disconnect", () => {
        console.log("WebSocket disconnected");
        this.handleReconnect();
      });

      this.socket.on("connect_error", (error: Error) => {
        console.error("WebSocket connection error:", error);
        this.handleReconnect();
      });
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(
          `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );
        this.connect();
      }, Math.pow(2, this.reconnectAttempts) * 1000); // Exponential backoff
    }
  }

  onTransactionUpdate(callback: (transaction: any) => void) {
    if (this.socket) {
      this.socket.on("transaction_update", callback);
    }
  }

  onBalanceUpdate(callback: (balance: any) => void) {
    if (this.socket) {
      this.socket.on("balance_update", callback);
    }
  }

  onPriceUpdate(callback: (prices: any) => void) {
    if (this.socket) {
      this.socket.on("price_update", callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    }
  }
}

export const websocketService = new WebSocketService();
