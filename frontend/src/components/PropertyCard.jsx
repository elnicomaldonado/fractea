import { useState, useEffect } from 'react';
import { 
  getPropertyDetails, 
  getUserBalance, 
  getClaimableRent,
  investInProperty,
  getRentHistory,
  saveRentHistory
} from '../utils/blockchain';

// Información fija para la demo
const PROPERTIES_INFO = {
  1: {
    name: "Edificio A - CDMX",
    location: "Colonia Roma, Ciudad de México",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Edificio de oficinas prime con rentabilidad estable y alto potencial de plusvalía.",
    price: 1000,
    currency: "USD",
    yearlyCashflow: 8, // 8% anual
    minimumInvestment: 50, // USD
    fractionPrice: 10, // USD por fracción
  },
  2: {
    name: "Torre B - Monterrey",
    location: "San Pedro Garza García, Monterrey",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Torre residencial con 12 apartamentos de lujo y amenidades premium.",
    price: 1500,
    currency: "USD",
    yearlyCashflow: 7, // 7% anual
    minimumInvestment: 75, // USD
    fractionPrice: 15, // USD por fracción
  }
};

// Calcular fecha estimada del próximo depósito (30 días después del último)
const getNextDepositDate = (propertyId, rentHistory = []) => {
  // Usar el historial dinámico si está disponible, o una fecha por defecto
  const lastDeposit = rentHistory[0]?.date || new Date();
  const nextDeposit = new Date(lastDeposit);
  nextDeposit.setDate(nextDeposit.getDate() + 30);
  return nextDeposit;
};

