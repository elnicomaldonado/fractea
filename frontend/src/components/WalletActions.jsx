import { useState } from 'react';
import { depositTokens, withdrawTokens } from '../utils/blockchain';

export default function WalletActions({ user, onActionComplete }) {
  const [activeTab, setActiveTab] = useState('deposit'); // 'deposit' o 'withdraw'
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('eUSD');
  const [destination, setDestination] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Lista de tokens soportados
  const supportedTokens = ['eUSD', 'BTC', 'ETH'];
  
  // Manejar depósito de fondos
  const handleDeposit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Por favor, ingresa un monto válido');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await depositTokens(user.email, token, amount);
      
      setSuccess({
        message: `Has depositado ${amount} ${token} a tu wallet custodial`,
        txHash: result.txHash
      });
      
      // Limpiar el formulario
      setAmount('');
      
      // Notificar al componente padre
      if (onActionComplete) {
        onActionComplete('deposit', result);
      }
    } catch (err) {
      setError(err.message || 'Error al procesar el depósito');
      console.error('Error en depósito:', err);
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
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await withdrawTokens(user.email, token, amount, destination);
      
      setSuccess({
        message: `Has retirado ${amount} ${token} ${destination === 'bank' ? 'a tu cuenta bancaria' : 'a la dirección externa'}`,
        txHash: result.txHash
      });
      
      // Limpiar el formulario
      setAmount('');
      setDestination('');
      
      // Notificar al componente padre
      if (onActionComplete) {
        onActionComplete('withdraw', result);
      }
    } catch (err) {
      setError(err.message || 'Error al procesar el retiro');
      console.error('Error en retiro:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
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
          <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-600 rounded-lg">
            <p className="font-medium">{success.message}</p>
            {success.txHash && (
              <p className="text-xs mt-1">
                TX: {success.txHash.substring(0, 10)}...
              </p>
            )}
          </div>
        )}
        
        {/* Formulario de depósito */}
        {activeTab === 'deposit' && (
          <form onSubmit={handleDeposit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token
              </label>
              <select
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                {supportedTokens.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto
              </label>
              <div className="flex">
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0.01"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
                <div className="bg-gray-100 px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg flex items-center">
                  {token}
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Mínimo 0.01 {token}
              </p>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-indigo-800 text-sm mb-2">Métodos disponibles</h4>
              <ul className="text-xs text-indigo-700 space-y-1">
                <li>• Transferencia desde otra wallet</li>
                <li>• Tarjeta de crédito o débito</li>
                <li>• Transferencia bancaria (SPEI, ACH)</li>
              </ul>
              <p className="text-xs text-indigo-600 mt-2">
                Importante: Este es un entorno simulado. No se realizarán transacciones reales.
              </p>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                isLoading
                  ? 'bg-indigo-400'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } transition-colors`}
            >
              {isLoading ? 'Procesando...' : 'Añadir fondos'}
            </button>
          </form>
        )}
        
        {/* Formulario de retiro */}
        {activeTab === 'withdraw' && (
          <form onSubmit={handleWithdraw}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token
              </label>
              <select
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                {supportedTokens.map((t) => (
                  <option key={t} value={t}>
                    {t} - Balance: {user.wallet?.tokenBalances?.[t] || '0.00'}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto
              </label>
              <div className="flex">
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0.01"
                  max={user.wallet?.tokenBalances?.[token] || '0.00'}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
                <div className="bg-gray-100 px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg flex items-center">
                  {token}
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Máximo {user.wallet?.tokenBalances?.[token] || '0.00'} {token}
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destino
              </label>
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  id="wallet"
                  name="destinationType"
                  className="mr-2"
                  checked={destination !== 'bank'}
                  onChange={() => setDestination('')}
                />
                <label htmlFor="wallet" className="text-sm text-gray-700">
                  Wallet externa
                </label>
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="radio"
                  id="bank"
                  name="destinationType"
                  className="mr-2"
                  checked={destination === 'bank'}
                  onChange={() => setDestination('bank')}
                />
                <label htmlFor="bank" className="text-sm text-gray-700">
                  Cuenta bancaria (simulado)
                </label>
              </div>
              
              {destination !== 'bank' && (
                <input
                  type="text"
                  placeholder="0x..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
              )}
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-yellow-800 text-sm mb-2">Importante</h4>
              <p className="text-xs text-yellow-700">
                Verifica cuidadosamente la dirección de destino antes de enviar tus fondos.
                Una vez confirmada, la transacción no podrá revertirse.
              </p>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                isLoading
                  ? 'bg-indigo-400'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } transition-colors`}
            >
              {isLoading ? 'Procesando...' : 'Retirar fondos'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
