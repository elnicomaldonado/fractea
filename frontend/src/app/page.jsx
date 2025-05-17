'use client';

import { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import Dashboard from '../components/Dashboard';
import { getCurrentUser } from '../utils/blockchain';
import PropertyCard from '../components/PropertyCard';
import AdminPanel from '../components/AdminPanel';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [rentDeposits, setRentDeposits] = useState([]);

  // Función para actualizar los datos del usuario desde localStorage
  const refreshUserData = () => {
    if (user && user.email) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        console.log('Datos de usuario actualizados desde localStorage');
      }
    }
  };

  // Verificar si hay un usuario logueado al inicio
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  // Actualizar datos del usuario cada 15 segundos si está logueado
  useEffect(() => {
    if (!user) return;
    
    // Solo actualizar periódicamente después de que el usuario lleva tiempo logueado
    const loginTime = new Date();
    
    const intervalId = setInterval(() => {
      const now = new Date();
      const timeSinceLogin = (now - loginTime) / 1000; // tiempo en segundos
      
      // Solo actualizar si han pasado al menos 10 segundos desde el login
      if (timeSinceLogin > 10) {
        refreshUserData();
      }
    }, 15000); // Actualizar cada 15 segundos en lugar de 5
    
    return () => clearInterval(intervalId);
  }, [user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleRentDeposited = (deposit) => {
    setRentDeposits(prev => [deposit, ...prev]);
    // Actualizar los datos del usuario inmediatamente después de un depósito
    // y nuevamente en 2 segundos para asegurar que todo esté actualizado
    refreshUserData();
    setTimeout(refreshUserData, 200);
    setTimeout(refreshUserData, 2000);
  };

  const toggleAdminPanel = () => {
    setShowAdmin(prev => !prev);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-40 bg-indigo-200 rounded-lg mb-4"></div>
          <div className="h-6 w-64 bg-indigo-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {!user ? (
        <div className="py-16 px-4">
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        <div className="py-8 px-4 md:px-8">
          <Dashboard user={user} onLogout={handleLogout} />
          
          <div className="max-w-5xl mx-auto mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-800">Propiedades disponibles</h2>
              <div className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                Última actualización: {new Date().toLocaleDateString()}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PropertyCard 
                propertyId={1} 
                user={user}
              />
              
              <PropertyCard 
                propertyId={2} 
                user={user}
              />
            </div>
          </div>
          
          <div className="max-w-5xl mx-auto mb-8 flex justify-end">
            <button 
              onClick={toggleAdminPanel}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200 transition-colors"
            >
              {showAdmin ? 'Ocultar panel administrativo' : 'Mostrar panel administrativo (demo)'}
            </button>
          </div>
          
          {showAdmin && (
            <div className="max-w-5xl mx-auto mb-16">
              <AdminPanel onRentDeposited={handleRentDeposited} />
              
              {rentDeposits.length > 0 && (
                <div className="rounded-lg bg-white shadow-md border border-gray-200 p-6 mb-8">
                  <div className="flex items-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-800">Historial de depósitos recientes</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {rentDeposits.map((deposit, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-800">Propiedad #{deposit.propertyId}</span>
                          <span className="text-emerald-600 font-medium">{deposit.amount} ETH</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(deposit.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <footer className="max-w-5xl mx-auto text-center text-sm text-gray-500 pb-8">
            <p>Fractea — Invierte en inmuebles de forma fraccionada con tecnología blockchain</p>
          </footer>
        </div>
      )}
    </main>
  );
} 