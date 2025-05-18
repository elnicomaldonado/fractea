import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getUserWallet } from '../../services/wallet/custodialWallet';
import { getNativeBalance } from '../../services/blockchain/mantleProvider';
import './WalletStats.css';

// Iconos SVG
const SendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ReceiveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 12H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 9V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SwapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 4L20 7L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 7H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 20L4 17L7 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 17H4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/**
 * Componente de acción para wallet
 */
const WalletAction = ({ icon, label, onClick }) => (
  <div className="wallet-action" onClick={onClick}>
    <div className="wallet-action-icon">
      {icon}
    </div>
    <span className="wallet-action-label">{label}</span>
  </div>
);

/**
 * Componente para mostrar balance de un token
 */
const TokenBalance = ({ symbol, balance, usdValue, iconUrl }) => (
  <div className="token-balance">
    <div className="token-icon">
      {iconUrl ? (
        <img src={iconUrl} alt={symbol} />
      ) : (
        <div className="token-icon-placeholder">{symbol.charAt(0)}</div>
      )}
    </div>
    <div className="token-info">
      <div className="token-name">{symbol}</div>
      <div className="token-network">Mantle Network</div>
    </div>
    <div className="token-amounts">
      <div className="token-amount">{balance} {symbol}</div>
      {usdValue && <div className="token-usd-value">${usdValue}</div>}
    </div>
  </div>
);

/**
 * Componente para mostrar dirección de wallet con opción de copia
 */
const WalletAddress = ({ address }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    // Mostrar notificación con toast
    toast.success('Dirección copiada al portapapeles', {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 6)}`;
  };

  return (
    <div className="wallet-address">
      <span className="address-label">Wallet Address:</span>
      <div className="address-value-container">
        <span className="address-value">{formatAddress(address)}</span>
        <button 
          onClick={handleCopy} 
          className="copy-button"
          aria-label="Copiar al portapapeles"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.3337 6H7.00033C6.26699 6 5.66699 6.6 5.66699 7.33333V13.6667C5.66699 14.4 6.26699 15 7.00033 15H13.3337C14.067 15 14.667 14.4 14.667 13.6667V7.33333C14.667 6.6 14.067 6 13.3337 6Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.00033 10H2.33366C1.97304 10 1.62718 9.85953 1.37714 9.60948C1.12709 9.35943 0.986328 9.01357 0.986328 8.65295V2.3133C0.986328 1.95267 1.12709 1.60681 1.37714 1.35677C1.62718 1.10672 1.97304 0.966553 2.33366 0.966553H8.67397C9.0346 0.966553 9.38045 1.10672 9.6305 1.35677C9.88055 1.60681 10.0207 1.95267 10.0207 2.3133V3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * Componente principal para estadísticas de wallet
 */
function WalletStats({ email, onSend, onReceive, onSwap }) {
  const [wallet, setWallet] = useState(null);
  const [nativeBalance, setNativeBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWalletData() {
      if (!email) return;

      try {
        setLoading(true);
        
        // Obtener datos de wallet
        const walletData = getUserWallet(email);
        
        if (walletData) {
          setWallet(walletData);
          
          // Obtener balance nativo (MNT)
          const balance = await getNativeBalance(walletData.address, 'TESTNET');
          setNativeBalance(balance);
        }
      } catch (error) {
        console.error('Error al cargar datos de wallet:', error);
        toast.error('Error al cargar datos de wallet', {
          position: "bottom-right",
        });
      } finally {
        setLoading(false);
      }
    }

    loadWalletData();
  }, [email]);

  // Manejar clics en acciones
  const handleSend = () => {
    if (onSend) onSend();
  };

  const handleReceive = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      toast.info(
        <div>
          <p>Dirección de recepción copiada:</p>
          <code style={{ display: 'block', marginTop: '5px', padding: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}>
            {wallet.address}
          </code>
        </div>,
        {
          position: "bottom-right",
          autoClose: 5000,
        }
      );
    }
    if (onReceive) onReceive();
  };

  const handleSwap = () => {
    toast.info('La función de Swap estará disponible próximamente', {
      position: "bottom-right",
    });
    if (onSwap) onSwap();
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="wallet-stats-loading">
        <div className="loading-spinner"></div>
        <span>Cargando datos de wallet...</span>
      </div>
    );
  }

  // Si no hay wallet
  if (!wallet) {
    return (
      <div className="wallet-stats-empty">
        <h3>No wallet found</h3>
        <p>There is no wallet associated with this account</p>
      </div>
    );
  }

  // Calcular balance total en USD (simulado para MVP)
  const usdcBalance = parseFloat(wallet.tokenBalances.USDC) || 0;
  const mntBalance = parseFloat(nativeBalance || 0);
  const mntPrice = 0.35; // Precio simulado de MNT en USD
  const totalUsdValue = usdcBalance + (mntBalance * mntPrice);

  return (
    <div className="wallet-stats">
      {/* Título y dirección */}
      <h2 className="wallet-title">Fractea Wallet</h2>
      <WalletAddress address={wallet.address} />
      
      {/* Balance total */}
      <div className="total-balance">
        <span className="total-label">Total Balance</span>
        <span className="total-value">${totalUsdValue.toFixed(2)}</span>
      </div>
      
      {/* Acciones rápidas */}
      <div className="wallet-actions">
        <WalletAction 
          icon={<SendIcon />} 
          label="Send" 
          onClick={handleSend} 
        />
        <WalletAction 
          icon={<ReceiveIcon />} 
          label="Receive" 
          onClick={handleReceive} 
        />
        <WalletAction 
          icon={<SwapIcon />} 
          label="Swap" 
          onClick={handleSwap} 
        />
      </div>
      
      {/* Lista de tokens */}
      <div className="token-list">
        <h3 className="token-list-title">Your Assets</h3>
        
        <TokenBalance 
          symbol="USDC" 
          balance={usdcBalance.toFixed(2)} 
          usdValue={usdcBalance.toFixed(2)}
          iconUrl="https://cryptologos.cc/logos/usd-coin-usdc-logo.png" 
        />
        
        <TokenBalance 
          symbol="MNT" 
          balance={mntBalance} 
          usdValue={(mntBalance * mntPrice).toFixed(2)}
          iconUrl="https://cryptologos.cc/logos/mantle-mnt-logo.png" 
        />
      </div>
      
      {/* Nota Web 2.5 */}
      <div className="web25-note">
        <p>Este es un wallet custodiado por Fractea que te brinda la simplicidad de Web2 con la transparencia de Web3.</p>
        <a href="/wallet/migrate" className="migrate-link">Conocer más opciones →</a>
      </div>
    </div>
  );
}

export default WalletStats; 