import { useState } from 'react';
import { loginWithEmail, getCurrentUser } from '../utils/blockchain';

export default function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Por favor, introduzca un email válido');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Iniciar sesión
      await loginWithEmail(email);
      
      // Esperar un breve momento para asegurar que localStorage se actualizó
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Obtener el usuario recién logueado directamente desde localStorage
      // Esto es crucial para asegurar que la información está sincronizada
      const refreshedUser = getCurrentUser();
      
      console.log('Usuario después de login:', refreshedUser);
      
      if (onLoginSuccess) {
        onLoginSuccess(refreshedUser);
      }
    } catch (err) {
      setError('Error al iniciar sesión. Intente de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">Fractea</h1>
          <p className="text-gray-600">Inversión inmobiliaria fraccionada</p>
        </div>
        
        <div className="bg-white shadow-lg border border-gray-200 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Bienvenido</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Para probar: demo@fractea.app
              </p>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } transition-colors shadow-md`}
            >
              {isLoading ? 'Procesando...' : 'Entrar con Email'}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4">
              <button className="flex items-center justify-center w-full py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-xl p-5 mt-8 shadow-md">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-medium text-white text-sm">Sobre Fractea</h3>
          </div>
          <p className="text-xs text-gray-300">
            Convierte propiedades inmobiliarias en activos digitales, permitiendo inversión fraccionada
            y distribución automática de rentas usando tecnología blockchain con una interfaz simple.
          </p>
        </div>
      </div>
    </div>
  );
} 