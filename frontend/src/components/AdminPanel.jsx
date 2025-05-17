import { useState } from 'react';

// Este componente es solo para demostración, permitirá simular nuevos depósitos de renta
export default function AdminPanel({ onRentDeposited }) {
  const [amount, setAmount] = useState('0.001');
  const [propertyId, setPropertyId] = useState(1); // Estado para la propiedad seleccionada
  const [isDepositing, setIsDepositing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDepositing(true);
    setSuccess(false);
    setError(null);
    
    try {
      // Llamar al endpoint de la API para simular un depósito de renta
      const response = await fetch('/api/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId, // Usar el propertyId seleccionado
          amount
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el depósito');
      }
      
      const result = await response.json();
      
      // Actualizar directamente el localStorage después del depósito
      try {
        const storedEmail = localStorage.getItem('fractea_user_email');
        const storedUserData = localStorage.getItem('fractea_user_data');
        
        if (storedEmail && storedUserData) {
          const userData = JSON.parse(storedUserData);
          
          // Asegurar que la estructura existe
          if (!userData.claimable) {
            userData.claimable = {};
          }
          
          // Actualizar el valor reclamable con el nuevo monto
          // Si no existe, inicializarlo a 0 primero
          const currentAmount = parseFloat(userData.claimable[propertyId] || '0');
          const newAmount = currentAmount + parseFloat(amount);
          userData.claimable[propertyId] = newAmount.toFixed(6);
          
          // Guardar de vuelta en localStorage
          localStorage.setItem('fractea_user_data', JSON.stringify(userData));
          console.log('Renta reclamable actualizada en localStorage tras depósito:', {
            propertyId,
            monto: amount,
            nuevoTotal: userData.claimable[propertyId]
          });
        }
      } catch (err) {
        console.error("Error updating localStorage after deposit:", err);
      }
      
      // Notificar al componente padre
      if (onRentDeposited) {
        onRentDeposited(result);
      }
      
      setSuccess(true);
    } catch (err) {
      console.error("Error depositing rent:", err);
      setError(err.message || 'Error al procesar el depósito');
    } finally {
      setIsDepositing(false);
    }
  };
  
  return (
    <div className="rounded-lg bg-white shadow-md border border-gray-200 p-6 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-800">Panel de Administración</h3>
      </div>
      
      {error && (
        <div className="mb-5 bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-gray-900 rounded-lg p-5 mb-6 text-white">
        <div className="flex items-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
          <p className="text-white font-medium">
            Simulador de distribución de rentas
          </p>
        </div>
        <p className="text-white/80 text-sm mb-2">
          Desde aquí puede simular depósitos de renta como administrador. 
          En un escenario real, estos fondos provendrían de los arrendatarios.
        </p>
        <p className="text-white/60 text-xs">
          La renta se distribuye automáticamente a los inversores según sus fracciones.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dropdown para seleccionar propiedad */}
        <div>
          <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700 mb-2">
            Propiedad
          </label>
          <select
            id="propertyId"
            value={propertyId}
            onChange={(e) => setPropertyId(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          >
            <option value={1}>Edificio A - CDMX</option>
            <option value={2}>Torre B - Monterrey</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Monto de renta a distribuir
          </label>
          <div className="flex items-center">
            <input
              id="amount"
              type="number"
              step="0.0001"
              min="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              required
            />
            <span className="bg-indigo-600 border border-indigo-600 px-4 py-3 rounded-r-lg text-white font-medium">
              ETH
            </span>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isDepositing}
          className={`w-full py-3 rounded-lg font-medium text-white ${
            isDepositing ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
          } transition-colors shadow-md`}
        >
          {isDepositing ? 'Procesando...' : 'Depositar Renta (Simulación)'}
        </button>
      </form>
      
      {success && (
        <div className="mt-5 bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">Renta depositada con éxito</p>
          </div>
          <p className="text-sm pl-7">Los usuarios verán el nuevo monto disponible para reclamar en {propertyId === 1 ? 'Edificio A - CDMX' : 'Torre B - Monterrey'}.</p>
        </div>
      )}
    </div>
  );
}