import { useState } from 'react';
import { examineUserData, resetUserWallet, debugAppState } from '../utils/debug';
import { generateCustodialWallet } from '../utils/blockchain';

export default function DebugPanel({ user }) {
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
  const handleExamineData = () => {
    const userData = examineUserData();
    setDebugInfo(userData);
  };
  
  const handleResetWallet = () => {
    if (confirm('¿Estás seguro que deseas reiniciar la wallet?')) {
      const success = resetUserWallet();
      if (success) {
        alert('Wallet reiniciada. Recarga la página para ver los cambios.');
      } else {
        alert('Error al reiniciar la wallet. Consulta la consola.');
      }
    }
  };
  
  const handleDebugState = () => {
    debugAppState();
    alert('Información de depuración impresa en la consola.');
  };
  
  if (!showDebugPanel) {
    return (
      <div className="mt-4">
        <button 
          onClick={() => setShowDebugPanel(true)}
          className="text-gray-500 text-xs hover:text-gray-700 underline"
        >
          Mostrar herramientas de depuración
        </button>
      </div>
    );
  }
  
  return (
    <div className="mt-4 border border-gray-300 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-700">Herramientas de depuración</h3>
        <button 
          onClick={() => setShowDebugPanel(false)}
          className="text-gray-500 text-xs hover:text-gray-700"
        >
          Ocultar
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button 
          onClick={handleExamineData}
          className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs py-2 px-3 rounded transition-colors"
        >
          Examinar datos
        </button>
        
        <button 
          onClick={handleResetWallet}
          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs py-2 px-3 rounded transition-colors"
        >
          Reiniciar wallet
        </button>
        
        <button 
          onClick={handleDebugState}
          className="bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs py-2 px-3 rounded transition-colors"
        >
          Debug en consola
        </button>
      </div>
      
      {debugInfo && (
        <div className="bg-gray-100 p-3 rounded text-xs font-mono">
          <div className="mb-2">
            <span className="font-semibold">Email:</span> {debugInfo.email || 'N/A'}
          </div>
          <div className="mb-2">
            <span className="font-semibold">ID:</span> {debugInfo.userId || 'N/A'}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Wallet:</span> {debugInfo.wallet ? 'Presente' : 'No existe'}
          </div>
          {debugInfo.wallet && (
            <>
              <div className="mb-2">
                <span className="font-semibold">Dirección:</span> {debugInfo.wallet.address || 'N/A'}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Token Balances:</span>
                <pre className="bg-gray-200 p-1 mt-1 rounded overflow-auto">
                  {JSON.stringify(debugInfo.wallet.tokenBalances, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        Nota: Estas herramientas son solo para depuración. Los cambios pueden requerir recargar la página.
      </div>
    </div>
  );
}
