import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { signAndSendTransaction } from '../../services/wallet/custodialWallet';
import { getTxExplorerUrl } from '../../services/blockchain/explorerService';
import './SendTokenModal.css';

/**
 * Modal para enviar tokens desde la wallet custodial
 */
function SendTokenModal({ isOpen, onClose, userEmail, tokens = [] }) {
  // Estados para el formulario
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState(tokens[0]?.symbol || 'USDC');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [txResult, setTxResult] = useState(null);

  // Resetear el formulario
  const resetForm = () => {
    setRecipient('');
    setAmount('');
    setError('');
    setTxResult(null);
  };

  // Efecto para debugging - registro de cambios en txResult
  useEffect(() => {
    if (txResult) {
      console.log('Estado de transacción actualizado:', txResult);
    }
  }, [txResult]);

  // Validar formulario
  const validateForm = () => {
    if (!recipient) {
      setError('La dirección del destinatario es obligatoria');
      return false;
    }

    if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('La dirección del destinatario no es válida');
      return false;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('El monto debe ser un número positivo');
      return false;
    }

    return true;
  };

  // Manejar envío de formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    console.log('Iniciando transacción hacia:', recipient);
    
    // ID para el toast de carga (sin mostrar notificaciones redundantes)
    const loadingToastId = toast.loading(
      "Procesando transacción en Mantle...", 
      { position: "bottom-right" }
    );
    
    try {
      // Crear objeto de transacción
      const transaction = {
        to: recipient,
        value: ethers.parseEther(amount),
        data: '0x', // No se incluyen datos adicionales para transferencias simples
      };
      
      console.log('Enviando transacción...', transaction);
      
      // Llamar al servicio para firmar y enviar la transacción
      const result = await signAndSendTransaction(userEmail, transaction, 'SEPOLIA');
      
      console.log('Transacción completada con éxito:', result);
      
      // Configurar resultado para mostrar en UI
      setTxResult({
        txHash: result.txHash,
        status: 'COMPLETED',
        explorerUrl: getTxExplorerUrl(result.txHash, 'SEPOLIA')
      });
      
      // Limpiar campos después de éxito
      setRecipient('');
      setAmount('');
      
      // NOTIFICACIÓN PRINCIPAL DE TRANSACCIÓN EXITOSA - Clara y específica
      toast.dismiss(loadingToastId); // Eliminar notificación de carga
      
      toast.success(
        <div style={{fontSize: "14px"}}>
          <div style={{fontWeight: "bold", marginBottom: "8px", fontSize: "16px"}}>
            ¡Transacción Exitosa!
          </div>
          <div style={{marginBottom: "8px"}}>
            Se han enviado <strong>{amount} {selectedToken}</strong> a:
            <div style={{fontSize: "12px", opacity: 0.8, marginTop: "4px"}}>
              {recipient.substring(0, 8)}...{recipient.substring(recipient.length - 6)}
            </div>
          </div>
          <a 
            href={getTxExplorerUrl(result.txHash, 'SEPOLIA')}
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#61dafb', textDecoration: 'underline', fontWeight: "bold", fontSize: "12px" }}
          >
            Ver detalles en el explorador →
          </a>
        </div>,
        {
          position: "bottom-right",
          autoClose: 7000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: "transaction-success-toast"
        }
      );
      
    } catch (error) {
      console.error('Error al enviar transacción:', error);
      
      // Extraer mensaje de error relevante
      let errorMessage = error.message || 'Error al procesar la transacción';
      
      // Formateo especial para errores de gas
      if (errorMessage.includes('intrinsic gas too low')) {
        errorMessage = 'Error: Gas insuficiente para la transacción. Intente con un monto mayor o contacte soporte.';
      } 
      // Formateo para errores de fondos insuficientes
      else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Error: Fondos insuficientes para completar la transacción.';
      }
      
      setError(errorMessage);
      
      setTxResult({
        status: 'ERROR',
        message: errorMessage
      });
      
      // Eliminar toast de carga y mostrar error
      toast.dismiss(loadingToastId);
      
      // Notificación de error clara
      toast.error(
        <div>
          <strong>Error en la transacción</strong>
          <p style={{fontSize: "13px", marginTop: "6px"}}>{errorMessage}</p>
        </div>, 
        {
          position: "bottom-right",
          autoClose: 5000
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="send-token-modal">
        <div className="modal-header">
          <h2>Enviar {selectedToken}</h2>
          <button 
            onClick={() => {
              resetForm();
              onClose();
            }} 
            className="close-button"
          >
            &times;
          </button>
        </div>
        
        {txResult && txResult.status === 'COMPLETED' ? (
          <div className="tx-success" style={{ padding: '20px', textAlign: 'center', backgroundColor: 'rgba(0, 200, 83, 0.1)', borderRadius: '8px' }}>
            <div className="success-icon" style={{ fontSize: '48px', color: '#00C853' }}>✓</div>
            <h3 style={{ color: '#00C853', margin: '10px 0' }}>¡Transacción exitosa!</h3>
            <p>Tu transacción ha sido procesada correctamente.</p>
            <div className="tx-details" style={{ margin: '15px 0', padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '6px' }}>
              <div className="tx-hash">
                <span>Hash de transacción:</span>
                <code>{txResult.txHash.substring(0, 10)}...{txResult.txHash.substring(txResult.txHash.length - 8)}</code>
              </div>
              <a 
                href={txResult.explorerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="explorer-link"
                style={{ display: 'block', marginTop: '10px', color: '#1E88E5', textDecoration: 'none', fontWeight: 'bold' }}
              >
                Ver en explorador
              </a>
            </div>
            <button 
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="action-button"
              style={{ backgroundColor: '#00C853', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="token">Token</label>
              <select 
                id="token"
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="token-select"
              >
                {tokens.map(token => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="recipient">Dirección del destinatario</label>
              <input 
                type="text"
                id="recipient"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="text-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="amount">Monto</label>
              <div className="amount-input-container">
                <input 
                  type="text"
                  id="amount"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="amount-input"
                />
                <span className="token-symbol">{selectedToken}</span>
              </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="web25-note">
              <p>Esta transacción será firmada automáticamente por Fractea usando tu wallet custodial y registrada en la blockchain de Mantle Sepolia.</p>
            </div>
            
            <div className="modal-actions">
              <button 
                type="button" 
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="cancel-button"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : 'Enviar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default SendTokenModal; 