import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import Dashboard from '../../frontend/src/components/Dashboard';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve())
  }
});

// Mock blockchain utils
jest.mock('../../frontend/src/utils/blockchain', () => ({
  depositTokens: jest.fn().mockResolvedValue({
    success: true,
    amount: '50.00',
    tokenSymbol: 'eUSD',
    newBalance: '150.00',
    txHash: '0x123456789'
  }),
  withdrawTokens: jest.fn().mockResolvedValue({
    success: true,
    amount: '50.00',
    tokenSymbol: 'eUSD',
    newBalance: '50.00',
    destination: '0xDestination1234567890',
    txHash: '0x123456789'
  }),
  loginWithEmail: jest.fn().mockResolvedValue(true)
}));

// Mock React components
jest.mock('../../frontend/src/components/WalletActions', () => ({
  __esModule: true,
  default: ({ user, onActionComplete }) => (
    <div data-testid="wallet-actions">
      <div>Añadir fondos</div>
      <div>Token</div>
      <div>Monto</div>
      <button>Retirar</button>
      <input placeholder="0.00" />
      <input placeholder="0x..." />
      <button>Añadir fondos</button>
      <button>Retirar fondos</button>
    </div>
  )
}));

jest.mock('../../frontend/src/components/WalletEducation', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="wallet-education">
      <h2>Introducción a Wallets</h2>
      <p>Información educativa sobre wallets...</p>
    </div>
  )
}));

describe('Dashboard Wallet Display Tests', () => {
  const mockUser = {
    email: 'test@example.com',
    userId: 'user_123',
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
      1: 5,
      2: 3
    },
    claimable: {
      1: '0.0002',
      2: '0.0001'
    }
  };

  test('renders wallet address correctly', () => {
    render(<Dashboard user={mockUser} />);
    
    // Check wallet address is displayed properly
    expect(screen.getByText(/0xb7051EF101cAb6401BdBC480C6Ad9534dd51a123/)).toBeInTheDocument();
  });

  test('displays all token balances', () => {
    render(<Dashboard user={mockUser} />);
    
    // Check that all token balances are displayed
    expect(screen.getByText('eUSD')).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('ETH')).toBeInTheDocument();
    
    // Check the values
    expect(screen.getByText('100.00')).toBeInTheDocument();
    expect(screen.getByText('0.001')).toBeInTheDocument();
    expect(screen.getByText('0.05')).toBeInTheDocument();
  });

  test('copies wallet address to clipboard when copy button is clicked', async () => {
    render(<Dashboard user={mockUser} />);
    
    // Find and click the copy button (might be by aria-label or icon)
    const copyButton = screen.getByLabelText('Copiar dirección') || 
                      screen.getByRole('button', { name: /copiar/i });
    fireEvent.click(copyButton);
    
    // Verify clipboard was called with correct address
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockUser.wallet.address);
    });
    
    // Check for confirmation message
    expect(screen.getByText('Dirección copiada')).toBeInTheDocument();
  });

  test('opens wallet actions when deposit button is clicked', async () => {
    render(<Dashboard user={mockUser} />);
    
    // Find and click the deposit button
    const depositButton = screen.getByText('Depositar');
    fireEvent.click(depositButton);
    
    // Verify wallet actions panel is opened with deposit tab active
    await waitFor(() => {
      expect(screen.getByText('Añadir fondos')).toBeInTheDocument();
    });
  });

  test('opens wallet actions when withdraw button is clicked', async () => {
    render(<Dashboard user={mockUser} />);
    
    // Find and click the withdraw button
    const withdrawButton = screen.getByText('Retirar');
    fireEvent.click(withdrawButton);
    
    // Verify wallet actions panel is opened with withdraw tab active
    await waitFor(() => {
      expect(screen.getByText('Retirar fondos')).toBeInTheDocument();
    });
  });

  test('handles wallet refresh after deposit action', async () => {
    // Setup mock update function
    const setUser = jest.fn();
    
    render(<Dashboard user={mockUser} setUser={setUser} />);
    
    // Find and click the deposit button
    const depositButton = screen.getByText('Depositar');
    fireEvent.click(depositButton);
    
    // Fill out deposit form
    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '50.00' } });
    
    // Submit form
    const submitButton = screen.getByText('Añadir fondos');
    fireEvent.click(submitButton);
    
    // Check success message appears
    await waitFor(() => {
      expect(screen.getByText('Has depositado 50.00 eUSD a tu wallet custodial')).toBeInTheDocument();
    });
    
    // Verify user state would be updated (mock function called)
    expect(setUser).toHaveBeenCalled();
  });

  test('handles wallet refresh after withdraw action', async () => {
    // Setup mock update function
    const setUser = jest.fn();
    
    render(<Dashboard user={mockUser} setUser={setUser} />);
    
    // Find and click the withdraw button
    const withdrawButton = screen.getByText('Retirar');
    fireEvent.click(withdrawButton);
    
    // Fill out withdraw form
    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '50.00' } });
    
    const destinationInput = screen.getByPlaceholderText('0x...');
    fireEvent.change(destinationInput, { target: { value: '0xDestination1234567890' } });
    
    // Submit form
    const submitButton = screen.getByText('Retirar fondos');
    fireEvent.click(submitButton);
    
    // Check success message appears
    await waitFor(() => {
      expect(screen.getByText(/Has retirado 50.00 eUSD a la dirección externa/)).toBeInTheDocument();
    });
    
    // Verify user state would be updated (mock function called)
    expect(setUser).toHaveBeenCalled();
  });

  test('handles wallet education tab display', () => {
    render(<Dashboard user={mockUser} />);
    
    // Find and click the education button (if it exists)
    const educationButton = screen.getByText('Información sobre Wallets') || 
                           screen.getByRole('button', { name: /información/i });
    fireEvent.click(educationButton);
    
    // Verify education panel is displayed
    expect(screen.getByText('Introducción a Wallets')).toBeInTheDocument();
  });

  test('handles case when user has no wallet yet', () => {
    // Create user without wallet
    const userWithoutWallet = { ...mockUser, wallet: null };
    
    render(<Dashboard user={userWithoutWallet} />);
    
    // Should display a message about no wallet and a setup button
    expect(screen.getByText(/No tienes una wallet configurada/i)).toBeInTheDocument();
    
    // Should have a button to set up wallet
    const setupButton = screen.getByText(/Configurar Wallet/i);
    expect(setupButton).toBeInTheDocument();
  });
}); 