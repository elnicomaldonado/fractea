'use client';

import { useEffect, useState } from 'react';
import TransactionDetail from '../../../components/wallet/TransactionDetail';
import { getTransactionDetails } from '../../../services/wallet/custodialWallet';
import { checkTransactionStatus } from '../../../services/blockchain/mantleProvider';
import '../../../components/wallet/TransactionDetail.css';

// Ejemplo de transacción para demostración
const mockTransaction = {
  amount: '22.38',
  type: 'USDC Withdrawal',
  recipient: '0xa5a75B83C8d9528ee7ec7B',
  alias: 'nicomaldonado.eth',
  status: 'COMPLETED',
  hash: '0x40c8f97f',
  txId: '7ks78bzh',
  date: '2025-05-12T16:12:00.000Z',
  network: 'SEPOLIA',
  conversionRate: '1.00'
};

export default function TransactionPage({ params }) {
  const { txId } = params;
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTransaction() {
      try {
        setLoading(true);
        
        // En un entorno real, obtendríamos los detalles basados en el email del usuario actual
        // y el ID de transacción de la URL
        const currentUserEmail = localStorage.getItem('fractea_user_email') || 'demo@fractea.app';
        
        // Intentar obtener la transacción real primero
        let txDetails = getTransactionDetails(currentUserEmail, txId);
        
        // Si no la encontramos, usar el mock para demostración
        if (!txDetails) {
          console.log('Transacción no encontrada, usando mock para demostración');
          txDetails = { ...mockTransaction, txId };
        }
        
        // Si tenemos una transacción real de Mantle, verificar su estado actual
        if (txDetails.network === 'MANTLE' || txDetails.network === 'TESTNET' || txDetails.network === 'SEPOLIA') {
          try {
            const status = await checkTransactionStatus(txDetails.hash, txDetails.network);
            txDetails.status = status.status; // Actualizar con estado actual
          } catch (err) {
            console.warn('Error al verificar estado de transacción:', err);
            // Continuar con el estado almacenado
          }
        }
        
        setTransaction(txDetails);
      } catch (err) {
        console.error('Error al cargar detalles de transacción:', err);
        setError('No se pudo cargar la transacción. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    }
    
    loadTransaction();
  }, [txId]);

  if (loading) {
    return (
      <div className="transaction-page loading">
        <div className="loading-spinner"></div>
        <p>Cargando detalles de la transacción...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-page error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Intentar de nuevo</button>
      </div>
    );
  }

  return (
    <div className="transaction-page">
      <div className="back-button" onClick={() => window.history.back()}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 19L5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      <TransactionDetail transaction={transaction} />
    </div>
  );
} 