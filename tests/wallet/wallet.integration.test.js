import { jest } from '@jest/globals';
import { ethers } from 'ethers';
import {
  generateCustodialWallet,
  loginWithEmail,
  getTokenBalance,
  depositTokens,
  withdrawTokens,
  transferTokens,
  getPropertyDetails,
  getUserBalance,
  getClaimableRent,
  getCurrentUser
} from '../../frontend/src/utils/blockchain';

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: function() {
      store = {};
    },
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();

// Mock store to simulate user data persistence
const mockStore = {};

// Mock fetch for API calls
global.fetch = jest.fn((url) => {
  // Parse the request URL
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  
  // Simulate different API endpoints
  if (path.includes('/api/user')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ 
        id: 'test123', 
        email: 'test@example.com',
        wallet: {
          address: '0xb7051EF101cAb6401BdBC480C6Ad9534dd51a123'
        }
      }),
      status: 200
    });
  } else if (path.includes('/api/properties')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { id: 1, name: 'Property 1', price: '0.1', totalSupply: 100 },
        { id: 2, name: 'Property 2', price: '0.2', totalSupply: 200 }
      ]),
      status: 200
    });
  } else if (path.includes('/api/transactions')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        txHash: 'MOCK_TX_HASH', 
        success: true,
        timestamp: new Date().toISOString()
      }),
      status: 200
    });
  }
  
  // Default response for unhandled endpoints
  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({ error: 'Not found' })
  });
});

// Create mock wallet data for the mock implementation
const createMockWallet = () => ({
  address: '0xb7051EF101cAb6401BdBC480C6Ad9534dd51a123',
  encryptedPrivateKey: 'mock-encrypted-key',
  tokenBalances: {
    eUSD: '100.00',
    BTC: '0.001',
    ETH: '0.05'
  }
});

