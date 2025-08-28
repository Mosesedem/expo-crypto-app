import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/auth';
import { apiService } from '../services/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signInAnonymous: (username?: string) => Promise<void>;
  signInWithCredentials: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string, email?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SIGN_OUT' };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await authService.getStoredToken();
      if (token) {
        const response = await apiService.getCurrentUser();
        if (response.success && response.data) {
          dispatch({ type: 'SET_USER', payload: response.data });
        } else {
          await authService.clearAuthData();
          dispatch({ type: 'SET_USER', payload: null });
        }
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    } catch (error) {
      dispatch({ type: 'SET_USER', payload: null });
    }
  };

  const signInWithGoogle = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await authService.signInWithGoogle();
      if (result.success && result.user) {
        dispatch({ type: 'SET_USER', payload: result.user });
      } else {
        // Show user-friendly error message
        const errorMessage = result.error || 'Google sign-in failed';
        if (errorMessage.includes('Expo Go')) {
          // Suggest alternative sign-in methods
          throw new Error('Google Sign-In is not available in Expo Go. Please use "Sign In Anonymously" instead.');
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const signInAnonymous = async (username?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await authService.signInAnonymous(username);
      if (result.success && result.user) {
        dispatch({ type: 'SET_USER', payload: result.user });
      } else {
        throw new Error(result.error || 'Anonymous sign-in failed');
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const signInWithCredentials = async (username: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await authService.signInWithCredentials(username, password);
      if (result.success && result.user) {
        dispatch({ type: 'SET_USER', payload: result.user });
      } else {
        throw new Error(result.error || 'Sign-in failed');
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const signUp = async (username: string, password: string, email?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await authService.signUp(username, password, email);
      if (result.success && result.user) {
        dispatch({ type: 'SET_USER', payload: result.user });
      } else {
        throw new Error(result.error || 'Sign-up failed');
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const signOut = async () => {
    await authService.signOut();
    dispatch({ type: 'SIGN_OUT' });
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await apiService.updateProfile(userData);
      if (response.success && response.data) {
        dispatch({ type: 'SET_USER', payload: response.data });
      } else {
        throw new Error(response.error || 'Profile update failed');
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signInWithGoogle,
        signInAnonymous,
        signInWithCredentials,
        signUp,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}