export default function PropertyCard({ propertyId, user }) {
  const [property, setProperty] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [claimableRent, setClaimableRent] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClaimingRent, setIsClaimingRent] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(null);
  const [isInvesting, setIsInvesting] = useState(false);
  const [investSuccess, setInvestSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [rentHistory, setRentHistory] = useState([]);

  const propertyInfo = PROPERTIES_INFO[propertyId];

  useEffect(() => {
    async function loadPropertyData() {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar datos de la propiedad
        const propertyData = await getPropertyDetails(propertyId);
        setProperty(propertyData);
        
        // Cargar datos específicos del usuario
        if (user?.email) {
          const balance = await getUserBalance(user.email, propertyId);
          setUserBalance(balance);
          
          // Primero intentar leer la información más actualizada desde localStorage
          let claimableAmount = '0';
          try {
            const storedEmail = localStorage.getItem('fractea_user_email');
            const storedUserData = localStorage.getItem('fractea_user_data');
            
            if (storedEmail === user.email && storedUserData) {
              const userData = JSON.parse(storedUserData);
              if (userData.claimable && userData.claimable[propertyId]) {
                claimableAmount = userData.claimable[propertyId];
                console.log(`Monto reclamable para propiedad #${propertyId} desde localStorage:`, claimableAmount);
              }
            }
          } catch (err) {
            console.error('Error al leer datos reclamables de localStorage:', err);
          }
          
          // Si no hay datos en localStorage, usar la función normal
          if (parseFloat(claimableAmount) === 0) {
            claimableAmount = await getClaimableRent(propertyId, user.email);
          }
          
          setClaimableRent(claimableAmount);
          
          // Cargar historial de rentas para este usuario y propiedad
          const history = getRentHistory(user.email, propertyId);
          setRentHistory(history);
        }
      } catch (err) {
        setError("Error al cargar los datos de la propiedad.");
        console.error("Error loading property data:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadPropertyData();
  }, [propertyId, user]);

  const handleClaimRent = async () => {
    try {
      setIsClaimingRent(true);
      setClaimSuccess(null);
      
      // Obtener el monto actual reclamable para enviarlo al servidor
      const currentClaimableAmount = claimableRent;
      
      // Usar el endpoint de la API para reclamar renta
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          email: user.email,
          claimableAmount: currentClaimableAmount // Enviar el monto actual
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar la solicitud');
      }
      
      const result = await response.json();
      
      // Actualizar el estado UI
      setClaimSuccess({
        amount: result.amount,
        txHash: result.txHash
      });
      
      // Actualizar el monto reclamable a 0
      setClaimableRent('0');
      
      // Actualizar el localStorage directamente desde el cliente
      if (parseFloat(result.amount) > 0) {
        // 1. Actualizar el dato de usuario en localStorage
        try {
          const email = user.email;
          const storedEmail = localStorage.getItem('fractea_user_email');
          const storedUserData = localStorage.getItem('fractea_user_data');
          
          if (storedEmail === email && storedUserData) {
            const userData = JSON.parse(storedUserData);
            
            // Asegurar que la estructura existe
            if (!userData.claimable) {
              userData.claimable = {};
            }
            
            // Actualizar el valor reclamable a 0
            userData.claimable[propertyId] = '0';
            
            // Guardar de vuelta en localStorage
            localStorage.setItem('fractea_user_data', JSON.stringify(userData));
            console.log('Usuario actualizado en localStorage tras reclamo de renta');
          }
        } catch (err) {
          console.error('Error al actualizar datos de usuario en localStorage:', err);
        }
        
        // 2. Crear nuevo registro en el historial
        const newRecord = {
          date: new Date(),
          amount: result.amount,
          status: 'completed'
        };
        
        // Actualizar el historial en la UI
        setRentHistory(prevHistory => [newRecord, ...prevHistory]);
        
        // Guardar en el historial de rentas
        saveRentHistory(user.email, propertyId, result.amount);
        
        console.log('Historial de rentas actualizado tras cobro exitoso');
      }
    } catch (err) {
      setError("Error al reclamar la renta. Intente de nuevo más tarde.");
      console.error("Error claiming rent:", err);
    } finally {
      setIsClaimingRent(false);
    }
  };

  const handleInvest = async () => {
    setIsInvesting(true);
    setInvestSuccess(null);
    setError(null);
    
    try {
      // Usar el monto de la inversión de la propiedad
      const investmentAmount = propertyInfo.minimumInvestment || 1000;
      
      // Mostrar un mensaje de proceso
      console.log(`Iniciando inversión de $${investmentAmount} en propiedad #${propertyId}`);
      
      // Utilizar la función de inversión
      const result = await investInProperty(propertyId, user.email, investmentAmount);
      
      // Actualizar el balance del usuario
      setUserBalance(result.totalFractions);
      
      // Calcular el costo por fracción
      const fractionPrice = propertyInfo.fractionPrice || (investmentAmount / result.addedFractions);
      
      // Mostrar mensaje de éxito con datos más completos
      setInvestSuccess({
        amount: investmentAmount,
        fractions: result.addedFractions,
        fractionPrice: fractionPrice.toFixed(2),
        txHash: result.txHash,
        tokenId: result.tokenId,
        tokenType: result.tokenType
      });
      
      // Emitir evento para analytics
      if (window.gtag) {
        window.gtag('event', 'investment_success', {
          property_id: propertyId,
          amount: investmentAmount,
          fractions: result.addedFractions
        });
      }
    } catch (err) {
      console.error("Error investing:", err);
      
      // Mensaje de error más amigable basado en el tipo de error
      let errorMessage = "Error al procesar la inversión. Intente de nuevo más tarde.";
      
      if (err.message.includes('No se encontró wallet custodial')) {
        errorMessage = "No se encontró una wallet asociada a tu cuenta. Por favor, contacta a soporte.";
      } else if (err.message.includes('fondos insuficientes') || err.message.includes('insufficient funds')) {
        errorMessage = "Fondos insuficientes para completar la inversión. Por favor, añade fondos a tu wallet.";
      } else if (err.message.includes('transacción rechazada') || err.message.includes('transaction rejected')) {
        errorMessage = "La transacción fue rechazada por la red. Por favor, intenta nuevamente.";
      }
      
      setError(errorMessage);
      
      // Emitir evento para analytics de error
      if (window.gtag) {
        window.gtag('event', 'investment_error', {
          property_id: propertyId,
          error_message: err.message
        });
      }
    } finally {
      setIsInvesting(false);
    }
  };

  const calculateOwnershipPercentage = () => {
    if (!property || property.totalSupply === 0) return 0;
    return ((userBalance / property.totalSupply) * 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-48 bg-gray-100 rounded-t-lg"></div>
        <div className="p-4">
          <div className="h-6 bg-gray-100 rounded-full w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded-full w-1/2 mb-4"></div>
          <div className="h-16 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg p-4 border border-red-100 bg-red-50 text-red-600">
        <p className="font-medium">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!propertyInfo) {
    return (
      <div className="rounded-lg p-4 border border-yellow-100 bg-yellow-50 text-yellow-600">
        <p className="font-medium">Propiedad no encontrada</p>
        <p>No se encontró información para la propiedad #{propertyId}</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Cabecera con imagen */}
      <div className="relative h-48">
        <img 
          src={propertyInfo.image} 
          alt={propertyInfo.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h2 className="text-xl font-bold">{propertyInfo.name}</h2>
          <p className="text-white/90 text-sm">{propertyInfo.location}</p>
        </div>
        <div className="absolute top-3 right-3">
          <span className="badge-success">Activa</span>
        </div>
      </div>
      
      {/* Panel de tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {['overview', 'history'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === tab 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {tab === 'overview' ? 'Información' : 'Historial'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Panel principal con información de inversión */}
      <div className="bg-indigo-900 p-4 text-white">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-3">
          <div>
            <p className="text-white/70 text-xs">Tu inversión</p>
            <div className="flex items-baseline">
              <p className="text-lg font-bold">${(userBalance * propertyInfo.fractionPrice).toLocaleString()}</p>
              <p className="text-xs text-white/70 ml-2">{userBalance} fracciones ({calculateOwnershipPercentage()}%)</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs">Renta disponible</p>
            <div className="flex items-baseline">
              <p className="text-lg font-bold">{claimableRent} ETH</p>
              <p className="text-xs text-white/70 ml-2">≈ ${(parseFloat(claimableRent) * 2350).toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        {/* Acciones principales */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInvest}
            disabled={isInvesting}
            className="flex-1 py-2 rounded-lg font-medium text-indigo-900 bg-white hover:bg-white/90 transition-colors disabled:bg-gray-300 disabled:text-gray-700 disabled:cursor-not-allowed">
            {isInvesting ? 'Procesando...' : 'Invertir $1,000'}
          </button>
          <button
            onClick={handleClaimRent}
            disabled={isClaimingRent || parseFloat(claimableRent) === 0}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              parseFloat(claimableRent) > 0 
              ? 'text-white bg-emerald-500 hover:bg-emerald-600' 
              : 'text-white/50 bg-indigo-800/50 cursor-not-allowed'
            }`}>
            {isClaimingRent ? 'Procesando...' : 'Cobrar Rentas'}
          </button>
        </div>
        
        {/* Notificaciones de éxito condensadas */}
        {(investSuccess || claimSuccess) && (
          <div className={`mt-3 p-2 rounded-lg text-sm ${
            investSuccess 
              ? 'bg-indigo-800/70 border border-indigo-700/50' 
              : 'bg-emerald-500/20 border border-emerald-500/30'
          }`}>
            {investSuccess && (
              <div>
                <p className="font-medium">✓ Inversión exitosa</p>
                <p>{investSuccess.fractions} fracciones por ${investSuccess.amount}</p>
                <p className="text-xs text-white/70 mt-1">
                  {investSuccess.tokenType} #{investSuccess.tokenId} | 
                  <a 
                    href={`https://explorer.sepolia.mantle.xyz/tx/${investSuccess.txHash}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-1 text-white/90 hover:text-white"
                  >
                    Ver transacción
                  </a>
                </p>
              </div>
            )}
            {claimSuccess && (
              <div>
                <p className="font-medium">✓ Renta cobrada</p>
                <p>{claimSuccess.amount} ETH</p>
                <p className="text-xs text-white/70 mt-1">
                  <a 
                    href={`https://explorer.sepolia.mantle.xyz/tx/${claimSuccess.txHash}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/90 hover:text-white"
                  >
                    Ver transacción
                  </a>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Contenido de tabs */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div>
            {/* Datos clave simplificados */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Precio</p>
                <p className="font-bold">${propertyInfo.price.toLocaleString()}</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Rendimiento</p>
                <p className="font-bold text-emerald-600">+{propertyInfo.yearlyCashflow}%</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Min. inversión</p>
                <p className="font-bold">${propertyInfo.minimumInvestment}</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{propertyInfo.description}</p>
            
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg mb-2">
              <span className="text-gray-600 text-sm">Próximo depósito</span>
              <span className="font-medium text-sm text-indigo-600">
                {getNextDepositDate(propertyId, rentHistory).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-600 text-sm">Fracciones totales</span>
              <span className="font-medium text-sm">{property?.totalSupply || '—'}</span>
            </div>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div>
            {rentHistory.length > 0 ? (
              <>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-gray-500">Fecha</span>
                  <span className="text-xs text-gray-500">Monto</span>
                </div>
                
                {rentHistory.map((deposit, index) => (
                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded-lg mb-2">
                    <span className="text-sm text-gray-600">
                      {deposit.date.toLocaleDateString()}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-indigo-600">
                        {deposit.amount} ETH
                      </span>
                      <span className="block text-xs text-gray-500">
                        ≈ ${(parseFloat(deposit.amount) * 2350).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                No hay historial de depósitos disponible aún.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 