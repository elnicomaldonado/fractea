import { useState, useRef, useEffect } from 'react';
import { depositTokens, withdrawTokens, syncWalletBalance } from '../utils/blockchain';
import { getTxExplorerUrl, getAddressExplorerUrl } from '../services/blockchain/explorerService';
import QRCode from 'react-qr-code';

export default function WalletActions({ user, onActionComplete }) {
  const [activeTab, setActiveTab] = useState('deposit'); // 'deposit' o 'withdraw'
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('MNT'); // Cambiado el token por defecto a MNT para Mantle
  const [destination, setDestination] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [realBalances, setRealBalances] = useState({});
  const addressRef = useRef(null);
  
  // Lista de tokens soportados, ahora con MNT primero
  const supportedTokens = ['MNT', 'eUSD', 'BTC', 'ETH'];
  
  // Sincronizar los balances al cargar el componente
  useEffect(() => {
    if (user?.email) {
      handleSyncBalance();
    }
  }, [user?.email]);
  
  // Función para copiar la dirección al portapapeles
  const copyAddressToClipboard = () => {
    if (addressRef.current) {
      addressRef.current.select();
      document.execCommand('copy');
      // Desseleccionar el texto
      window.getSelection().removeAllRanges();
      // Mostrar feedback temporal
      const tempSuccess = {
        message: "¡Dirección copiada al portapapeles!",
        isAddress: true
      };
      setSuccess(tempSuccess);
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => {
        if (success && success.isAddress) {
          setSuccess(null);
        }
      }, 3000);
    }
  };
  
  // Función para sincronizar balance con blockchain
  const handleSyncBalance = async () => {
    setIsSyncing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await syncWalletBalance(user.email);
      
      // Guardar los balances reales para usarlos en validaciones
      setRealBalances(result.tokenBalances);
      
      setSuccess({
        message: `Balance sincronizado correctamente con la blockchain. Balance actual: ${result.tokenBalances['MNT'] || '0'} MNT`,
        isBalanceSync: true
      });
      
      // Notificar al componente padre para actualizar la UI
      if (onActionComplete) {
        onActionComplete('sync', result);
      }
    } catch (err) {
      setError('Error al sincronizar balance: ' + (err.message || 'Error desconocido'));
      console.error('Error al sincronizar balance:', err);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Manejar depósito simulado con tarjeta de crédito
  const handleCardDeposit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Por favor, ingresa un monto válido');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Realizar depósito simulado
      const result = await depositTokens(user.email, token, amount);
      
      setSuccess({
        message: `Has comprado ${amount} ${token} con tu tarjeta (simulado)`,
        txHash: result.txHash,
        isBlockchain: false
      });
      
      // Limpiar el formulario
      setAmount('');
      setShowCardForm(false);
      
      // Notificar al componente padre
      if (onActionComplete) {
        onActionComplete('deposit', result);
      }
    } catch (err) {
      setError('Error en la transacción con tarjeta: ' + (err.message || 'Error desconocido'));
      console.error('Error en depósito con tarjeta:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manejar retiro de fondos
  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Por favor, ingresa un monto válido');
      return;
    }
    
    if (!destination) {
      setError('Por favor, ingresa una dirección de destino');
      return;
    }
    
    // Validar dirección si es de blockchain
    if (destination !== 'bank' && !destination.startsWith('0x')) {
      setError('Por favor, ingresa una dirección de wallet válida comenzando con 0x');
      return;
    }
    
    // Sincronizar balances antes de la operación para asegurar datos reales
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      // Sincronizar primero si es una transacción blockchain
      if (destination.startsWith('0x')) {
        await handleSyncBalance();
        
        // Verificar si hay fondos suficientes según el balance real
        const realBalance = parseFloat(realBalances[token] || '0');
        const withdrawAmount = parseFloat(amount);
        
        if (realBalance < withdrawAmount) {
          setError(`Balance insuficiente. Tienes ${realBalance} ${token} en la blockchain, pero intentas retirar ${withdrawAmount} ${token}.`);
          setIsLoading(false);
          return;
        }
      }
      
      const result = await withdrawTokens(user.email, token, amount, destination);
      
      // Detectar si fue una transacción blockchain real
      const isBlockchainTx = result.network === 'SEPOLIA';
      
      const message = isBlockchainTx 
        ? `Has retirado ${amount} ${token} a la dirección externa. Transacción confirmada en bloque #${result.blockNumber}.`
        : `Has retirado ${amount} ${token} ${destination === 'bank' ? 'a tu cuenta bancaria' : 'a la dirección externa'}`;
      
      setSuccess({
        message,
        txHash: result.txHash,
        explorerUrl: isBlockchainTx ? getTxExplorerUrl(result.txHash, 'SEPOLIA') : null,
        isBlockchain: isBlockchainTx
      });
      
      // Limpiar el formulario
      setAmount('');
      setDestination('');
      
      // Notificar al componente padre
      if (onActionComplete) {
        onActionComplete('withdraw', result);
      }
      
      // Sincronizar nuevamente para actualizar balances después de la operación
      if (isBlockchainTx) {
        await handleSyncBalance();
      }
    } catch (err) {
      // Formatear mensajes de error para mejor UX
      let errorMsg = err.message || 'Error al procesar el retiro';
      
      if (errorMsg.includes('intrinsic gas too low')) {
        errorMsg = 'Gas insuficiente para procesar la transacción. Necesitas MNT para pagar las comisiones de la red. Visita https://faucet.sepolia.mantle.xyz para obtener MNT gratuito.';
      } else if (errorMsg.includes('insufficient funds')) {
        errorMsg = 'Fondos insuficientes para completar la transacción y pagar las comisiones. Visita https://faucet.sepolia.mantle.xyz para obtener MNT gratuito.';
      } else if (errorMsg.includes('failed to forward tx to sequencer')) {
        errorMsg = 'Error de red en Mantle: La transacción fue rechazada por el sequencer. Estamos trabajando para aumentar el límite de gas automáticamente. Por favor, inténtalo de nuevo en unos momentos.';
      } else if (errorMsg.includes('provider.getGasPrice is not a function')) {
        errorMsg = 'Error técnico: Problema al estimar el gas. Por favor, inténtalo de nuevo.';
      } else if (errorMsg.includes('Se necesita aproximadamente')) {
        // Este error ya viene formateado desde la función de blockchain
        // No hacer nada, mantener el mensaje como está
      } else if (errorMsg.includes('Error en transacción blockchain')) {
        // Extraer el mensaje de error más específico si existe
        const parts = errorMsg.split('Error en transacción blockchain: ');
        errorMsg = parts.length > 1 
          ? `Error en la blockchain: ${parts[1]}` 
          : 'Error al procesar la transacción en la blockchain.';
      } else if (errorMsg.includes('La clave privada no corresponde')) {
        errorMsg = 'Error de configuración: La wallet demo requiere sincronización. Por favor contacte al soporte técnico o use Faucet para obtener tokens reales de prueba.';
      } else if (errorMsg.includes('Balance insuficiente')) {
        // Si es un error de balance insuficiente, añadir información sobre cómo obtener tokens de prueba
        errorMsg = `${errorMsg} Para obtener tokens de prueba, visite el faucet oficial de Mantle Sepolia: https://faucet.sepolia.mantle.xyz`;
      }
      
      setError(errorMsg);
      console.error('Error en retiro:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generar un QR
  const generateQRPlaceholder = (address) => {
    return (
      <div className="mx-auto w-40 h-40 p-2 bg-white">
        <QRCode 
          value={address}
          size={150}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          viewBox={`0 0 256 256`}
        />
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Banner de sincronización de balances */}
      <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
        <div className="flex items-center">
          <svg className="h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="text-blue-700 text-sm">
            Para asegurar transacciones blockchain exitosas, sincroniza tus balances primero.
          </span>
        </div>
        <button
          onClick={handleSyncBalance}
          disabled={isSyncing}
          className={`ml-3 ${isSyncing ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'} text-white px-3 py-1 rounded-md text-sm font-medium`}
        >
          {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
        </button>
      </div>
      
      {/* Tabs de navegación */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-3 px-4 text-center font-medium text-sm rounded-tl-lg ${
            activeTab === 'deposit'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-50 text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('deposit')}
        >
          Añadir fondos
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center font-medium text-sm rounded-tr-lg ${
            activeTab === 'withdraw'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-50 text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('withdraw')}
        >
          Retirar fondos
        </button>
      </div>
      
      <div className="p-6">
        {/* Mensajes de error o éxito */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="font-medium text-green-800">{success.message}</p>
                {success.txHash && !success.isAddress && (
                  <div className="mt-2 text-sm">
                    <div className="flex flex-col space-y-1">
                      <p className="text-green-700">
                        <span className="font-medium">ID de Transacción:</span>{' '}
                        <code className="bg-green-100 px-1 py-0.5 rounded text-green-800">
                          {success.txHash.substring(0, 10)}...{success.txHash.substring(success.txHash.length - 8)}
                        </code>
                      </p>
                      
                      {success.isBlockchain && success.explorerUrl && (
                        <div className="flex items-center">
                          <a 
                            href={success.explorerUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 underline flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                            Ver detalles en explorador de Mantle
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Formularios según tab activo */}
        {activeTab === 'deposit' ? (
          <div>
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-4">Añadir fondos a tu wallet</h3>
              
              {/* Opciones de depósito */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  className="bg-white border border-gray-300 hover:bg-gray-50 rounded-lg p-4 text-left flex flex-col justify-between transition-colors"
                  onClick={() => setShowCardForm(true)}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-800">Tarjeta de crédito</h4>
                  </div>
                  <p className="text-gray-500 text-sm">Compra cripto con tu tarjeta de crédito o débito</p>
                </button>
                
                <button
                  className="bg-white border border-gray-300 hover:bg-gray-50 rounded-lg p-4 text-left flex flex-col justify-between transition-colors"
                  onClick={() => setShowCardForm(false)}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-800">Depósito blockchain</h4>
                  </div>
                  <p className="text-gray-500 text-sm">Envía fondos desde otra wallet blockchain</p>
                </button>
              </div>
              
              {/* Formulario de compra con tarjeta */}
              {showCardForm ? (
                <form onSubmit={handleCardDeposit} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4">Comprar con tarjeta</h4>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Token a comprar
                    </label>
                    <select
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {supportedTokens.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Cantidad a comprar
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Ej: 0.1"
                      step="0.0001"
                      min="0.0001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isLoading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    {isLoading ? 'Procesando...' : 'Comprar tokens (simulado)'}
                  </button>
                  
                  <p className="mt-2 text-xs text-gray-500">
                    Nota: Esta es una simulación. En producción se integraría con un proveedor de pagos real.
                  </p>
                </form>
              ) : (
                // UI para recibir fondos blockchain
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4">Recibir fondos via blockchain</h4>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Tu dirección de wallet
                    </label>
                    <div className="flex">
                      <input
                        ref={addressRef}
                        type="text"
                        readOnly
                        value={user?.wallet?.address || ''}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={copyAddressToClipboard}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      QR de tu dirección
                    </label>
                    {user?.wallet?.address ? (
                      <div className="flex justify-center">
                        {generateQRPlaceholder(user.wallet.address)}
                      </div>
                    ) : (
                      <p className="text-red-500 text-sm">Dirección de wallet no disponible.</p>
                    )}
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 text-sm text-yellow-800">
                    <p className="font-medium mb-1">Importante:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Solo envía fondos desde la red Mantle Sepolia</li>
                      <li>Envía solo MNT, eUSD u otros tokens soportados</li>
                      <li>Después de enviar fondos, haz clic en "Sincronizar Balance" para ver tu balance actualizado</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-4">Retirar fondos de tu wallet</h3>
              
              <form onSubmit={handleWithdraw}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Token a retirar
                  </label>
                  <div className="flex items-center">
                    <select
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    >
                      {supportedTokens.map((t) => (
                        <option key={t} value={t}>
                          {t} - Balance: {realBalances[t] || user.wallet?.tokenBalances?.[t] || '0.00'}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleSyncBalance}
                      disabled={isSyncing}
                      className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center"
                    >
                      {isSyncing ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7.805v2.205a1 1 0 01-2 0V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13.5v-2.5a1 1 0 012 0v3.975a1 1 0 01-1 1H5.001a1 1 0 0100-2h.008z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Cantidad a retirar
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ej: 0.1"
                    step="0.0001"
                    min="0.0001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Destino
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setDestination('bank')}
                      className={`py-2 px-4 rounded-md text-sm font-medium ${
                        destination === 'bank'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Cuenta bancaria
                    </button>
                    <button
                      type="button"
                      onClick={() => setDestination(destination !== 'bank' ? destination : '')}
                      className={`py-2 px-4 rounded-md text-sm font-medium ${
                        destination !== 'bank' && destination
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Dirección blockchain
                    </button>
                  </div>
                  
                  {destination !== 'bank' && (
                    <input
                      type="text"
                      value={destination || ''}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isLoading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {isLoading ? 'Procesando...' : 'Retirar fondos'}
                </button>
                
                <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-md p-3 text-sm text-yellow-800">
                  <p className="font-medium mb-1">Notas importantes:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Los retiros a cuentas bancarias son simulados para este MVP</li>
                    <li>Los retiros a direcciones blockchain son transacciones reales en Mantle Sepolia</li>
                    <li>Asegúrate de tener fondos suficientes antes de realizar un retiro</li>
                    <li>Para transacciones blockchain, usa el botón de sincronización para verificar tu balance real</li>
                  </ul>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
