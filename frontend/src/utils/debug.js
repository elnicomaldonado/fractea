/**
 * Herramientas de depuración para Fractea
 */

/**
 * Examina los datos del usuario en localStorage y muestra información sobre la wallet
 * @returns {Object} Datos del usuario o null si no existe
 */
export function examineUserData() {
  try {
    const email = localStorage.getItem('fractea_user_email');
    const userId = localStorage.getItem('fractea_user_id');
    const userDataStr = localStorage.getItem('fractea_user_data');
    
    if (!email || !userId || !userDataStr) {
      console.error('No hay datos de usuario en localStorage');
      return null;
    }
    
    try {
      const userData = JSON.parse(userDataStr);
      
      console.log('Datos de usuario encontrados:', {
        email,
        userId,
        hasWallet: !!userData.wallet,
        walletAddress: userData.wallet?.address || 'No disponible',
        hasTokenBalances: !!userData.wallet?.tokenBalances,
        tokenBalances: userData.wallet?.tokenBalances || {},
        balances: userData.balances || {},
        claimable: userData.claimable || {}
      });
      
      return userData;
    } catch (error) {
      console.error('Error al parsear datos de usuario:', error);
      return null;
    }
  } catch (error) {
    console.error('Error al examinar datos de usuario:', error);
    return null;
  }
}

/**
 * Reinicia la wallet del usuario actual en localStorage (útil para depuración)
 * @returns {boolean} True si se reinició con éxito
 */
export function resetUserWallet() {
  try {
    const userDataStr = localStorage.getItem('fractea_user_data');
    if (!userDataStr) {
      console.error('No hay datos de usuario para reiniciar wallet');
      return false;
    }
    
    const userData = JSON.parse(userDataStr);
    
    // Crear una dirección fija para depuración
    userData.wallet = {
      address: '0xDebugWalletAddress123456789012345678901234',
      encryptedPrivateKey: 'debug_key',
      tokenBalances: {
        eUSD: '999.99',
        BTC: '0.99',
        ETH: '9.9'
      }
    };
    
    // Guardar de vuelta a localStorage
    localStorage.setItem('fractea_user_data', JSON.stringify(userData));
    
    console.log('Wallet reiniciada con éxito:', userData.wallet);
    return true;
  } catch (error) {
    console.error('Error al reiniciar wallet:', error);
    return false;
  }
}

/**
 * Imprime información completa sobre el estado actual de la aplicación
 */
export function debugAppState() {
  console.group('Estado de la aplicación Fractea');
  
  // Examinar datos del usuario
  const userData = examineUserData();
  
  // Información del navegador
  console.log('Información del navegador:', {
    userAgent: navigator.userAgent,
    language: navigator.language,
    online: navigator.onLine,
    cookiesEnabled: navigator.cookieEnabled
  });
  
  // Claves en localStorage
  const localStorageKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    localStorageKeys.push(localStorage.key(i));
  }
  console.log('Claves en localStorage:', localStorageKeys);
  
  console.groupEnd();
  
  return {
    userData,
    localStorageKeys
  };
}
