export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidBitcoinAddress(address: string): boolean {
  // Basic Bitcoin address validation (simplified)
  return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || 
         /^bc1[a-z0-9]{39,59}$/.test(address);
}

export function isValidSolanaAddress(address: string): boolean {
  // Basic Solana address validation
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

export function validateCryptoAddress(address: string, network: string): boolean {
  switch (network.toLowerCase()) {
    case 'ethereum':
      return isValidEthereumAddress(address);
    case 'bitcoin':
      return isValidBitcoinAddress(address);
    case 'solana':
      return isValidSolanaAddress(address);
    default:
      return false;
  }
}

export function validateTransactionAmount(
  amount: string,
  balance: string,
  minAmount: number = 0
): { isValid: boolean; error?: string } {
  const numAmount = parseFloat(amount);
  const numBalance = parseFloat(balance);

  if (isNaN(numAmount) || numAmount <= 0) {
    return { isValid: false, error: 'Invalid amount' };
  }

  if (numAmount < minAmount) {
    return { isValid: false, error: `Minimum amount is ${minAmount}` };
  }

  if (numAmount > numBalance) {
    return { isValid: false, error: 'Insufficient balance' };
  }

  return { isValid: true };
}

export function validateBankAccount(accountNumber: string, bankCode: string): boolean {
  return accountNumber.length === 10 && /^\d+$/.test(accountNumber) && bankCode.length > 0;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}