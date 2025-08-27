import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { ArrowDownLeft, Clock, CircleCheck as CheckCircle, Circle as XCircle, ExternalLink, Copy } from 'lucide-react-native';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useWallet } from '../../context/WalletContext';
import { apiService } from '../../services/api';
import { Transaction } from '../../types';
import { COLORS } from '../../constants/config';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';

export default function IncomingScreen() {
  const { transactions, isLoading } = useWallet();
  const [incomingTransactions, setIncomingTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadIncomingTransactions();
  }, []);

  const loadIncomingTransactions = async () => {
    try {
      const response = await apiService.getTransactions('incoming');
      if (response.success && response.data) {
        setIncomingTransactions(response.data);
      }
    } catch (error) {
      console.error('Failed to load incoming transactions:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIncomingTransactions();
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={20} color={COLORS.secondary} />;
      case 'failed':
        return <XCircle size={20} color={COLORS.error} />;
      default:
        return <Clock size={20} color={COLORS.warning} />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return COLORS.secondary;
      case 'pending':
      case 'processing':
        return COLORS.warning;
      case 'failed':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Toast.show({
      type: 'success',
      text1: 'Copied to clipboard',
    });
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Card style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <View style={styles.transactionIcon}>
            <ArrowDownLeft size={20} color={COLORS.secondary} />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionType}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)} {item.symbol}
            </Text>
            <Text style={styles.transactionDate}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={styles.transactionStatus}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.transactionAmount}>
        <Text style={styles.amountText}>
          +{item.amount} {item.symbol}
        </Text>
        {item.fiatAmount && (
          <Text style={styles.fiatAmountText}>
            ≈ ₦{parseFloat(item.fiatAmount).toLocaleString()}
          </Text>
        )}
      </View>

      {item.txHash && (
        <View style={styles.transactionHash}>
          <Text style={styles.hashLabel}>Transaction Hash:</Text>
          <TouchableOpacity
            style={styles.hashContainer}
            onPress={() => copyToClipboard(item.txHash!)}
          >
            <Text style={styles.hashText}>
              {item.txHash.substring(0, 10)}...{item.txHash.substring(item.txHash.length - 10)}
            </Text>
            <Copy size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      )}

      {item.fee && (
        <View style={styles.feeContainer}>
          <Text style={styles.feeText}>
            Network Fee: {item.fee} {item.symbol}
          </Text>
        </View>
      )}
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Incoming Transactions</Text>
        <Text style={styles.headerSubtitle}>
          Deposits and purchases
        </Text>
      </View>

      {incomingTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <ArrowDownLeft size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyStateTitle}>No incoming transactions</Text>
          <Text style={styles.emptyStateText}>
            Your deposits and purchases will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={incomingTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  transactionDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  transactionStatus: {
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  transactionAmount: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  amountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  fiatAmountText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  transactionHash: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  hashLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  hashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hashText: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: 'monospace',
  },
  feeContainer: {
    marginTop: 8,
  },
  feeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});