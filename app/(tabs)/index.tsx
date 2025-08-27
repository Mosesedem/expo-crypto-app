import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowDownLeft,
  ArrowUpDown,
  ArrowUpRight,
  Eye,
  EyeOff,
  Minus,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Card } from "../../components/Card";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { COLORS } from "../../constants/config";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const { user } = useAuth();
  const {
    balances,
    transactions,
    isLoading,
    refreshBalances,
    refreshTransactions,
  } = useWallet();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const totalUsdValue = balances.reduce(
    (sum, balance) => sum + parseFloat(balance.usdValue || "0"),
    0
  );

  const recentTransactions = transactions.slice(0, 3);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshBalances(), refreshTransactions()]);
    setRefreshing(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>{user?.username}</Text>
          </View>
          <TouchableOpacity
            style={styles.walletIcon}
            onPress={() => setIsBalanceVisible(!isBalanceVisible)}
          >
            <Wallet size={24} color={COLORS.background} />
          </TouchableOpacity>
        </View>

        {/* Total Balance */}
        <View style={styles.balanceContainer}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Portfolio Value</Text>
            <TouchableOpacity
              onPress={() => setIsBalanceVisible(!isBalanceVisible)}
            >
              {isBalanceVisible ? (
                <Eye size={20} color={COLORS.background} />
              ) : (
                <EyeOff size={20} color={COLORS.background} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {isBalanceVisible ? `$${totalUsdValue.toFixed(2)}` : "••••••"}
          </Text>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: COLORS.secondary }]}
          onPress={() => router.push("/(tabs)/buy-sell?tab=buy")}
        >
          <Plus size={24} color={COLORS.background} />
          <Text style={styles.actionButtonText}>Buy Crypto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: COLORS.error }]}
          onPress={() => router.push("/(tabs)/buy-sell?tab=sell")}
        >
          <Minus size={24} color={COLORS.background} />
          <Text style={styles.actionButtonText}>Sell Crypto</Text>
        </TouchableOpacity>
      </View>

      {/* Portfolio Overview */}
      <Card style={styles.portfolioCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          <TouchableOpacity>
            <TrendingUp size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {balances.length === 0 ? (
          <View style={styles.emptyState}>
            <Wallet size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateText}>No crypto assets yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start by buying your first cryptocurrency
            </Text>
          </View>
        ) : (
          balances.map((balance, index) => (
            <View key={balance.symbol} style={styles.balanceItem}>
              <View style={styles.balanceInfo}>
                <View style={styles.tokenIcon}>
                  <Text style={styles.tokenSymbol}>{balance.symbol}</Text>
                </View>
                <View style={styles.tokenDetails}>
                  <Text style={styles.tokenName}>{balance.name}</Text>
                  <Text style={styles.tokenBalance}>
                    {parseFloat(balance.balance).toFixed(6)} {balance.symbol}
                  </Text>
                </View>
              </View>
              <View style={styles.balanceValue}>
                <Text style={styles.usdValue}>
                  ${parseFloat(balance.usdValue || "0").toFixed(2)}
                </Text>
              </View>
            </View>
          ))
        )}
      </Card>

      {/* Recent Transactions */}
      <Card style={styles.transactionsCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/incoming")}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <ArrowUpDown size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateText}>No transactions yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Your transaction history will appear here
            </Text>
          </View>
        ) : (
          recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                {transaction.type === "buy" ||
                transaction.type === "deposit" ? (
                  <ArrowDownLeft size={20} color={COLORS.secondary} />
                ) : (
                  <ArrowUpRight size={20} color={COLORS.error} />
                )}
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionType}>
                  {transaction.type.charAt(0).toUpperCase() +
                    transaction.type.slice(1)}{" "}
                  {transaction.symbol}
                </Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.transactionAmount}>
                <Text
                  style={[
                    styles.transactionAmountText,
                    {
                      color:
                        transaction.type === "buy" ||
                        transaction.type === "deposit"
                          ? COLORS.secondary
                          : COLORS.error,
                    },
                  ]}
                >
                  {transaction.type === "buy" || transaction.type === "deposit"
                    ? "+"
                    : "-"}
                  {transaction.amount} {transaction.symbol}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(transaction.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{transaction.status}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case "confirmed":
      return COLORS.secondary;
    case "pending":
    case "processing":
      return COLORS.warning;
    case "failed":
      return COLORS.error;
    default:
      return COLORS.textSecondary;
  }
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
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.background,
    opacity: 0.9,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.background,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceContainer: {
    alignItems: "center",
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.background,
    opacity: 0.9,
    marginRight: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.background,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
  portfolioCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  transactionsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  balanceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  balanceInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tokenSymbol: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.background,
  },
  tokenDetails: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  tokenBalance: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  balanceValue: {
    alignItems: "flex-end",
  },
  usdValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  transactionDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.background,
    fontWeight: "600",
  },
});
