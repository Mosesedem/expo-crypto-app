import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { User, Settings, Shield, Key, LogOut, CreditCard as Edit3, Eye, Copy, Fingerprint, Mail, Phone } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { authService } from '../../services/auth';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { COLORS } from '../../constants/config';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';

export default function ProfileScreen() {
  const { user, signOut, updateUser } = useAuth();
  const { exportMnemonic } = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [mnemonic, setMnemonic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  React.useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const available = await authService.isBiometricAvailable();
    setBiometricAvailable(available);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateUser(editedUser);
      setIsEditing(false);
      Toast.show({
        type: 'success',
        text1: 'Profile updated',
        text2: 'Your profile has been successfully updated',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Update failed',
        text2: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportMnemonic = async () => {
    const biometricAuth = await authService.authenticateWithBiometric();
    if (!biometricAuth && biometricAvailable) {
      Toast.show({
        type: 'error',
        text1: 'Authentication required',
        text2: 'Please authenticate to view your recovery phrase',
      });
      return;
    }

    Alert.alert(
      'Export Recovery Phrase',
      'Your recovery phrase gives full access to your wallet. Keep it safe and never share it with anyone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const mnemonicPhrase = await exportMnemonic();
              if (mnemonicPhrase) {
                setMnemonic(mnemonicPhrase);
                setShowMnemonic(true);
              } else {
                throw new Error('Failed to export mnemonic');
              }
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Export failed',
                text2: error instanceof Error ? error.message : 'Unknown error',
              });
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const copyMnemonic = async () => {
    await Clipboard.setStringAsync(mnemonic);
    Toast.show({
      type: 'success',
      text1: 'Recovery phrase copied',
      text2: 'Store it in a safe place',
    });
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={32} color={COLORS.background} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.userType}>
              {user.isAnonymous ? 'Anonymous User' : 'Registered User'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Edit3 size={20} color={COLORS.background} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Profile Information */}
        <Card style={styles.profileCard}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          {isEditing ? (
            <>
              <Input
                label="Username"
                value={editedUser.username}
                onChangeText={(value) => setEditedUser(prev => ({ ...prev, username: value }))}
                leftIcon={<User size={20} color={COLORS.textSecondary} />}
              />
              <Input
                label="Email (Optional)"
                value={editedUser.email}
                onChangeText={(value) => setEditedUser(prev => ({ ...prev, email: value }))}
                leftIcon={<Mail size={20} color={COLORS.textSecondary} />}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Phone (Optional)"
                value={editedUser.phone}
                onChangeText={(value) => setEditedUser(prev => ({ ...prev, phone: value }))}
                leftIcon={<Phone size={20} color={COLORS.textSecondary} />}
                keyboardType="phone-pad"
              />
              <View style={styles.editActions}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setIsEditing(false);
                    setEditedUser({
                      username: user.username,
                      email: user.email || '',
                      phone: user.phone || '',
                    });
                  }}
                  variant="outline"
                  style={styles.editButton}
                />
                <Button
                  title="Save"
                  onPress={handleSaveProfile}
                  loading={isLoading}
                  style={styles.editButton}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.profileItem}>
                <User size={20} color={COLORS.textSecondary} />
                <Text style={styles.profileLabel}>Username</Text>
                <Text style={styles.profileValue}>{user.username}</Text>
              </View>
              {user.email && (
                <View style={styles.profileItem}>
                  <Mail size={20} color={COLORS.textSecondary} />
                  <Text style={styles.profileLabel}>Email</Text>
                  <Text style={styles.profileValue}>{user.email}</Text>
                </View>
              )}
              {user.phone && (
                <View style={styles.profileItem}>
                  <Phone size={20} color={COLORS.textSecondary} />
                  <Text style={styles.profileLabel}>Phone</Text>
                  <Text style={styles.profileValue}>{user.phone}</Text>
                </View>
              )}
            </>
          )}
        </Card>

        {/* Security Settings */}
        <Card style={styles.securityCard}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          {biometricAvailable && (
            <TouchableOpacity style={styles.securityItem}>
              <View style={styles.securityItemLeft}>
                <Fingerprint size={20} color={COLORS.primary} />
                <Text style={styles.securityItemText}>Biometric Authentication</Text>
              </View>
              <Text style={styles.securityItemStatus}>Enabled</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.securityItem}
            onPress={handleExportMnemonic}
          >
            <View style={styles.securityItemLeft}>
              <Key size={20} color={COLORS.warning} />
              <Text style={styles.securityItemText}>Export Recovery Phrase</Text>
            </View>
            <Text style={styles.securityItemAction}>Export</Text>
          </TouchableOpacity>
        </Card>

        {/* Account Actions */}
        <Card style={styles.actionsCard}>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={handleSignOut}
          >
            <LogOut size={20} color={COLORS.error} />
            <Text style={[styles.actionItemText, { color: COLORS.error }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </Card>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>CryptoRamp v1.0.0</Text>
          <Text style={styles.appInfoText}>Secure crypto trading for Africa</Text>
        </View>
      </ScrollView>

      {/* Mnemonic Modal */}
      <Modal
        visible={showMnemonic}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.mnemonicModal}>
          <View style={styles.mnemonicHeader}>
            <Text style={styles.mnemonicTitle}>Recovery Phrase</Text>
            <TouchableOpacity onPress={() => setShowMnemonic(false)}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.mnemonicWarning}>
            <Shield size={24} color={COLORS.warning} />
            <Text style={styles.warningText}>
              Keep this phrase safe and never share it with anyone. 
              Anyone with this phrase can access your wallet.
            </Text>
          </View>

          <View style={styles.mnemonicContainer}>
            <Text style={styles.mnemonicText}>{mnemonic}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={copyMnemonic}
            >
              <Copy size={20} color={COLORS.primary} />
              <Text style={styles.copyButtonText}>Copy to Clipboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  userType: {
    fontSize: 14,
    color: COLORS.background,
    opacity: 0.8,
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    marginBottom: 16,
  },
  securityCard: {
    marginBottom: 16,
  },
  actionsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  profileLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  profileValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  securityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  securityItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  securityItemStatus: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  securityItemAction: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  actionItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  mnemonicModal: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mnemonicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mnemonicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalClose: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  mnemonicWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.warning + '20',
    margin: 20,
    borderRadius: 12,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.warning,
    lineHeight: 20,
  },
  mnemonicContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mnemonicText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: COLORS.primary + '20',
    borderRadius: 8,
    gap: 8,
  },
  copyButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
});