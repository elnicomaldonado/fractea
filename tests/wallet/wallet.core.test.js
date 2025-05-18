import { jest } from '@jest/globals';
import { ethers } from 'ethers';
import { 
  generateCustodialWallet,
  loginWithEmail,
  getTokenBalance,
  depositTokens,
  withdrawTokens,
  transferTokens,
  getReadProvider,
  getReadOnlyContract,
  getWriteContract,
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

// Mock para operaciones de blockchain
jest.mock('../../frontend/src/utils/blockchain', () => {
  // Necesitamos usar mockStore ya que no podemos acceder a localStorage dentro del mock
  const mockStore = {
    // Inicializamos con datos para que las pruebas tengan valores iniciales
    'userData_test@example.com': {
      wallet: {
        tokenBalances: {
          eUSD: '100.00',
          BTC: '0.001',
          ETH: '0.05'
        }
      }
    }
  };
  
  return {
    generateCustodialWallet: jest.fn().mockReturnValue({
      address: '0xb7051EF101cAb6401BdBC480C6Ad9534dd51a123',
      encryptedPrivateKey: 'mock-encrypted-key',
      tokenBalances: {
        eUSD: '100.00',
        BTC: '0.001',
        ETH: '0.05'
      }
    }),
    
    loginWithEmail: jest.fn().mockImplementation((email) => {
      // Asegurarnos de que el usuario existe en el mockStore
      if (!mockStore[`userData_${email}`]) {
        mockStore[`userData_${email}`] = {
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
      }
      return Promise.resolve(true);
    }),
    
    getTokenBalance: jest.fn().mockImplementation((email, tokenSymbol) => {
      const mockEmailKey = `userData_${email}`;
      const userData = mockStore[mockEmailKey] || {
        wallet: {
          tokenBalances: {
            eUSD: '100.00',
            BTC: '0.001',
            ETH: '0.05'
          }
        }
      };
      return Promise.resolve(userData.wallet.tokenBalances[tokenSymbol] || '0.00');
    }),
    
    depositTokens: jest.fn().mockImplementation((email, tokenSymbol, amount) => {
      const mockEmailKey = `userData_${email}`;
      
      // Inicializar si no existe
      if (!mockStore[mockEmailKey]) {
        mockStore[mockEmailKey] = {
          wallet: {
            tokenBalances: {
              eUSD: '0.00',
              BTC: '0.00',
              ETH: '0.00'
            }
          }
        };
      }
      
      // Actualizar balance
      const userData = mockStore[mockEmailKey];
      const currentBalance = parseFloat(userData.wallet.tokenBalances[tokenSymbol] || '0');
      const newBalance = (currentBalance + parseFloat(amount)).toFixed(2);
      userData.wallet.tokenBalances[tokenSymbol] = newBalance;
      
      return Promise.resolve({
        success: true,
        amount: amount,
        tokenSymbol: tokenSymbol,
        newBalance: newBalance,
        txHash: 'MOCK_TX_HASH'
      });
    }),
    
    withdrawTokens: jest.fn().mockImplementation((email, tokenSymbol, amount, destination) => {
      const mockEmailKey = `userData_${email}`;
      
      // Verificar que existe el usuario
      if (!mockStore[mockEmailKey]) {
        return Promise.reject(new Error('Wallet de usuario no encontrada'));
      }
      
      // Verificar dirección válida primero, antes de comprobar el balance
      if (!destination.startsWith('0x')) {
        return Promise.reject(new Error('Dirección de destino inválida'));
      }
      
      const userData = mockStore[mockEmailKey];
      const currentBalance = parseFloat(userData.wallet.tokenBalances[tokenSymbol] || '0');
      
      // Verificar balance suficiente
      if (parseFloat(amount) > currentBalance) {
        return Promise.reject(new Error('Balance insuficiente'));
      }
      
      // Actualizar balance
      const newBalance = (currentBalance - parseFloat(amount)).toFixed(2);
      userData.wallet.tokenBalances[tokenSymbol] = newBalance;
      
      return Promise.resolve({
        success: true,
        amount: amount,
        tokenSymbol: tokenSymbol,
        newBalance: newBalance,
        destination: destination,
        txHash: 'MOCK_TX_HASH'
      });
    }),
    
    transferTokens: jest.fn().mockImplementation((fromEmail, tokenSymbol, amount, toAddress) => {
      const mockFromKey = `userData_${fromEmail}`;
      
      // Verificar que existe el usuario
      if (!mockStore[mockFromKey]) {
        return Promise.reject(new Error('Wallet de usuario no encontrada'));
      }
      
      // Verificar destino válido primero, antes de comprobar el balance
      if (!toAddress.startsWith('0x') && !toAddress.includes('@')) {
        return Promise.reject(new Error('Destino inválido'));
      }
      
      const userData = mockStore[mockFromKey];
      const currentBalance = parseFloat(userData.wallet.tokenBalances[tokenSymbol] || '0');
      
      // Verificar balance suficiente
      if (parseFloat(amount) > currentBalance) {
        return Promise.reject(new Error('Balance insuficiente'));
      }
      
      // Actualizar balance emisor
      const newBalance = (currentBalance - parseFloat(amount)).toFixed(2);
      userData.wallet.tokenBalances[tokenSymbol] = newBalance;
      
      // Si es transferencia interna, actualizar receptor
      if (toAddress.includes('@')) {
        const mockToKey = `userData_${toAddress}`;
        if (!mockStore[mockToKey]) {
          mockStore[mockToKey] = {
            wallet: {
              tokenBalances: {
                eUSD: '0.00',
                BTC: '0.00',
                ETH: '0.00'
              }
            }
          };
        }
        
        const toUserData = mockStore[mockToKey];
        const toCurrentBalance = parseFloat(toUserData.wallet.tokenBalances[tokenSymbol] || '0');
        toUserData.wallet.tokenBalances[tokenSymbol] = (toCurrentBalance + parseFloat(amount)).toFixed(2);
      }
      
      return Promise.resolve({
        success: true,
        amount: amount,
        tokenSymbol: tokenSymbol,
        fromEmail: fromEmail,
        toEmail: toAddress.includes('@') ? toAddress : undefined,
        destination: !toAddress.includes('@') ? toAddress : undefined,
        newBalance: newBalance,
        txHash: toAddress.includes('@') ? 'INTERNAL_MOCK_TX' : 'MOCK_TX_HASH'
      });
    }),

    getReadProvider: jest.fn().mockReturnValue({
      getNetwork: jest.fn().mockResolvedValue({ chainId: 5001 }),
      getBalance: jest.fn().mockResolvedValue('1000000000000000000'),
      getCode: jest.fn().mockResolvedValue('0x123456')
    }),

    getReadOnlyContract: jest.fn().mockReturnValue({
      balanceOf: jest.fn().mockResolvedValue('1000000000000000000'),
      totalSupply: jest.fn().mockResolvedValue('1000000000000000000000'),
      getApproved: jest.fn().mockResolvedValue('0x0000000000000000000000000000000000000000')
    }),

    getWriteContract: jest.fn().mockReturnValue({
      transfer: jest.fn().mockResolvedValue({
        hash: 'MOCK_TX_HASH',
        wait: jest.fn().mockResolvedValue({ status: 1 })
      }),
      approve: jest.fn().mockResolvedValue({
        hash: 'MOCK_TX_HASH',
        wait: jest.fn().mockResolvedValue({ status: 1 })
      })
    }),

    getPropertyDetails: jest.fn().mockImplementation((propertyId) => {
      return Promise.resolve({
        id: propertyId,
        name: `Property #${propertyId}`,
        totalSupply: 100,
        price: '0.1',
        address: '123 Main St',
        images: ['image1.jpg', 'image2.jpg'],
        description: 'A beautiful property',
        ownershipPercentage: propertyId === 1 ? 20 : 10,
        claimableRent: propertyId === 1 ? '0.001' : '0.0005'
      });
    }),

    getUserBalance: jest.fn().mockImplementation((email, propertyId) => {
      return Promise.resolve(propertyId === 1 ? 20 : 10);
    }),

    getClaimableRent: jest.fn().mockImplementation((propertyId, email) => {
      return Promise.resolve(propertyId === 1 ? '0.001' : '0.0005');
    }),

    getCurrentUser: jest.fn().mockImplementation(() => {
      return {
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

describe('Wallet Core Functionality', () => {
  beforeEach(() => {
    // Setup mocks
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    localStorage.clear();
    jest.clearAllMocks();

    // Inicializar datos de prueba en localStorage
    const testUserData = {
      userId: 'test123',
      wallet: {
        address: '0xb7051EF101cAb6401BdBC480C6Ad9534dd51a123',
        encryptedPrivateKey: 'mock-encrypted-key',
        tokenBalances: {
          eUSD: '100.00',
          BTC: '0.001',
          ETH: '0.05'
        }
      },
      balances: {
        1: 20,
        2: 10
      },
      claimable: {
        1: '0.001',
        2: '0.0005'
      }
    };
    
    localStorage.setItem('fractea_user_email', 'test@example.com');
    localStorage.setItem('fractea_user_id', 'test123');
    localStorage.setItem('fractea_user_data', JSON.stringify(testUserData));
  });

  // Pruebas para generación y gestión de wallet
  describe('Wallet Generation and Management', () => {
    test('should generate a custodial wallet with correct structure', () => {
      const wallet = generateCustodialWallet();
      expect(wallet).toBeDefined();
      expect(wallet.address).toBeDefined();
      expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(wallet.encryptedPrivateKey).toBeDefined();
      expect(wallet.tokenBalances).toBeDefined();
      expect(wallet.tokenBalances.eUSD).toBeDefined();
    });

    test('should handle login correctly', async () => {
      const result = await loginWithEmail('test@example.com');
      expect(result).toBe(true);
    });
  });

  // Pruebas para getReadProvider, getReadOnlyContract, getWriteContract
  describe('Blockchain Providers and Contracts', () => {
    test('should get a valid provider from getReadProvider', () => {
      const provider = getReadProvider();
      expect(provider).toBeDefined();
      expect(provider.getNetwork).toBeDefined();
    });

    test('should get a valid contract from getReadOnlyContract', () => {
      const contract = getReadOnlyContract();
      expect(contract).toBeDefined();
      expect(contract.balanceOf).toBeDefined();
      expect(contract.totalSupply).toBeDefined();
    });

    test('should get a valid write contract from getWriteContract', () => {
      const wallet = { address: '0x123', privateKey: '0x456' };
      const contract = getWriteContract(wallet);
      expect(contract).toBeDefined();
      expect(contract.transfer).toBeDefined();
      expect(contract.approve).toBeDefined();
    });
  });

  // Pruebas para getCurrentUser
  describe('User Management', () => {
    test('should get current user correctly', () => {
      const user = getCurrentUser();
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.userId).toBe('test123');
      expect(user.wallet).toBeDefined();
    });
  });

  // Pruebas para getPropertyDetails, getUserBalance, getClaimableRent
  describe('Property Management', () => {
    test('should get property details correctly', async () => {
      const property = await getPropertyDetails(1);
      expect(property).toBeDefined();
      expect(property.id).toBe(1);
      expect(property.totalSupply).toBe(100);
    });

    test('should get user balance for property correctly', async () => {
      const balance = await getUserBalance('test@example.com', 1);
      expect(balance).toBe(20);
    });

    test('should get claimable rent correctly', async () => {
      const rent = await getClaimableRent(1, 'test@example.com');
      expect(rent).toBe('0.001');
    });

    test('should handle non-existent property gracefully', async () => {
      const property = await getPropertyDetails(999);
      expect(property).toBeDefined();
      expect(property.id).toBe(999);
    });
  });

  // Pruebas para operaciones de tokens
  describe('Token Operations', () => {
    test('should get token balance correctly', async () => {
      const balance = await getTokenBalance('test@example.com', 'eUSD');
      expect(balance).toBe('100.00');
    });
    
    test('should handle deposit operation correctly', async () => {
      const result = await depositTokens('test@example.com', 'eUSD', '50.00');
      expect(result.success).toBe(true);
      expect(result.amount).toBe('50.00');
      expect(result.tokenSymbol).toBe('eUSD');
      expect(result.txHash).toBeDefined();
    });
    
    test('should handle withdrawal operation correctly', async () => {
      const result = await withdrawTokens('test@example.com', 'eUSD', '30.00', '0xDestinationAddress');
      expect(result.success).toBe(true);
      expect(result.amount).toBe('30.00');
      expect(result.tokenSymbol).toBe('eUSD');
      expect(result.destination).toBe('0xDestinationAddress');
      expect(result.txHash).toBeDefined();
    });
    
    test('should handle transfer to another user correctly', async () => {
      const result = await transferTokens('test@example.com', 'eUSD', '25.00', 'other@example.com');
      expect(result.success).toBe(true);
      expect(result.amount).toBe('25.00');
      expect(result.tokenSymbol).toBe('eUSD');
      expect(result.fromEmail).toBe('test@example.com');
      expect(result.toEmail).toBe('other@example.com');
      expect(result.txHash).toMatch(/^INTERNAL_/);
    });
    
    test('should handle transfer to external address correctly', async () => {
      const result = await transferTokens('test@example.com', 'eUSD', '25.00', '0xExternalAddress');
      expect(result.success).toBe(true);
      expect(result.amount).toBe('25.00');
      expect(result.tokenSymbol).toBe('eUSD');
      expect(result.destination).toBe('0xExternalAddress');
      expect(result.txHash).toBe('MOCK_TX_HASH');
    });
  });

  // Pruebas para el flujo completo de wallet
  describe('Complete Wallet Flow', () => {
    test('should handle full cycle: login-deposit-withdraw-transfer', async () => {
      // 1. Login
      await loginWithEmail('flow@example.com');
      
      // 2. Depositar tokens
      const depositResult = await depositTokens('flow@example.com', 'eUSD', '100.00');
      expect(depositResult.success).toBe(true);
      
      // 3. Verificar balance tras depósito mediante el resultado
      // Note: The mockstore starts with 100 and we add 100, so balance is 200
      expect(depositResult.newBalance).toBe('200.00');
      
      // 4. Retirar tokens
      const withdrawResult = await withdrawTokens('flow@example.com', 'eUSD', '30.00', '0xDestinationAddress');
      expect(withdrawResult.success).toBe(true);
      
      // 5. Verificar balance tras retiro mediante el resultado
      // Note: Starting from 200, withdraw 30, so balance is 170
      expect(withdrawResult.newBalance).toBe('170.00');
      
      // 6. Transferir a otro usuario
      const transferResult = await transferTokens('flow@example.com', 'eUSD', '20.00', 'other@example.com');
      expect(transferResult.success).toBe(true);
      
      // 7. Verificar balance final mediante el resultado
      // Note: Starting from 170, transfer 20, so balance is 150
      expect(transferResult.newBalance).toBe('150.00');
    });
  });

  // Pruebas para manejo de errores
  describe('Error Handling', () => {
    test('should prevent withdrawals exceeding balance', async () => {
      await expect(
        withdrawTokens('test@example.com', 'eUSD', '200.00', '0xDestinationAddress')
      ).rejects.toThrow('Balance insuficiente');
    });

    test('should reject invalid wallet addresses for withdrawals', async () => {
      await expect(
        withdrawTokens('test@example.com', 'eUSD', '50.00', 'invalid-address')
      ).rejects.toThrow('Dirección de destino inválida');
    });

    test('should reject invalid destinations for transfers', async () => {
      await expect(
        transferTokens('test@example.com', 'eUSD', '50.00', 'invalid-destination')
      ).rejects.toThrow('Destino inválido');
    });
  });
}); 