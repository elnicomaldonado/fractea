import { useState } from 'react';
import { logout } from '../utils/blockchain';
import WalletActions from './WalletActions';
import WalletEducation from './WalletEducation';
import DebugPanel from './DebugPanel';

export default function Dashboard({ user, onLogout }) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('properties'); // 'properties' o 'wallet'
  const [showWalletActions, setShowWalletActions] = useState(false);
  const [showWalletEducation, setShowWalletEducation] = useState(false);
  
  const handleLogout = () => {
    setIsLoading(true);
    logout();
    onLogout();
    setIsLoading(false);
  };
  
  // Manejar actualizaciones de wallet
  const handleWalletAction = (action, result) => {
    console.log(`Acción de wallet completada: ${action}`, result);
    // Aquí podríamos recargar los datos del usuario si fuera necesario
  };
  
  // Calcular el total de fracciones
  const totalFractions = Object.values(user?.balances || {}).reduce((sum, amount) => sum + amount, 0);
  
  // Calcular el total de renta reclamable
  const totalClaimableRent = Object.values(user?.claimable || {}).reduce(
    (sum, amount) => sum + parseFloat(amount), 
    0
  ).toFixed(6);
  
  // Función para acortar direcciones de wallet
  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <div className="max-w-5xl mx-auto mb-12">
      <div className="bg-gradient-to-r from-gray-900 to-indigo-900 rounded-xl p-6 md:p-8 mb-8 text-white shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Fractea</h1>
          <button 
            onClick={handleLogout}
            disabled={isLoading}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/20"
          >
            {isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </button>
        </div>
        
        <p className="text-white/80 mb-6 text-sm">Inversión inmobiliaria fraccionada</p>
        
        <div className="flex flex-col md:flex-row md:items-center gap-6 mt-3">
          <div className="flex items-center bg-white/10 p-3 rounded-lg">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">{user?.email || ''}</p>
              <p className="text-white/60 text-xs">ID: {user?.userId || ''}</p>
            </div>
          </div>
          
          <div className="bg-white/10 p-3 rounded-lg flex items-center">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white/60 text-xs">Renta disponible</p>
              <div className="flex items-baseline">
                <p className="font-medium">{totalClaimableRent} eUSD</p>
                <p className="text-white/60 text-xs ml-1">≈ ${(parseFloat(totalClaimableRent) * 1).toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          {/* Nueva sección de wallet custodial */}
          <div className="bg-white/10 p-3 rounded-lg flex items-center">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-white/60 text-xs">Wallet custodial</p>
              <div className="flex items-baseline">
                <p className="font-medium">{shortenAddress(user?.wallet?.address)}</p>
                <button 
                  className="ml-2 text-xs text-white/60 hover:text-white"
                  onClick={() => {
                    const address = user?.wallet?.address;
                    if (address) {
                      navigator.clipboard.writeText(address);
                      alert(`Dirección copiada: ${address}`);
                    } else {
                      alert('No hay dirección de wallet disponible para copiar');
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs de navegación */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'properties'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('properties')}
          >
            Propiedades
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'wallet'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('wallet')}
          >
            Mi Wallet
          </button>
        </nav>
      </div>
      
      {/* Contenido basado en el tab activo */}
      {activeTab === 'properties' ? (
        <>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Resumen de tu portafolio</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5">
              <p className="text-gray-500 text-sm mb-1">Propiedades</p>
              <p className="text-3xl font-bold text-gray-900">{Object.keys(user?.balances || {}).length}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5">
              <p className="text-gray-500 text-sm mb-1">Fracciones totales</p>
              <p className="text-3xl font-bold text-gray-900">{totalFractions}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm mb-1">Valor estimado</p>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  Actualizado
                </span>
              </div>
              <p className="text-3xl font-bold text-indigo-600">${(totalFractions * 10).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-5 text-white shadow-md">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h3 className="font-medium text-xl">Rendimiento anual</h3>
              </div>
              <p className="text-4xl font-bold">+8.0%</p>
              <p className="text-white/80 mt-1 text-sm">Basado en los últimos depósitos de renta</p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-5 text-white shadow-md">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                <h3 className="font-medium text-xl">Próximos pagos</h3>
              </div>
              <p className="text-2xl font-bold">{new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              <p className="text-white/80 mt-1 text-sm">Distribución automática de rentas</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Mi Wallet Custodial</h2>
          
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Dirección de tu wallet</h3>
                <p className="text-gray-500 mt-1 text-sm">Tus fondos están seguros en esta wallet custodial</p>
              </div>
              <div className="mt-2 md:mt-0 bg-gray-100 py-2 px-4 rounded-lg flex items-center">
                <span className="text-gray-800 font-mono">{user?.wallet?.address || 'No disponible'}</span>
                <button 
                  className="ml-2 text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    const address = user?.wallet?.address;
                    if (address) {
                      navigator.clipboard.writeText(address);
                      alert(`Dirección copiada: ${address}`);
                    } else {
                      alert('No hay dirección de wallet disponible para copiar');
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <h4 className="font-medium text-gray-700 mb-4">Balances disponibles</h4>
            
            <div className="space-y-4">
              {user?.wallet?.tokenBalances && Object.entries(user.wallet.tokenBalances).map(([token, balance]) => (
                <div key={token} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      token === 'eUSD' ? 'bg-green-100 text-green-600' :
                      token === 'BTC' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {token === 'eUSD' ? '$' : token === 'BTC' ? '₿' : 'Ξ'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{token}</p>
                      <p className="text-gray-500 text-sm">
                        {token === 'eUSD' ? 'Mantle USD Stablecoin' : 
                         token === 'BTC' ? 'Bitcoin' : 'Ethereum'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{balance}</p>
                    <p className="text-gray-500 text-sm">
                      {token === 'eUSD' ? `$${Number(balance).toFixed(2)}` : 
                       token === 'BTC' ? `$${(Number(balance) * 50000).toFixed(2)}` : 
                       `$${(Number(balance) * 2350).toFixed(2)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Acciones de wallet */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button 
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                onClick={() => setShowWalletActions(!showWalletActions)}
              >
                {showWalletActions ? 'Ocultar opciones' : 'Gestionar fondos'}
              </button>
              <a 
                href={`https://explorer.sepolia.mantle.xyz/address/${user?.wallet?.address}`}
                target="_blank"
                rel="noopener noreferrer" 
                className="bg-white border border-indigo-500 text-indigo-500 hover:bg-indigo-50 py-2 px-4 rounded-lg font-medium transition-colors text-center"
              >
                Ver en Explorer
              </a>
            </div>
            
            {/* Componente de acciones de wallet */}
            {showWalletActions && (
              <div className="mt-6">
                <WalletActions user={user} onActionComplete={handleWalletAction} />
              </div>
            )}
          </div>
          
          {/* Educación sobre wallets */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6">
            <h3 className="font-medium text-indigo-800 mb-2">¿Quieres usar tu propia wallet?</h3>
            <p className="text-indigo-700 text-sm mb-4">
              Puedes transferir tus fondos a cualquier wallet compatible con Mantle Network.
            </p>
            <button 
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              onClick={() => setShowWalletEducation(!showWalletEducation)}
            >
              {showWalletEducation ? 'Ocultar información' : 'Aprender más sobre wallets'}
            </button>
          </div>
          
          {/* Componente educativo */}
          {showWalletEducation && (
            <div className="mt-6">
              <WalletEducation />
            </div>
          )}
          
          {/* Panel de depuración */}
          <DebugPanel user={user} />
        </>
      )}
    </div>
  );
} 