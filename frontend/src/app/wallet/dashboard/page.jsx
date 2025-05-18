'use client';

import React, { useState } from 'react';
import WalletStats from '../../../components/wallet/WalletStats';
import TransactionHistory from '../../../components/wallet/TransactionHistory';
import WalletActions from '../../../components/wallet/WalletActions';
import './dashboard.css';

/**
 * Página de dashboard para el wallet
 */
function WalletDashboardPage() {
  // Usuario simulado para MVP (en producción vendría de autenticación)
  const [userEmail] = useState('usuario@ejemplo.com');
  
  // Datos simulados del wallet
  const walletAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
  const tokens = [
    { symbol: 'eUSD', name: 'Mantle USD Stablecoin', balance: '1500.00' },
    { symbol: 'BTC', name: 'Bitcoin', balance: '0.002' },
    { symbol: 'ETH', name: 'Ethereum', balance: '0.5' }
  ];
  
  // Estado para manejar navegación entre subpáginas
  const [activePage, setActivePage] = useState('stats');
  
  // Estado para manejar vista detallada de transacción
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Handlers para acciones de wallet
  const handleSend = () => {
    console.log('Iniciar envío');
    // Implementar navegación a página de envío
  };
  
  const handleReceive = () => {
    console.log('Mostrar dirección para recibir');
    // Implementar modal o navegación a página de recepción
  };
  
  const handleSwap = () => {
    console.log('Iniciar swap');
    // Implementar navegación a página de swap
  };
  
  // Handler para click en transacción
  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    // En una implementación completa, navegar a la página de detalle de transacción
    console.log('Navegando a detalle de transacción:', transaction.hash);
  };
  
  return (
    <div className="wallet-dashboard">
      <div className="wallet-dashboard-header">
        <h1>Fractea Wallet</h1>
        
        {/* Navegación entre subpáginas */}
        <div className="dashboard-navigation">
          <button 
            className={`nav-button ${activePage === 'stats' ? 'active' : ''}`}
            onClick={() => setActivePage('stats')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-button ${activePage === 'transactions' ? 'active' : ''}`}
            onClick={() => setActivePage('transactions')}
          >
            Transactions
          </button>
        </div>
      </div>
      
      <div className="wallet-dashboard-content">
        {/* Mostrar componente activo según la navegación */}
        {activePage === 'stats' && (
          <div>
            <WalletStats 
              email={userEmail} 
              onSend={handleSend}
              onReceive={handleReceive}
              onSwap={handleSwap}
            />
            
            {/* Integrar componente de acciones del wallet */}
            <WalletActions 
              userEmail={userEmail}
              walletAddress={walletAddress}
              tokens={tokens}
            />
          </div>
        )}
        
        {activePage === 'transactions' && (
          <TransactionHistory 
            email={userEmail}
            onTransactionClick={handleTransactionClick}
          />
        )}
      </div>
      
      {/* Mostrar nota sobre Web 2.5 */}
      <div className="wallet-dashboard-footer">
        <div className="web25-explainer">
          <h3>¿Qué es Web 2.5?</h3>
          <p>
            Es un enfoque híbrido que combina la facilidad de uso de aplicaciones Web2 
            tradicionales con la transparencia y verificabilidad de Web3, permitiéndote 
            verificar tus transacciones en la blockchain Mantle.
          </p>
        </div>
      </div>
    </div>
  );
}

export default WalletDashboardPage; 