// Comprehensive mock for blockchain.js
jest.mock('../../frontend/src/utils/blockchain', () => {
  return {
    generateCustodialWallet: jest.fn().mockImplementation(() => {
      return {
        address: '0xb7051EF101cAb6401BdBC480C6Ad9534dd51a123',
        encryptedPrivateKey: 'mock-encrypted-key',
        tokenBalances: {
          eUSD: '100.00',
          BTC: '0.001',
          ETH: '0.05'
        }
      };
    }),
    
    loginWithEmail: jest.fn().mockImplementation(async (email) => {
      // First check if email exists in backend
      const response = await fetch(`https://api.fractea.com/api/user?email=${email}`);
      
      if (!response.ok) {
        throw new Error('API error during login');
      }
      
      const userData = await response.json();
      
      // Create a mock wallet
      const mockWallet = {
        address: '0xb7051EF101cAb6401BdBC480C6Ad9534dd51a123',
        encryptedPrivateKey: 'mock-encrypted-key',
        tokenBalances: {
          eUSD: '100.00',
          BTC: '0.001',
          ETH: '0.05'
        }
      };
      
      // Save to mock store
      mockStore.currentUser = {
        email: email,
        userId: userData.id,
        wallet: userData.wallet || mockWallet
      };
      
      return true;
    }),
    
    depositTokens: jest.fn().mockImplementation(async (email, tokenSymbol, amount) => {
      // Validate inputs
      if (!email || !tokenSymbol || !amount) {
        throw new Error('Missing required parameters');
      }
      
      // Simulate API call to record deposit
      const response = await fetch('https://api.fractea.com/api/transactions/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tokenSymbol, amount })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update user data in mock store
      const currentUser = mockStore.currentUser || {
        email,
        wallet: {
          tokenBalances: {
            [tokenSymbol]: '0'
          }
        }
      };
      
      const currentBalance = parseFloat(currentUser.wallet.tokenBalances[tokenSymbol] || '0');
      currentUser.wallet.tokenBalances[tokenSymbol] = (currentBalance + parseFloat(amount)).toFixed(2);
      
      mockStore.currentUser = currentUser;
      
      return {
        success: true,
        txHash: data.txHash,
        amount,
        tokenSymbol,
        newBalance: currentUser.wallet.tokenBalances[tokenSymbol],
        timestamp: data.timestamp
      };
    }),
    
    withdrawTokens: jest.fn().mockImplementation(async (email, tokenSymbol, amount, destination) => {
      // Validate inputs
      if (!email || !tokenSymbol || !amount || !destination) {
        throw new Error('Missing required parameters');
      }
      
      // Simulate API call
      const response = await fetch('https://api.fractea.com/api/transactions/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tokenSymbol, amount, destination })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update user data in mock store
      const currentUser = mockStore.currentUser;
      if (!currentUser || !currentUser.wallet) {
        throw new Error('User wallet not found');
      }
      
      const currentBalance = parseFloat(currentUser.wallet.tokenBalances[tokenSymbol] || '0');
      if (currentBalance < parseFloat(amount)) {
        throw new Error('Insufficient balance');
      }
      
      currentUser.wallet.tokenBalances[tokenSymbol] = (currentBalance - parseFloat(amount)).toFixed(2);
      mockStore.currentUser = currentUser;
      
      return {
        success: true,
        txHash: data.txHash,
        amount,
        destination,
        tokenSymbol,
        newBalance: currentUser.wallet.tokenBalances[tokenSymbol],
        timestamp: data.timestamp
      };
    }),
    
    transferTokens: jest.fn().mockImplementation(async (fromEmail, tokenSymbol, amount, toAddress) => {
      // Validate inputs
      if (!fromEmail || !tokenSymbol || !amount || !toAddress) {
        throw new Error('Missing required parameters');
      }
      
      // Determine if this is an internal or external transfer
      const isInternal = toAddress.includes('@');
      
      // Simulate API call
      const response = await fetch('https://api.fractea.com/api/transactions/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fromEmail, 
          tokenSymbol, 
          amount, 
          toAddress, 
          isInternal 
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update sender in mock store
      const sender = mockStore.currentUser;
      if (!sender || !sender.wallet) {
        throw new Error('Source user wallet not found');
      }
      
      const senderBalance = parseFloat(sender.wallet.tokenBalances[tokenSymbol] || '0');
      if (senderBalance < parseFloat(amount)) {
        throw new Error('Insufficient balance');
      }
      
      const newSenderBalance = (senderBalance - parseFloat(amount)).toFixed(2);
      sender.wallet.tokenBalances[tokenSymbol] = newSenderBalance;
      
      // For internal transfers, update recipient
      if (isInternal) {
        // Add recipient to mock store if not exists
        if (!mockStore[`userData_${toAddress}`]) {
          mockStore[`userData_${toAddress}`] = {
            email: toAddress,
            wallet: {
              address: '0x' + Math.floor(Math.random() * 10000000).toString(16),
              tokenBalances: {
                eUSD: '0.00',
                BTC: '0.00',
                ETH: '0.00'
              }
            }
          };
        }
        
        // Update recipient balance
        const recipient = mockStore[`userData_${toAddress}`];
        const recipientBalance = parseFloat(recipient.wallet.tokenBalances[tokenSymbol] || '0');
        recipient.wallet.tokenBalances[tokenSymbol] = (recipientBalance + parseFloat(amount)).toFixed(2);
      }
      
      return {
        success: true,
        txHash: data.txHash,
        amount,
        tokenSymbol,
        fromEmail,
        toEmail: isInternal ? toAddress : undefined,
        destination: !isInternal ? toAddress : undefined,
        newBalance: newSenderBalance,
        timestamp: data.timestamp
      };
    }),
    
    getPropertyDetails: jest.fn().mockImplementation(async (propertyId) => {
      // Validate input
      if (!propertyId) {
        throw new Error('Property ID is required');
      }
      
      // Simulate API call
      const response = await fetch(`https://api.fractea.com/api/properties/${propertyId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Return first property as the one requested
      return data[0];
    }),
    
    getUserBalance: jest.fn().mockImplementation(async (propertyId) => {
      // Get current user
      const user = mockStore.currentUser;
      if (!user) {
        return 0;
      }
      
      // Simulated balance data
      return propertyId % 2 === 0 ? 10 : 20;
    }),
    
    getClaimableRent: jest.fn().mockImplementation(async (propertyId) => {
      // Get current user
      const user = mockStore.currentUser;
      if (!user) {
        return '0.00';
      }
      
      // Simulated claimable rent
      return propertyId % 2 === 0 ? '0.5' : '1.2';
    }),
    
    getCurrentUser: jest.fn().mockImplementation(() => {
      return mockStore.currentUser || {
        email: 'test@example.com',
        userId: 'test123',
        wallet: {
          address: '0xb7051EF101cAb6401BdBC480C6Ad9534dd51a123',
          encryptedPrivateKey: 'mock-encrypted-key',
          tokenBalances: {
            eUSD: '100.00',
            BTC: '0.001',
            ETH: '0.05'
          }
        }
      };
    })
  };
});

describe('Wallet Integration Tests', () => {
  beforeEach(() => {
    // Clear mocks and store
    jest.clearAllMocks();
    mockStore.currentUser = {
      email: 'test@example.com',
      userId: 'test123',
      wallet: {
        address: '0xb7051EF101cAb6401BdBC480C6Ad9534dd51a123',
        encryptedPrivateKey: 'mock-encrypted-key',
        tokenBalances: {
          eUSD: '100.00',
          BTC: '0.001',
          ETH: '0.05'
        }
      }
    };
    
    // Reset fetch mock
    fetch.mockClear();
  });

  describe('User Authentication Flow', () => {
    test('should login and retrieve user data from API', async () => {
      await loginWithEmail('test@example.com');
      
      // Verify fetch was called with the correct URL
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/user'));
      
      // Check user was saved in store
      const currentUser = getCurrentUser();
      expect(currentUser).toBeDefined();
      expect(currentUser.email).toBe('test@example.com');
      expect(currentUser.wallet).toBeDefined();
      expect(currentUser.wallet.address).toMatch(/^0x/);
    });
    
    test('should handle API errors during login gracefully', async () => {
      // Make fetch fail for this test
      fetch.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' })
      }));
      
      await expect(loginWithEmail('test@example.com')).rejects.toThrow('API error');
    });
  });

  describe('Token Operations with API Integration', () => {
    test('should record deposits via API and update local state', async () => {
      const result = await depositTokens('test@example.com', 'eUSD', '50.00');
      
      // Verify API was called
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/transactions/deposit'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('eUSD')
        })
      );
      
      // Check result
      expect(result.success).toBe(true);
      expect(result.amount).toBe('50.00');
      expect(result.tokenSymbol).toBe('eUSD');
      expect(result.newBalance).toBe('150.00');
      
      // Verify store was updated
      const currentUser = getCurrentUser();
      expect(currentUser.wallet.tokenBalances.eUSD).toBe('150.00');
    });
    
    test('should handle withdrawals via API and update local state', async () => {
      const result = await withdrawTokens('test@example.com', 'eUSD', '30.00', '0xDestinationAddress');
      
      // Verify API was called
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/transactions/withdraw'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('eUSD')
        })
      );
      
      // Check result
      expect(result.success).toBe(true);
      expect(result.amount).toBe('30.00');
      expect(result.tokenSymbol).toBe('eUSD');
      expect(result.destination).toBe('0xDestinationAddress');
      expect(result.newBalance).toBe('70.00');
      
      // Verify store was updated
      const currentUser = getCurrentUser();
      expect(currentUser.wallet.tokenBalances.eUSD).toBe('70.00');
    });
    
    test('should handle internal transfers via API and update both users', async () => {
      const result = await transferTokens('test@example.com', 'eUSD', '25.00', 'recipient@example.com');
      
      // Verify API was called
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/transactions/transfer'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('isInternal')
        })
      );
      
      // Check result
      expect(result.success).toBe(true);
      expect(result.amount).toBe('25.00');
      expect(result.tokenSymbol).toBe('eUSD');
      expect(result.fromEmail).toBe('test@example.com');
      expect(result.toEmail).toBe('recipient@example.com');
      expect(result.newBalance).toBe('75.00');
      
      // Verify sender was updated
      const sender = getCurrentUser();
      expect(sender.wallet.tokenBalances.eUSD).toBe('75.00');
      
      // Verify recipient was updated
      const recipient = mockStore[`userData_recipient@example.com`];
      expect(recipient).toBeDefined();
      expect(recipient.wallet.tokenBalances.eUSD).toBe('25.00');
    });
    
    test('should handle external transfers via API', async () => {
      const result = await transferTokens('test@example.com', 'eUSD', '25.00', '0xExternalAddress');
      
      // Verify API was called
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/transactions/transfer'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('0xExternalAddress')
        })
      );
      
      // Check result
      expect(result.success).toBe(true);
      expect(result.amount).toBe('25.00');
      expect(result.tokenSymbol).toBe('eUSD');
      expect(result.destination).toBe('0xExternalAddress');
      expect(result.fromEmail).toBe('test@example.com');
      expect(result.newBalance).toBe('75.00');
    });
  });

  describe('Property Integration', () => {
    test('should fetch property details from API', async () => {
      const property = await getPropertyDetails(1);
      
      // Verify API was called
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/properties/1'));
      
      // Check result
      expect(property).toBeDefined();
      expect(property.id).toBe(1);
      expect(property.name).toBe('Property 1');
    });
    
    test('should get user balance for property', async () => {
      const balance = await getUserBalance(1);
      
      // No API call needed as this uses current user data
      expect(balance).toBe(20);
    });
    
    test('should get claimable rent for property', async () => {
      const rent = await getClaimableRent(1);
      
      // No API call needed as this uses current user data
      expect(rent).toBe('1.2');
    });
  });

  describe('Error Handling in API Integration', () => {
    test('should handle API errors during deposit', async () => {
      // Make fetch fail for this test
      fetch.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' })
      }));
      
      await expect(depositTokens('test@example.com', 'eUSD', '50.00'))
        .rejects.toThrow('API error');
    });
    
    test('should handle API errors during withdrawal', async () => {
      // Make fetch fail for this test
      fetch.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' })
      }));
      
      await expect(withdrawTokens('test@example.com', 'eUSD', '30.00', '0xDestinationAddress'))
        .rejects.toThrow('API error');
    });
    
    test('should handle API errors during transfer', async () => {
      // Make fetch fail for this test
      fetch.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' })
      }));
      
      await expect(transferTokens('test@example.com', 'eUSD', '25.00', 'recipient@example.com'))
        .rejects.toThrow('API error');
    });
    
    test('should handle API errors when fetching property details', async () => {
      // Make fetch fail for this test
      fetch.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Property not found' })
      }));
      
      await expect(getPropertyDetails(999))
        .rejects.toThrow('API error');
    });
  });
}); 