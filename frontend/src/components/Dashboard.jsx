import { useState } from 'react';
import { logout } from '../utils/blockchain';

export default function Dashboard({ user, onLogout }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogout = () => {
    setIsLoading(true);
    logout();
    onLogout();
    setIsLoading(false);
  };
  
  // Calcular el total de fracciones
  const totalFractions = Object.values(user?.balances || {}).reduce((sum, amount) => sum + amount, 0);
  
  // Calcular el total de renta reclamable
  const totalClaimableRent = Object.values(user?.claimable || {}).reduce(
    (sum, amount) => sum + parseFloat(amount), 
    0
  ).toFixed(6);
  
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
                <p className="font-medium">{totalClaimableRent} ETH</p>
                <p className="text-white/60 text-xs ml-1">≈ ${(parseFloat(totalClaimableRent) * 2350).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
    </div>
  );
} 