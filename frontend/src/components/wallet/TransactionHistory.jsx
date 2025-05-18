import React, { useState } from 'react';
import { getUserTransactions } from '../../services/wallet/custodialWallet';
import { getExplorerConfig } from '../../services/blockchain/mantleProvider';
import './TransactionHistory.css';

// Componentes auxiliares
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

// Utilidades de formateo
const formatTruncatedAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatAmount = (value) => {
  if (!value) return '0.00';
  return parseFloat(value).toFixed(2);
};

/**
 * Componente de transacción individual para el listado
 */
const TransactionItem = ({ transaction, onClick }) => {
  const { hash, to, from, value, timestamp, status, type, network } = transaction;
  
  const isReceived = to === from; // Lógica simplificada, mejorar según necesidad
  const transactionType = type || (isReceived ? 'Received' : 'Sent');
  
  return (
    <div className="transaction-item" onClick={() => onClick(transaction)}>
      <div className="transaction-item-icon">
        {isReceived ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3V21" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 14L12 21L19 14" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21V3" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 10L12 3L19 10" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      
      <div className="transaction-item-details">
        <div className="transaction-item-info">
          <span className="transaction-item-type">{transactionType}</span>
          <span className="transaction-item-address">{formatTruncatedAddress(to)}</span>
        </div>
        <div className="transaction-item-date">{formatDate(timestamp)}</div>
      </div>
      
      <div className="transaction-item-right">
        <div className="transaction-item-amount">
          {isReceived ? '+' : '-'}${formatAmount(value)}
        </div>
        <StatusBadge status={status} />
      </div>
    </div>
  );
};

/**
 * Componente de filtros para transacciones
 */
const TransactionFilters = ({ onFilterChange, filters }) => {
  return (
    <div className="transaction-filters">
      <div className="filter-dropdown">
        <select 
          value={filters.status} 
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
        >
          <option value="">All statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>
      
      <div className="filter-dropdown">
        <select 
          value={filters.type} 
          onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
        >
          <option value="">All types</option>
          <option value="Sent">Sent</option>
          <option value="Received">Received</option>
        </select>
      </div>
    </div>
  );
};

/**
 * Componente principal del historial de transacciones
 */
function TransactionHistory({ email, onTransactionClick }) {
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;
  
  // Obtener transacciones del usuario
  const transactions = getUserTransactions(email) || [];
  
  // Aplicar filtros
  const filteredTransactions = transactions.filter(tx => {
    if (filters.status && tx.status !== filters.status) return false;
    
    // Determinar tipo de transacción
    const txType = tx.type || (tx.to === tx.from ? 'Received' : 'Sent');
    if (filters.type && txType !== filters.type) return false;
    
    return true;
  });
  
  // Calcular paginación
  const indexOfLastTx = currentPage * transactionsPerPage;
  const indexOfFirstTx = indexOfLastTx - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTx, indexOfLastTx);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  
  // Manejar cambio de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Si no hay transacciones, mostrar mensaje
  if (transactions.length === 0) {
    return (
      <div className="transaction-history-empty">
        <div className="empty-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M24 16V24" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M24 32H24.01" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3>No transactions yet</h3>
        <p>Your transaction history will appear here</p>
      </div>
    );
  }
  
  return (
    <div className="transaction-history">
      <h2 className="transaction-history-title">Transaction History</h2>
      
      {/* Filtros */}
      <TransactionFilters 
        onFilterChange={setFilters}
        filters={filters}
      />
      
      {/* Lista de transacciones */}
      <div className="transaction-list">
        {currentTransactions.map((tx) => (
          <TransactionItem 
            key={tx.hash} 
            transaction={tx}
            onClick={() => onTransactionClick && onTransactionClick(tx)}
          />
        ))}
      </div>
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="transaction-pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Prev
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default TransactionHistory; 