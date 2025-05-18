import React, { useState } from 'react';
import { toast } from 'react-toastify';
import SendTokenModal from './SendTokenModal';
import { getAddressExplorerUrl } from '../../services/blockchain/explorerService';
import './WalletActions.css';

/**
 * Componente para manejar acciones de wallet custodial
 */
function WalletActions({ userEmail, walletAddress, tokens = [] }) {
  // Estado para controlar visibilidad de modales
  const [modalState, setModalState] = useState({
    sendToken: false,
    receiveToken: false,
  });

  // Tokens disponibles para enviar
  const availableTokens = tokens.length > 0 ? tokens : [
    { symbol: 'eUSD', name: 'Mantle USD Stablecoin' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' }
  ];

  // Acción para ver el wallet en explorer
  const handleViewInExplorer = () => {
    const explorerUrl = getAddressExplorerUrl(walletAddress, 'TESTNET');
    window.open(explorerUrl, '_blank');
  };

  // Abrir modal de enviar tokens
  const openSendModal = () => {
    setModalState({ ...modalState, sendToken: true });
  };

  // Cerrar modal de enviar tokens
  const closeSendModal = () => {
    setModalState({ ...modalState, sendToken: false });
  };

  // Mostrar información para recibir tokens
  const handleReceiveTokens = () => {
    // En una implementación completa, abriríamos un modal con QR
    // Por ahora, copiamos la dirección al portapapeles
    navigator.clipboard.writeText(walletAddress);
    
    // Usar toast en lugar de alert
    toast.info(
      <div>
        <p>Dirección copiada al portapapeles:</p>
        <code style={{ display: 'block', padding: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', fontSize: '12px', marginTop: '8px' }}>
          {walletAddress}
        </code>
      </div>,
      {
        position: "bottom-right",
        autoClose: 5000,
      }
    );
  };

  return (
    <div className="wallet-actions-container">
      <div className="main-actions">
        <button 
          className="action-button primary-action"
          onClick={openSendModal}
        >
          <span className="button-icon">↑</span>
          Enviar
        </button>
        
        <button 
          className="action-button primary-action"
          onClick={handleReceiveTokens}
        >
          <span className="button-icon">↓</span>
          Recibir
        </button>
        
        <button 
          className="action-button secondary-action"
          onClick={handleViewInExplorer}
        >
          <span className="button-icon">↗</span>
          Ver en Explorer
        </button>
      </div>

      <div className="web25-badge">
        <span className="badge-icon">✓</span>
        <span className="badge-text">Web 2.5 Compatible</span>
        <div className="badge-tooltip">
          <p>Este wallet combina la simplicidad de Web2 con la verificabilidad de Web3.</p>
          <p>Todas las transacciones son verificables en la blockchain Mantle.</p>
        </div>
      </div>
      
      {/* Modal para enviar tokens */}
      <SendTokenModal 
        isOpen={modalState.sendToken}
        onClose={closeSendModal}
        userEmail={userEmail}
        tokens={availableTokens}
      />
    </div>
  );
}

export default WalletActions; 