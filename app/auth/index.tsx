import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Wallet, 
  User, 
  Lock, 
  Mail,
  ArrowRight,
  Shuffle
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { COLORS } from '../../constants/config';
import Toast from 'react-native-toast-message';

export default function AuthScreen() {
  const { signInWithGoogle, signInAnonymous, signInWithCredentials, signUp, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.replace('/(tabs)');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Sign-in failed',
        text2: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      const randomUsername = authService.generateRandomUsername();
      await signInAnonymous(randomUsername);
      router.replace('/(tabs)');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Sign-in failed',
        text2: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleCredentialsAuth = async () => {
    if (!credentials.username || !credentials.password) {
      Toast.show({
        type: 'error',
        text1: 'Missing fields',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'signin') {
        await signInWithCredentials(credentials.username, credentials.password);
      } else {
        await signUp(credentials.username, credentials.password, credentials.email);
      }
      router.replace('/(tabs)');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: authMode === 'signin' ? 'Sign-in failed' : 'Sign-up failed',
        text2: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateRandomUsername = () => {
    const randomUsername = authService.generateRandomUsername();
    setCredentials(prev => ({ ...prev, username: randomUsername }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.logoContainer}>
          <Wallet size={48} color={COLORS.background} />
        </View>
        <Text style={styles.appTitle}>CryptoRamp</Text>
        <Text style={styles.appSubtitle}>
          Secure crypto trading for Africa
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Quick Access */}
        <Card style={styles.quickAccessCard}>
          <Text style={styles.quickAccessTitle}>Quick Access</Text>
          
          <Button
            title="Continue with Google"
            onPress={handleGoogleSignIn}
            style={styles.googleButton}
            textStyle={styles.googleButtonText}
          />

          <Button
            title="Continue Anonymously"
            onPress={handleAnonymousSignIn}
            variant="outline"
            style={styles.anonymousButton}
          />
        </Card>

        {/* Traditional Auth */}
        <Card style={styles.authCard}>
          <View style={styles.authToggle}>
            <TouchableOpacity
              style={[styles.authTab, authMode === 'signin' && styles.activeAuthTab]}
              onPress={() => setAuthMode('signin')}
            >
              <Text style={[
                styles.authTabText,
                authMode === 'signin' && styles.activeAuthTabText
              ]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.authTab, authMode === 'signup' && styles.activeAuthTab]}
              onPress={() => setAuthMode('signup')}
            >
              <Text style={[
                styles.authTabText,
                authMode === 'signup' && styles.activeAuthTabText
              ]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.usernameContainer}>
            <Input
              label="Username"
              value={credentials.username}
              onChangeText={(value) => setCredentials(prev => ({ ...prev, username: value }))}
              placeholder="Enter username"
              leftIcon={<User size={20} color={COLORS.textSecondary} />}
              rightIcon={
                <TouchableOpacity onPress={generateRandomUsername}>
                  <Shuffle size={20} color={COLORS.primary} />
                </TouchableOpacity>
              }
            />
          </View>

          {authMode === 'signup' && (
            <Input
              label="Email (Optional)"
              value={credentials.email}
              onChangeText={(value) => setCredentials(prev => ({ ...prev, email: value }))}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} color={COLORS.textSecondary} />}
            />
          )}

          <Input
            label="Password"
            value={credentials.password}
            onChangeText={(value) => setCredentials(prev => ({ ...prev, password: value }))}
            placeholder="Enter password"
            isPassword
            leftIcon={<Lock size={20} color={COLORS.textSecondary} />}
          />

          <Button
            title={authMode === 'signin' ? 'Sign In' : 'Create Account'}
            onPress={handleCredentialsAuth}
            loading={isSubmitting}
            style={styles.authButton}
          />
        </Card>

        {/* Features */}
        <View style={styles.features}>
          <Text style={styles.featuresTitle}>Why CryptoRamp?</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>• No KYC required</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>• Instant NGN deposits</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>• Secure wallet management</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>• Low transaction fees</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: COLORS.background,
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  quickAccessCard: {
    marginBottom: 20,
  },
  quickAccessTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    marginBottom: 12,
  },
  googleButtonText: {
    color: COLORS.background,
  },
  anonymousButton: {
    borderColor: COLORS.textSecondary,
  },
  authCard: {
    marginBottom: 20,
  },
  authToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  authTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeAuthTab: {
    backgroundColor: COLORS.background,
  },
  authTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeAuthTabText: {
    color: COLORS.primary,
  },
  usernameContainer: {
    position: 'relative',
  },
  authButton: {
    marginTop: 8,
  },
  features: {
    alignItems: 'center',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  featuresList: {
    alignSelf: 'stretch',
  },
  featureItem: {
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});