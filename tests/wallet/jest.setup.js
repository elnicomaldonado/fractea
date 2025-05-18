// Setup file for wallet testing
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock ethers library with v6 structure
jest.mock('ethers', () => {
  // Mock wallet instance
  const mockWalletInstance = {
    address: '0xb7051EF101cAb6401BdBC480C6Ad9534dd51a123',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    connect: jest.fn().mockReturnThis(),
    signTransaction: jest.fn().mockResolvedValue('0xsignedTransaction'),
    getAddress: jest.fn().mockReturnValue('0xb7051EF101cAb6401BdBC480C6Ad9534dd51a123')
  };
  
  // Mock transaction response
  const mockTxResponse = {
    hash: 'MOCK_TX_HASH',
    wait: jest.fn().mockResolvedValue({ status: 1 })
  };
  
  // Mock contract with methods
  const mockContract = {
    balanceOf: jest.fn().mockResolvedValue('1000000000000000000'),
    transfer: jest.fn().mockResolvedValue(mockTxResponse),
    approve: jest.fn().mockResolvedValue(mockTxResponse),
    transferFrom: jest.fn().mockResolvedValue(mockTxResponse),
    connect: jest.fn().mockReturnThis()
  };
  
  // Mock provider
  const mockProvider = {
    getBalance: jest.fn().mockResolvedValue('1000000000000000000'),
    getTransactionCount: jest.fn().mockResolvedValue(0),
    getGasPrice: jest.fn().mockResolvedValue('20000000000'),
    estimateGas: jest.fn().mockResolvedValue('21000'),
    call: jest.fn().mockResolvedValue('0x'),
    on: jest.fn(),
    removeListener: jest.fn()
  };
  
  // Create Wallet class with static methods (ethers v6 style)
  class WalletMock {
    constructor() {
      return mockWalletInstance;
    }
    
    static createRandom() {
      return mockWalletInstance;
    }
  }
  
  // Create v6 compatible ethers mock
  return {
    // v6 pattern where most things are directly exported
    Wallet: WalletMock,
    Contract: jest.fn().mockImplementation(() => mockContract),
    JsonRpcProvider: jest.fn().mockImplementation(() => mockProvider),
    BrowserProvider: jest.fn().mockImplementation(() => mockProvider),
    
    // Utilities in v6
    getBytes: jest.fn(val => new Uint8Array(32)),
    hexlify: jest.fn(val => '0x1234567890abcdef'),
    parseEther: jest.fn(val => BigInt(Math.floor(parseFloat(val) * 1e18))),
    formatEther: jest.fn(val => (Number(val) / 1e18).toString()),
    parseUnits: jest.fn((val, decimals = 18) => BigInt(Math.floor(parseFloat(val) * Math.pow(10, decimals)))),
    formatUnits: jest.fn((val, decimals = 18) => (Number(val) / Math.pow(10, decimals)).toString()),
    getAddress: jest.fn(address => address),
    isAddress: jest.fn(address => /^0x[a-fA-F0-9]{40}$/.test(address)),
    AbiCoder: {
      defaultAbiCoder: {
        encode: jest.fn(),
        decode: jest.fn()
      }
    }
  };
});

// Mock localStorage
global.localStorage = (function() {
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

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve())
  }
});

// Mock window.alert
global.alert = jest.fn();

// Mock window.confirm
global.confirm = jest.fn(() => true);

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
    text: () => Promise.resolve('')
  })
);

// Mock timeout functions
jest.useFakeTimers(); 