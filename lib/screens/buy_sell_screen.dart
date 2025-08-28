import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../constants/app_colors.dart';
import '../providers/wallet_provider.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';

class BuySellScreen extends StatefulWidget {
  const BuySellScreen({super.key});

  @override
  State<BuySellScreen> createState() => _BuySellScreenState();
}

class _BuySellScreenState extends State<BuySellScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _fiatAmountController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _bankAccountController = TextEditingController();
  final _bankCodeController = TextEditingController();

  bool _isBuyMode = true;
  bool _isLoading = false;
  bool _isLoadingPrices = false;
  String _selectedToken = 'BTC';
  double _currentPrice = 0.0;
  double _exchangeRate = 0.0;

  final List<String> _cryptoTokens = ['BTC', 'ETH', 'USDT', 'BNB', 'ADA'];
  final List<Map<String, String>> _banks = [
    {'name': 'Access Bank', 'code': '044'},
    {'name': 'Zenith Bank', 'code': '057'},
    {'name': 'GT Bank', 'code': '058'},
    {'name': 'UBA', 'code': '033'},
    {'name': 'First Bank', 'code': '011'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: Text('${_isBuyMode ? 'Buy' : 'Sell'} Crypto'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            onPressed: _toggleMode,
            icon: Icon(_isBuyMode ? Icons.sell : Icons.shopping_cart),
            tooltip: 'Switch to ${_isBuyMode ? 'Sell' : 'Buy'}',
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: Column(
          children: [
            // Mode Toggle
            Container(
              margin: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _isBuyMode = true),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        decoration: BoxDecoration(
                          color: _isBuyMode
                              ? AppColors.success
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Center(
                          child: Text(
                            'Buy',
                            style: TextStyle(
                              color: _isBuyMode
                                  ? Colors.white
                                  : AppColors.textSecondary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _isBuyMode = false),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        decoration: BoxDecoration(
                          color: !_isBuyMode
                              ? AppColors.error
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Center(
                          child: Text(
                            'Sell',
                            style: TextStyle(
                              color: !_isBuyMode
                                  ? Colors.white
                                  : AppColors.textSecondary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    // Token Selection
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Select Cryptocurrency',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          DropdownButtonFormField<String>(
                            value: _selectedToken,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                            ),
                            items: _cryptoTokens.map((token) {
                              return DropdownMenuItem(
                                value: token,
                                child: Text(token),
                              );
                            }).toList(),
                            onChanged: _onTokenChanged,
                          ),
                          if (_currentPrice > 0) ...[
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Current Price:',
                                  style: TextStyle(
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                                Text(
                                  '\$${_currentPrice.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Exchange Rate:',
                                  style: TextStyle(
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                                Text(
                                  '₦${_exchangeRate.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Amount Input
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${_isBuyMode ? 'Buy' : 'Sell'} Amount',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          CustomTextField(
                            controller: _amountController,
                            label: '$_selectedToken Amount',
                            icon: Icons.currency_bitcoin,
                            keyboardType: TextInputType.number,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter amount';
                              }
                              final amount = double.tryParse(value);
                              if (amount == null || amount <= 0) {
                                return 'Please enter a valid amount';
                              }
                              if (_isBuyMode && amount * _exchangeRate < 1000) {
                                return 'Minimum amount is ₦1,000';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          CustomTextField(
                            controller: _fiatAmountController,
                            label: 'NGN Amount',
                            icon: Icons.attach_money,
                            keyboardType: TextInputType.number,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter NGN amount';
                              }
                              final amount = double.tryParse(value);
                              if (amount == null || amount < 1000) {
                                return 'Minimum amount is ₦1,000';
                              }
                              if (amount > 1000000) {
                                return 'Maximum amount is ₦1,000,000';
                              }
                              return null;
                            },
                          ),
                        ],
                      ),
                    ),

                    if (!_isBuyMode) ...[
                      const SizedBox(height: 20),

                      // Bank Details for Sell
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Bank Account Details',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 16),
                            CustomTextField(
                              controller: _emailController,
                              label: 'Email Address',
                              icon: Icons.email,
                              keyboardType: TextInputType.emailAddress,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Please enter email';
                                }
                                if (!RegExp(
                                  r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
                                ).hasMatch(value)) {
                                  return 'Please enter a valid email';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 16),
                            CustomTextField(
                              controller: _phoneController,
                              label: 'Phone Number',
                              icon: Icons.phone,
                              keyboardType: TextInputType.phone,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Please enter phone number';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 16),
                            DropdownButtonFormField<String>(
                              value: _banks.first['code'],
                              decoration: InputDecoration(
                                labelText: 'Bank',
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 12,
                                ),
                              ),
                              items: _banks.map((bank) {
                                return DropdownMenuItem(
                                  value: bank['code'],
                                  child: Text(bank['name']!),
                                );
                              }).toList(),
                              onChanged: (value) {
                                setState(
                                  () => _bankCodeController.text = value ?? '',
                                );
                              },
                            ),
                            const SizedBox(height: 16),
                            CustomTextField(
                              controller: _bankAccountController,
                              label: 'Account Number',
                              icon: Icons.account_balance,
                              keyboardType: TextInputType.number,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Please enter account number';
                                }
                                if (value.length < 10) {
                                  return 'Account number must be at least 10 digits';
                                }
                                return null;
                              },
                            ),
                          ],
                        ),
                      ),
                    ],

                    const SizedBox(height: 20),

                    // Transaction Limits
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Transaction Limits',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          _buildLimitRow('Minimum Amount', '₦1,000'),
                          _buildLimitRow('Daily Maximum', '₦1,000,000'),
                          _buildLimitRow(
                            'Processing Time',
                            _isBuyMode ? '5-10 minutes' : '24 hours',
                          ),
                          _buildLimitRow('Fee', _isBuyMode ? '2.5%' : '1.5%'),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Action Button
                    CustomButton(
                      text: _isLoading
                          ? 'Processing...'
                          : '${_isBuyMode ? 'Buy' : 'Sell'} $_selectedToken',
                      onPressed: _isLoading ? null : _handleTransaction,
                      backgroundColor: _isBuyMode
                          ? AppColors.success
                          : AppColors.error,
                      textColor: Colors.white,
                      isLoading: _isLoading,
                    ),

                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _amountController.dispose();
    _fiatAmountController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _bankAccountController.dispose();
    _bankCodeController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _fetchCryptoPrices();
    _setupAmountListeners();
  }

  Widget _buildLimitRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
          ),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Future<void> _fetchCryptoPrices() async {
    setState(() => _isLoadingPrices = true);

    try {
      final walletProvider = Provider.of<WalletProvider>(
        context,
        listen: false,
      );
      final prices = await walletProvider.getCryptoPrices();

      if (prices.isNotEmpty) {
        final tokenPrice = prices.firstWhere(
          (token) => token.symbol == _selectedToken,
          orElse: () => prices.first,
        );

        setState(() {
          _currentPrice = tokenPrice.price;
          _exchangeRate = tokenPrice.price * 1500; // Assuming 1 USD = 1500 NGN
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to fetch prices: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      setState(() => _isLoadingPrices = false);
    }
  }

  Future<void> _handleTransaction() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final walletProvider = Provider.of<WalletProvider>(
        context,
        listen: false,
      );
      bool success;

      if (_isBuyMode) {
        // Buy crypto
        success = await walletProvider.initiateBuy(
          _selectedToken,
          _amountController.text,
          _fiatAmountController.text,
        );

        if (success && mounted) {
          _showSuccessDialog(
            'Buy Order Created',
            'Your buy order has been created successfully. You will receive a payment link shortly.',
          );
        }
      } else {
        // Sell crypto
        final bankDetails = {
          'accountNumber': _bankAccountController.text,
          'bankCode': _bankCodeController.text,
          'email': _emailController.text,
          'phone': _phoneController.text,
        };

        success = await walletProvider.initiateSell(
          _selectedToken,
          _amountController.text,
          bankDetails,
        );

        if (success && mounted) {
          _showSuccessDialog(
            'Sell Order Created',
            'Your sell order has been created successfully. You will receive payment within 24 hours.',
          );
        }
      }

      if (!success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Failed to create ${_isBuyMode ? 'buy' : 'sell'} order',
            ),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _onAmountChanged() {
    if (_amountController.text.isNotEmpty && _exchangeRate > 0) {
      final amount = double.tryParse(_amountController.text) ?? 0;
      final fiatAmount = amount * _exchangeRate;
      _fiatAmountController.text = fiatAmount.toStringAsFixed(2);
    }
  }

  void _onFiatAmountChanged() {
    if (_fiatAmountController.text.isNotEmpty && _exchangeRate > 0) {
      final fiatAmount = double.tryParse(_fiatAmountController.text) ?? 0;
      final amount = fiatAmount / _exchangeRate;
      _amountController.text = amount.toStringAsFixed(8);
    }
  }

  void _onTokenChanged(String? token) {
    if (token != null && token != _selectedToken) {
      setState(() => _selectedToken = token);
      _fetchCryptoPrices();
    }
  }

  void _setupAmountListeners() {
    _amountController.addListener(_onAmountChanged);
    _fiatAmountController.addListener(_onFiatAmountChanged);
  }

  void _showSuccessDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _formKey.currentState?.reset();
              _amountController.clear();
              _fiatAmountController.clear();
              _emailController.clear();
              _phoneController.clear();
              _bankAccountController.clear();
              _bankCodeController.clear();
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _toggleMode() {
    setState(() {
      _isBuyMode = !_isBuyMode;
      _amountController.clear();
      _fiatAmountController.clear();
    });
  }
}
