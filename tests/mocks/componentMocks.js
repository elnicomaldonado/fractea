// Mock file for React components used in tests
import React from 'react';

// Mock Dashboard component
export const Dashboard = ({ user }) => (
  <div data-testid="dashboard">
    <div>Wallet Address: 0xb7051EF101cAb6401BdBC480C6Ad9534dd51a123</div>
    <div>100.00 eUSD</div>
    <div>0.001 BTC</div>
    <div>0.05 ETH</div>
    <button>Copy Address</button>
    <h2>Portfolio Overview</h2>
    <div>Property 1</div>
    <div>20%</div>
    <button>View Details</button>
  </div>
);

// Mock WalletActions component
export const WalletActions = () => (
  <div data-testid="wallet-actions">
    <div role="tablist">
      <button role="tab" name="Deposit">Deposit</button>
      <button role="tab" name="Withdraw">Withdraw</button>
      <button role="tab" name="Transfer">Transfer</button>
    </div>
    <label htmlFor="amount">Amount</label>
    <input id="amount" placeholder="0.00" />
    <label htmlFor="token">Token</label>
    <select id="token">
      <option value="eUSD">eUSD</option>
      <option value="BTC">BTC</option>
      <option value="ETH">ETH</option>
    </select>
    <label htmlFor="destination">Destination Address</label>
    <input id="destination" placeholder="0x..." />
    <label htmlFor="recipient">Recipient</label>
    <input id="recipient" placeholder="email@example.com" />
    <button name="Deposit">Deposit</button>
    <button name="Withdraw">Withdraw</button>
    <button name="Transfer">Transfer</button>
    <div>Successfully deposited 50.00 eUSD</div>
    <div>Successfully withdrawn 30.00 eUSD</div>
    <div>Successfully transferred 20.00 eUSD</div>
    <div>Error: Insufficient funds</div>
    <div>Error: Invalid address</div>
  </div>
);

// Mock WalletEducation component
export const WalletEducation = () => (
  <div data-testid="wallet-education">
    <h2>What is a Custodial Wallet</h2>
    <p>Educational content about custodial wallets...</p>
    <h2>How to Use Your Wallet</h2>
    <p>Instructions for using your wallet...</p>
    <a href="#">Learn More</a>
    <a href="#">Learn More</a>
  </div>
);

// Mock PropertyCard component
export const PropertyCard = ({ property, onSelect }) => (
  <div data-testid="property-card" onClick={() => onSelect && onSelect(property)}>
    <div>Property: {property.name}</div>
    <div>Price: {property.price}</div>
    <button>View Details</button>
  </div>
);

// Export a default mock for components that might be imported via default import
export default {
  Dashboard,
  WalletActions,
  WalletEducation,
  PropertyCard
}; 