import React from 'react';
import { getTxExplorerUrl } from '../../services/blockchain/explorerService';

// Componentes auxiliares
const CopyButton = ({ text }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    // Aquí se podría agregar un toast o notificación
  };
  
  return (
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
  );
};

const DetailRow = ({ label, value, copyable = false }) => (
  <div className="detail-row">
    <span className="detail-label">{label}</span>
    <div className="detail-value-container">
      <span className="detail-value">{value}</span>
      {copyable && <CopyButton text={value} />}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'FAILED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className={`status-badge ${getStatusColor()}`}>
      {status === 'COMPLETED' && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {status}
    </div>
  );
};

const ShareButton = ({ transactionId, network }) => {
  const handleShare = () => {
    // Implementar lógica de compartir
    const url = getTxExplorerUrl(transactionId, network);
    
    if (navigator.share) {
      navigator.share({
        title: 'Transacción en Fractea',
        text: `Revisa mi transacción en Mantle: ${transactionId}`,
        url: url
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(url);
      // Mostrar notificación
    }
  };
  
  return (
    <button 
      onClick={handleShare}
      className="share-button"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5.33325C13.1046 5.33325 14 4.43782 14 3.33325C14 2.22868 13.1046 1.33325 12 1.33325C10.8954 1.33325 10 2.22868 10 3.33325C10 4.43782 10.8954 5.33325 12 5.33325Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 10.0001C5.10457 10.0001 6 9.10468 6 8.00011C6 6.89554 5.10457 6.00011 4 6.00011C2.89543 6.00011 2 6.89554 2 8.00011C2 9.10468 2.89543 10.0001 4 10.0001Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 14.6667C13.1046 14.6667 14 13.7713 14 12.6667C14 11.5621 13.1046 10.6667 12 10.6667C10.8954 10.6667 10 11.5621 10 12.6667C10 13.7713 10.8954 14.6667 12 14.6667Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.72656 9.00684L10.2799 11.6602" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.2732 4.33984L5.72656 6.99318" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Share
    </button>
  );
};

// Utilidades para formateo
const formatTruncatedAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 10)}...${address.substring(address.length - 7)}`;
};

const formatTruncatedHash = (hash) => {
  if (!hash) return '';
  return `${hash.substring(0, 6)}...${hash.substring(hash.length - 5)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  // Formato: May 12, 2023, 16:12
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Componente principal para mostrar detalles de una transacción
 */
function TransactionDetail({ transaction }) {
  if (!transaction) {
    return <div className="loading">Cargando detalles de transacción...</div>;
  }
  
  const {
    amount,
    type,
    to,
    recipient,
    alias,
    status,
    hash,
    date,
    network,
    conversionRate
  } = transaction;
  
  // Determinar la dirección del destinatario (to o recipient)
  const recipientAddress = to || recipient;
  
  // Obtener URL del explorador
  const explorerUrl = getTxExplorerUrl(hash, network);
  
  return (
    <div className="transaction-detail">
      {/* Ícono y monto */}
      <div className="transaction-icon">
        {type === 'USDC Withdrawal' && (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z" stroke="#FF00FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 10.5V21.5" stroke="#FF00FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11.5 16H20.5" stroke="#FF00FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      
      {/* Monto y tipo */}
      <h1 className="transaction-amount">${amount}</h1>
      <h2 className="transaction-type">{type}</h2>
      <p className="transaction-recipient">{alias}</p>
      
      {/* Badge de estado */}
      <StatusBadge status={status} />
      
      {/* Detalles */}
      <div className="transaction-details">
        <DetailRow 
          label="Recipient wallet" 
          value={formatTruncatedAddress(recipientAddress)} 
        />
        
        <DetailRow 
          label="Date" 
          value={formatDate(date)} 
        />
        
        <DetailRow 
          label="Network" 
          value={network || 'MANTLE'} 
        />
        
        <DetailRow 
          label="Conversion rate $1" 
          value={`${conversionRate || '1.00'} USDC`} 
        />
        
        <DetailRow 
          label="Alias" 
          value={alias || 'N/A'} 
        />
        
        <DetailRow 
          label="Transaction ID" 
          value={transaction.txId || formatTruncatedHash(hash)} 
        />
        
        <DetailRow 
          label="Transaction Hash" 
          value={formatTruncatedHash(hash)} 
          copyable={true} 
        />
      </div>
      
      {/* Link al explorador (opcional) */}
      <div className="explorer-link">
        <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
          Ver en explorador de Mantle
        </a>
      </div>
      
      {/* Botón de compartir */}
      <ShareButton transactionId={hash} network={network} />
    </div>
  );
}

export default TransactionDetail; 