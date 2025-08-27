import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { User } from "../types";
import { apiService } from "./api";

class AuthService {
  private readonly TOKEN_KEY = "auth_token";
  private readonly USER_KEY = "user_data";

  // async initializeGoogleSignIn() {
  //   GoogleSignin.configure({
  //     webClientId:
  //       "60680372223-36rbkpi0sba6qe6r0mro01p2uhul6r4h.apps.googleusercontent.com",
  //     iosClientId:
  //       "60680372223-s4o5g7s86h68s84d49n6li2fp7i6h577.apps.googleusercontent.com",
  //   });
  // }

  async initializeGoogleSignIn() {
    try {
      GoogleSignin.configure({
        webClientId:
          "60680372223-36rbkpi0sba6qe6r0mro01p2uhul6r4h.apps.googleusercontent.com",
        iosClientId:
          "60680372223-s4o5g7s86h68s84d49n6li2fp7i6h577.apps.googleusercontent.com",
      });
    } catch (error) {
      console.warn("Google Sign-in not available in development mode");
    }
  }
  async storeAuthData(token: string, user: User) {
    await SecureStore.setItemAsync(this.TOKEN_KEY, token);
    await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));
  }

  async getStoredToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(this.TOKEN_KEY);
  }

  async getStoredUser(): Promise<User | null> {
    const userData = await SecureStore.getItemAsync(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  async clearAuthData() {
    await SecureStore.deleteItemAsync(this.TOKEN_KEY);
    await SecureStore.deleteItemAsync(this.USER_KEY);
  }

  async signInWithGoogle(): Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (!(userInfo as any).idToken) {
        return { success: false, error: "Failed to get Google ID token" };
      }

      const response = await apiService.signInWithGoogle(
        (userInfo as any).idToken
      );

      if (response.success && response.data) {
        await this.storeAuthData(response.data.token, response.data.user);
        return { success: true, user: response.data.user };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Google sign-in failed",
      };
    }
  }

  async signInAnonymous(
    username?: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await apiService.signInAnonymous(username);

      if (response.success && response.data) {
        await this.storeAuthData(response.data.token, response.data.user);
        return { success: true, user: response.data.user };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Anonymous sign-in failed",
      };
    }
  }

  async signInWithCredentials(
    username: string,
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await apiService.signInWithCredentials(
        username,
        password
      );

      if (response.success && response.data) {
        await this.storeAuthData(response.data.token, response.data.user);
        return { success: true, user: response.data.user };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign-in failed",
      };
    }
  }

  async signUp(
    username: string,
    password: string,
    email?: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await apiService.signUp(username, password, email);

      if (response.success && response.data) {
        await this.storeAuthData(response.data.token, response.data.user);
        return { success: true, user: response.data.user };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign-up failed",
      };
    }
  }

  async signOut() {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      // Google sign-out failed, but continue with local cleanup
    }
    await this.clearAuthData();
  }

  async isBiometricAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  }

  async authenticateWithBiometric(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access your wallet",
        fallbackLabel: "Use passcode",
      });
      return result.success;
    } catch (error) {
      return false;
    }
  }

  generateRandomUsername(): string {
    const adjectives = [
      "Swift",
      "Crypto",
      "Digital",
      "Secure",
      "Smart",
      "Quick",
    ];
    const nouns = [
      "Trader",
      "Investor",
      "User",
      "Holder",
      "Explorer",
      "Pioneer",
    ];
    const randomNum = Math.floor(Math.random() * 9999);

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adjective}${noun}${randomNum}`;
  }
}

export const authService = new AuthService();
