import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import { ArrowUpDown, Minus, Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import {
  COLORS,
  SUPPORTED_TOKENS,
  TRANSACTION_LIMITS,
} from "../../constants/config";
import { useWallet } from "../../context/WalletContext";
import { apiService } from "../../services/api";
import { BankAccount, CryptoToken } from "../../types";

export default function BuySellScreen() {
  const { tab } = useLocalSearchParams();
  const { balances, refreshBalances } = useWallet();
  const [activeTab, setActiveTab] = useState<"buy" | "sell">(
    (tab as "buy" | "sell") || "buy"
  );
  const [selectedToken, setSelectedToken] = useState<CryptoToken>({
    ...SUPPORTED_TOKENS[0],
    minAmount: "0",
    maxAmount: "0",
  });
  const [amount, setAmount] = useState("");
  const [fiatAmount, setFiatAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [bankAccount, setBankAccount] = useState<BankAccount>({
    accountNumber: "",
    bankName: "",
    accountName: "",
    bankCode: "",
  });
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [showBankSelector, setShowBankSelector] = useState(false);

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      const response = await apiService.getBankList();
      if (response.success && response.data) {
        setBanks(response.data);
      }
    } catch (error) {
      console.error("Failed to load banks:", error);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    // Convert to fiat for buy, or from fiat for sell
    if (activeTab === "buy") {
      // Assume 1 ETH = $2000 for demo (should fetch real rates)
      const rate =
        selectedToken.symbol === "BTC"
          ? 45000
          : selectedToken.symbol === "ETH"
          ? 2000
          : 1;
      setFiatAmount((parseFloat(value || "0") * rate).toString());
    }
  };

  const handleFiatAmountChange = (value: string) => {
    setFiatAmount(value);
    if (activeTab === "buy") {
      const rate =
        selectedToken.symbol === "BTC"
          ? 45000
          : selectedToken.symbol === "ETH"
          ? 2000
          : 1;
      setAmount((parseFloat(value || "0") / rate).toString());
    }
  };

  const validateBuyTransaction = (): boolean => {
    const fiatValue = parseFloat(fiatAmount || "0");
    if (fiatValue < TRANSACTION_LIMITS.MIN_BUY_AMOUNT) {
      Toast.show({
        type: "error",
        text1: "Amount too low",
        text2: `Minimum buy amount is ₦${TRANSACTION_LIMITS.MIN_BUY_AMOUNT}`,
      });
      return false;
    }
    if (fiatValue > TRANSACTION_LIMITS.DAILY_BUY_LIMIT) {
      Toast.show({
        type: "error",
        text1: "Amount too high",
        text2: `Daily buy limit is ₦${TRANSACTION_LIMITS.DAILY_BUY_LIMIT}`,
      });
      return false;
    }
    return true;
  };

  const validateSellTransaction = (): boolean => {
    const userBalance = balances.find((b) => b.symbol === selectedToken.symbol);
    if (
      !userBalance ||
      parseFloat(userBalance.balance) < parseFloat(amount || "0")
    ) {
      Toast.show({
        type: "error",
        text1: "Insufficient balance",
        text2: `You don't have enough ${selectedToken.symbol}`,
      });
      return false;
    }

    if (!bankAccount.accountNumber || !bankAccount.bankCode) {
      Toast.show({
        type: "error",
        text1: "Bank details required",
        text2: "Please provide your bank account details",
      });
      return false;
    }

    return true;
  };

  const handleBuy = async () => {
    if (!validateBuyTransaction()) return;

    setIsLoading(true);
    try {
      const response = await apiService.initiateBuy(
        selectedToken.symbol,
        amount,
        fiatAmount
      );

      if (response.success && response.data) {
        Toast.show({
          type: "success",
          text1: "Buy order initiated",
          text2: "Complete payment to receive your crypto",
        });

        // Navigate to payment screen or show payment modal
        // This would integrate with Paystack
        setAmount("");
        setFiatAmount("");
        refreshBalances();
      } else {
        throw new Error(response.error || "Buy transaction failed");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Transaction failed",
        text2: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSell = async () => {
    if (!validateSellTransaction()) return;

    setIsLoading(true);
    try {
      const response = await apiService.initiateSell(
        selectedToken.symbol,
        amount,
        bankAccount
      );

      if (response.success && response.data) {
        Toast.show({
          type: "success",
          text1: "Sell order initiated",
          text2: `Send ${amount} ${selectedToken.symbol} to the provided address`,
        });

        setAmount("");
        setFiatAmount("");
        refreshBalances();
      } else {
        throw new Error(response.error || "Sell transaction failed");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Transaction failed",
        text2: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyBankAccount = async () => {
    if (!bankAccount.accountNumber || !bankAccount.bankCode) return;

    try {
      const response = await apiService.verifyBankAccount(
        bankAccount.accountNumber,
        bankAccount.bankCode
      );

      if (response.success && response.data) {
        setBankAccount((prev) => ({
          ...prev,
          accountName: response.data!.accountName,
        }));
        Toast.show({
          type: "success",
          text1: "Account verified",
          text2: `Account holder: ${response.data.accountName}`,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Verification failed",
        text2: "Please check your account details",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Toast.show({
      type: "success",
      text1: "Copied to clipboard",
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trade Crypto</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "buy" && styles.activeTab]}
            onPress={() => setActiveTab("buy")}
          >
            <Plus
              size={20}
              color={activeTab === "buy" ? COLORS.background : COLORS.primary}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "buy" ? COLORS.background : COLORS.primary,
                },
              ]}
            >
              Buy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "sell" && styles.activeTab]}
            onPress={() => setActiveTab("sell")}
          >
            <Minus
              size={20}
              color={activeTab === "sell" ? COLORS.background : COLORS.error}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "sell" ? COLORS.background : COLORS.error,
                },
              ]}
            >
              Sell
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.tradeCard}>
          {/* Token Selection */}
          <TouchableOpacity
            style={styles.tokenSelector}
            onPress={() => setShowTokenSelector(true)}
          >
            <View style={styles.tokenInfo}>
              <View style={styles.tokenIcon}>
                <Text style={styles.tokenSymbol}>{selectedToken.symbol}</Text>
              </View>
              <View>
                <Text style={styles.tokenName}>{selectedToken.name}</Text>
                <Text style={styles.tokenNetwork}>{selectedToken.network}</Text>
              </View>
            </View>
            <ArrowUpDown size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Amount Input */}
          <Input
            label={`${selectedToken.symbol} Amount`}
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="0.00"
            keyboardType="numeric"
            rightIcon={
              <Text style={styles.currencyLabel}>{selectedToken.symbol}</Text>
            }
          />

          {/* Fiat Amount */}
          <Input
            label="NGN Amount"
            value={fiatAmount}
            onChangeText={handleFiatAmountChange}
            placeholder="0.00"
            keyboardType="numeric"
            rightIcon={<Text style={styles.currencyLabel}>NGN</Text>}
          />

          {/* Sell-specific: Bank Account */}
          {activeTab === "sell" && (
            <>
              <Input
                label="Account Number"
                value={bankAccount.accountNumber}
                onChangeText={(value) =>
                  setBankAccount((prev) => ({ ...prev, accountNumber: value }))
                }
                placeholder="1234567890"
                keyboardType="numeric"
                onBlur={verifyBankAccount}
              />

              <TouchableOpacity
                style={styles.bankSelector}
                onPress={() => setShowBankSelector(true)}
              >
                <Text style={styles.bankSelectorText}>
                  {bankAccount.bankName || "Select Bank"}
                </Text>
                <ArrowUpDown size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>

              {bankAccount.accountName && (
                <View style={styles.accountVerification}>
                  <Text style={styles.accountName}>
                    Account Name: {bankAccount.accountName}
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Transaction Limits */}
          <View style={styles.limitsContainer}>
            <Text style={styles.limitsTitle}>Transaction Limits</Text>
            <Text style={styles.limitsText}>
              Min: ₦{TRANSACTION_LIMITS.MIN_BUY_AMOUNT.toLocaleString()}
            </Text>
            <Text style={styles.limitsText}>
              Daily Max: ₦{TRANSACTION_LIMITS.DAILY_BUY_LIMIT.toLocaleString()}
            </Text>
          </View>

          {/* Action Button */}
          <Button
            title={activeTab === "buy" ? "Buy Crypto" : "Sell Crypto"}
            onPress={activeTab === "buy" ? handleBuy : handleSell}
            loading={isLoading}
            disabled={
              !amount ||
              !fiatAmount ||
              (activeTab === "sell" && !bankAccount.accountName)
            }
            variant={activeTab === "buy" ? "secondary" : "danger"}
          />
        </Card>
      </ScrollView>

      {/* Token Selection Modal */}
      <Modal
        visible={showTokenSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Token</Text>
            <TouchableOpacity onPress={() => setShowTokenSelector(false)}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {SUPPORTED_TOKENS.map((token) => (
              <TouchableOpacity
                key={token.symbol}
                style={[
                  styles.tokenOption,
                  selectedToken.symbol === token.symbol &&
                    styles.selectedTokenOption,
                ]}
                onPress={() => {
                  setSelectedToken({
                    ...token,
                    minAmount: "0",
                    maxAmount: "0",
                  });
                  setShowTokenSelector(false);
                }}
              >
                <View style={styles.tokenInfo}>
                  <View style={styles.tokenIcon}>
                    <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                  </View>
                  <View>
                    <Text style={styles.tokenName}>{token.name}</Text>
                    <Text style={styles.tokenNetwork}>{token.network}</Text>
                  </View>
                </View>
                {balances.find((b) => b.symbol === token.symbol) && (
                  <Text style={styles.tokenBalance}>
                    {parseFloat(
                      balances.find((b) => b.symbol === token.symbol)
                        ?.balance || "0"
                    ).toFixed(6)}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Bank Selection Modal */}
      <Modal
        visible={showBankSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Bank</Text>
            <TouchableOpacity onPress={() => setShowBankSelector(false)}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {banks.map((bank) => (
              <TouchableOpacity
                key={bank.code}
                style={styles.bankOption}
                onPress={() => {
                  setBankAccount((prev) => ({
                    ...prev,
                    bankName: bank.name,
                    bankCode: bank.code,
                  }));
                  setShowBankSelector(false);
                  verifyBankAccount();
                }}
              >
                <Text style={styles.bankName}>{bank.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tradeCard: {
    marginBottom: 20,
  },
  tokenSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 20,
  },
  tokenInfo: {
    flexDirection: "row",
    alignItems: "center",
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
  tokenName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  tokenNetwork: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  currencyLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  bankSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  bankSelectorText: {
    fontSize: 16,
    color: COLORS.text,
  },
  accountVerification: {
    padding: 12,
    backgroundColor: COLORS.secondary + "20",
    borderRadius: 8,
    marginBottom: 16,
  },
  accountName: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: "600",
  },
  limitsContainer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 20,
  },
  limitsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  limitsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  modalClose: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  tokenOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedTokenOption: {
    backgroundColor: COLORS.primary + "20",
  },
  tokenBalance: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  bankOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  bankName: {
    fontSize: 16,
    color: COLORS.text,
  },
});
