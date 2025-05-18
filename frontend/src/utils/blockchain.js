import { ethers } from 'ethers';
import { 
  FRACTEA_NFT_ADDRESS, 
  FRACTEA_NFT_ABI, 
  FRACTEA_NETWORK_ID 
} from '../contracts/FracteaNFT';

// RPC URL for Mantle Sepolia
const RPC_URL = "https://rpc.sepolia.mantle.xyz";

// Función simple para encriptar claves privadas (en producción usar una solución más segura)
function encryptPrivateKey(privateKey) {
  // Esta es una simulación simple, en producción se usaría una encriptación real
  // La clave de encriptación vendría de una variable de entorno o un servicio seguro
  const encryptionKey = "FRACTEA_SECRET_KEY";
  // Simple XOR para simulación, NO USAR EN PRODUCCIÓN
  return Array.from(privateKey).map(char => 
    String.fromCharCode(char.charCodeAt(0) ^ encryptionKey.charCodeAt(0))
  ).join('');
}

// Función para desencriptar claves privadas
function decryptPrivateKey(encryptedKey) {
  // La misma operación XOR revertirá la encriptación simulada
  const encryptionKey = "FRACTEA_SECRET_KEY";
  return Array.from(encryptedKey).map(char => 
    String.fromCharCode(char.charCodeAt(0) ^ encryptionKey.charCodeAt(0))
  ).join('');
}

// Generar una nueva wallet custodial
export function generateCustodialWallet() {
  try {
    // Generar una wallet aleatoria usando ethers.js
    const wallet = ethers.Wallet.createRandom();
    
    console.log('Wallet generada exitosamente:', {
      address: wallet.address
    });
    
    return {
      address: wallet.address,
      // Encriptar la clave privada antes de almacenarla
      encryptedPrivateKey: encryptPrivateKey(wallet.privateKey),
      // Inicializar balance de tokens (simulado)
      tokenBalances: {
        eUSD: '100.00', // 100 eUSD para empezar
        BTC: '0.0005',  // Una pequeña cantidad de BTC simulado
        ETH: '0.01'     // Una pequeña cantidad de ETH simulado
      }
    };
  } catch (error) {
    console.error('Error al generar wallet custodial con ethers.js:', error);
    
    // Crear una dirección fija simulada
    const fallbackAddress = '0x1234567890123456789012345678901234567890';
    console.log('Usando dirección de wallet de fallback:', fallbackAddress);
    
    // Retornar wallet simulada en caso de error
    return {
      address: fallbackAddress,
      encryptedPrivateKey: "encryptedKey123",
      tokenBalances: {
        eUSD: '100.00',
        BTC: '0.0005',
        ETH: '0.01'
      }
    };
  }
}

// Función para guardar usuario completo en localStorage
function saveUserToLocalStorage(email, user) {
  try {
    if (!email) {
      console.error('Error al guardar usuario: email es undefined o null', { email, user });
      return;
    }
    
    if (!user || !user.userId) {
      console.error('Error al guardar usuario: objeto de usuario inválido', { email, user });
      return;
    }
    
    const userDataString = JSON.stringify(user);
    
    // Guardar en localStorage con manejo de excepciones
    localStorage.setItem('fractea_user_email', email);
    localStorage.setItem('fractea_user_id', user.userId);
    localStorage.setItem('fractea_user_data', userDataString);
    
    // Verificar que se guardó correctamente
    const storedData = localStorage.getItem('fractea_user_data');
    if (!storedData) {
      console.error('Error: No se pudo verificar el guardado en localStorage');
    } else {
      console.log('Usuario guardado en localStorage con éxito:', { 
        email, 
        userId: user.userId,
        dataLength: userDataString.length,
        balances: user.balances,
        claimable: user.claimable,
        // Mostrar información de wallet si existe
        walletAddress: user.wallet?.address || 'No wallet'
      });
    }
  } catch (error) {
    console.error('Error inesperado al guardar en localStorage:', error);
  }
}

// Simulación de wallets custodiadas - en un entorno real esto estaría en un backend seguro
const SIMULATED_USERS = {
  'demo@fractea.app': {
    userId: 'user_demo123',
    wallet: {
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      encryptedPrivateKey: encryptPrivateKey('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'),
      tokenBalances: {
        eUSD: '500.00',
        BTC: '0.002',
        ETH: '0.5'
      }
    },
    balances: {
      1: 20, // 20 fracciones de la propiedad #1
      2: 10  // 10 fracciones de la propiedad #2
    },
    claimable: {
      1: '0.001', // 0.001 eUSD reclamables de la propiedad #1
      2: '0.0003'  // 0.0003 eUSD reclamables de la propiedad #2
    }
  },
  'test@fractea.app': {
    userId: 'user_test456',
    wallet: {
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      encryptedPrivateKey: encryptPrivateKey('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'),
      tokenBalances: {
        eUSD: '250.00',
        BTC: '0.001',
        ETH: '0.2'
      }
    },
    balances: {
      1: 10, // 10 fracciones de la propiedad #1
      2: 5   // 5 fracciones de la propiedad #2
    },
    claimable: {
      1: '0.0005', // 0.0005 eUSD reclamables de la propiedad #1
      2: '0.0001'  // 0.0001 eUSD reclamables de la propiedad #2
    }
  }
};

// Simulación de propiedades - información complementaria al smart contract
const SIMULATED_PROPERTIES = {
  1: {
    totalSupply: 100,
    totalRent: "0.01",
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000) // 120 días atrás
  },
  2: {
    totalSupply: 200,
    totalRent: "0.003",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 días atrás
  }
};

/**
 * Asegura que exista un usuario reconstruyéndolo si es necesario
 * @param {string} email - Email del usuario
 * @param {string} context - Contexto de la llamada para logs
 * @returns {Object|null} El usuario reconstruido o null si no fue posible
 */
function ensureUser(email, context = 'general') {
  // Si ya existe el usuario, devolverlo
  if (SIMULATED_USERS[email]) {
    return SIMULATED_USERS[email];
  }
  
  console.log(`Usuario no encontrado en ${context}, intentando reconstruir:`, { email });
  
  // Intentar reconstruir el usuario desde localStorage
  const storedEmail = localStorage.getItem('fractea_user_email');
  const storedUserId = localStorage.getItem('fractea_user_id');
  const storedUserData = localStorage.getItem('fractea_user_data');
  
  if (storedEmail && storedEmail === email && storedUserId) {
    console.log(`Reconstruyendo usuario desde localStorage para ${context}`);
    
    if (storedUserData) {
      try {
        // Usar los datos completos almacenados en localStorage
        SIMULATED_USERS[email] = JSON.parse(storedUserData);
        console.log(`Usuario reconstruido desde datos completos para ${context}:`, SIMULATED_USERS[email]);
      } catch (error) {
        console.error(`Error al parsear datos de usuario de localStorage:`, error);
        // Fallback a valores por defecto
        SIMULATED_USERS[email] = {
          userId: storedUserId,
          wallet: generateCustodialWallet(), // Generar nueva wallet si hay error
          balances: { 1: 5, 2: 3 },
          claimable: { 1: '0.0002', 2: '0.0001' }
        };
      }
    } else {
      // Caso legacy: crear el usuario con valores predeterminados
      SIMULATED_USERS[email] = {
        userId: storedUserId,
        wallet: generateCustodialWallet(), // Generar nueva wallet
        balances: { 1: 5, 2: 3 },
        claimable: { 1: '0.0002', 2: '0.0001' }
      };
    }
    
    return SIMULATED_USERS[email];
  }
  
  console.error(`No se pudo reconstruir el usuario en ${context}`);
  return null;
}

/**
 * Obtiene el usuario actual del localStorage
 */
export function getCurrentUser() {
  try {
    const email = localStorage.getItem('fractea_user_email');
    const userId = localStorage.getItem('fractea_user_id');
    const storedUserData = localStorage.getItem('fractea_user_data');
    
    console.log('getCurrentUser - datos de localStorage:', { 
      email, 
      userId, 
      hasStoredData: !!storedUserData 
    });
    
    if (!email || !userId) {
      console.log('No hay usuario en localStorage');
      return null;
    }
    
    // Intentar usar los datos completos de localStorage primero
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        
        // Siempre actualizar SIMULATED_USERS con los datos más recientes
        SIMULATED_USERS[email] = userData;
        
        console.log('Usuario recuperado de localStorage:', { 
          email, 
          userId, 
          balances: userData.balances,
          claimable: userData.claimable
        });
        
        return {
          email,
          userId,
          ...userData
        };
      } catch (error) {
        console.error('Error al parsear datos de usuario en getCurrentUser:', error);
      }
    }
    
    // Fallback: Reconstruir desde memoria
    console.log('Fallback: usando ensureUser para reconstruir usuario');
    ensureUser(email, 'getCurrentUser');
    
    if (SIMULATED_USERS[email]) {
      return {
        email,
        userId,
        ...SIMULATED_USERS[email]
      };
    }
    
    console.error('No se pudo recuperar datos de usuario válidos');
    return null;
  } catch (error) {
    console.error('Error inesperado en getCurrentUser:', error);
    return null;
  }
}

/**
 * Login simulado con email
 * @param {string} email - Email del usuario
 */
export async function loginWithEmail(email) {
  try {
    console.log(`Iniciando sesión con ${email}`);
    
    // Verificar si ya existe el usuario
    if (!SIMULATED_USERS[email]) {
      console.log(`Usuario ${email} no existe, creando nuevo usuario`);
      
      // Crear un nuevo usuario simulado con ID único
      const newUserId = `user_${Math.random().toString(36).substring(2, 10)}`;
      
      // Generar la wallet y verificar su creación
      let wallet = generateCustodialWallet();
      
      if (!wallet || !wallet.address) {
        console.error('Error crítico: No se pudo generar la wallet custodial');
        
        // Usar wallet de fallback
        wallet = {
          address: '0xFallbackWalletAfterFailure1234567890',
          encryptedPrivateKey: 'fallback_key',
          tokenBalances: {
            eUSD: '100.00',
            BTC: '0.0005',
            ETH: '0.01'
          }
        };
      }
      
      console.log(`Usuario nuevo creado para ${email}:`, {
        userId: newUserId,
        walletAddress: wallet.address
      });
      
      // Crear la estructura de datos completa del usuario
      SIMULATED_USERS[email] = {
        userId: newUserId,
        wallet: wallet,
        balances: { 
          1: 5,  // Usuario nuevo obtiene 5 fracciones en propiedad #1
          2: 3   // Usuario nuevo obtiene 3 fracciones en propiedad #2
        },
        claimable: { 
          1: '0.0002', // Usuario nuevo tiene 0.0002 eUSD reclamables en propiedad #1
          2: '0.0001'  // Usuario nuevo tiene 0.0001 eUSD reclamables en propiedad #2
        }
      };
    } else {
      console.log(`Usuario ${email} encontrado en memoria`);
      
      // Si el usuario existe pero no tiene wallet, generarle una
      if (!SIMULATED_USERS[email].wallet) {
        console.log(`Usuario ${email} existe pero no tiene wallet, generando una`);
        
        let wallet = generateCustodialWallet();
        
        // Verificar que la wallet se creó correctamente
        if (!wallet || !wallet.address) {
          console.error('Error crítico: No se pudo generar la wallet custodial para usuario existente');
          
          // Usar wallet de fallback
          SIMULATED_USERS[email].wallet = {
            address: '0xFallbackWalletForExistingUser1234567890',
            encryptedPrivateKey: 'fallback_key',
            tokenBalances: {
              eUSD: '100.00',
              BTC: '0.0005',
              ETH: '0.01'
            }
          };
        } else {
          SIMULATED_USERS[email].wallet = wallet;
        }
      }
    }
    
    // Verificar que el usuario tenga wallet antes de guardarlo
    if (!SIMULATED_USERS[email].wallet) {
      console.error(`Error crítico: Usuario ${email} no tiene wallet antes de guardar`);
      
      // Asignar wallet de emergencia
      SIMULATED_USERS[email].wallet = {
        address: '0xEmergencyWalletBeforeSave1234567890',
        encryptedPrivateKey: 'emergency_key',
        tokenBalances: {
          eUSD: '100.00',
          BTC: '0.0005',
          ETH: '0.01'
        }
      };
    }
    
    // Guardar usuario completo en localStorage
    saveUserToLocalStorage(email, SIMULATED_USERS[email]);
    
    // Verificar que se guardó correctamente
    const userFromStorage = localStorage.getItem('fractea_user_data');
    if (userFromStorage) {
      try {
        const parsed = JSON.parse(userFromStorage);
        console.log(`Verificación después de guardar:`, {
          tieneWallet: !!parsed.wallet,
          direccionWallet: parsed.wallet?.address
        });
      } catch (e) {
        console.error('Error al verificar el guardado:', e);
      }
    }
    
    return SIMULATED_USERS[email];
  } catch (error) {
    console.error('Error en loginWithEmail:', error);
    throw error;
  }
}

/**
 * Cerrar sesión
 */
export function logout() {
  localStorage.removeItem('fractea_user_email');
  localStorage.removeItem('fractea_user_id');
  localStorage.removeItem('fractea_user_data');
}

/**
 * Creates a read-only provider for querying blockchain data
 */
export function getReadProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

/**
 * Creates a read-only contract instance
 */
export function getReadOnlyContract() {
  const provider = getReadProvider();
  return new ethers.Contract(FRACTEA_NFT_ADDRESS, FRACTEA_NFT_ABI, provider);
}

/**
 * Creates a contract instance for write operations using wallet
 * @param {Object} wallet - Ethers wallet or web3 provider from MetaMask
 */
export function getWriteContract(wallet) {
  return new ethers.Contract(FRACTEA_NFT_ADDRESS, FRACTEA_NFT_ABI, wallet);
}

/**
 * Get property details from the contract (real blockchain data)
 * @param {number} propertyId - ID of the property
 */
export async function getPropertyDetails(propertyId) {
  const contract = getReadOnlyContract();
  try {
    const property = await contract.properties(propertyId);
    
    return {
      id: propertyId,
      totalSupply: Number(property.totalSupply),
      totalRent: ethers.formatEther(property.totalRent),
      createdAt: new Date(Number(property.createdAt) * 1000),
    };
  } catch (error) {
    console.error("Error getting property details:", error);
    // Fallback para demo usando datos simulados
    if (SIMULATED_PROPERTIES[propertyId]) {
      return {
        id: propertyId,
        ...SIMULATED_PROPERTIES[propertyId]
      };
    }
    
    // Datos por defecto si no hay información específica
    return {
      id: propertyId,
      totalSupply: 100,
      totalRent: "0.0",
      createdAt: new Date()
    };
  }
}

/**
 * Get user's balance for a property (simulated)
 * @param {string} email - User's email
 * @param {number} propertyId - ID of the property
 */
export async function getUserBalance(email, propertyId) {
  const user = ensureUser(email, 'getUserBalance');
  
  if (!user || !user.balances || !user.balances[propertyId]) {
    return 0;
  }
  
  return user.balances[propertyId];
}

/**
 * Get claimable rent amount (simulated)
 * @param {number} propertyId - ID of the property
 * @param {string} email - User's email
 */
export async function getClaimableRent(propertyId, email) {
  const user = ensureUser(email, 'getClaimableRent');
  
  if (!user || !user.claimable || !user.claimable[propertyId]) {
    return '0';
  }
  
  return user.claimable[propertyId];
}

/**
 * Simulates claiming rent via relayer
 * @param {number} propertyId - ID of the property
 * @param {string} email - User's email
 */
export async function claimRentViaRelayer(propertyId, email) {
  // Simular una espera de procesamiento de blockchain
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log('Intentando reclamar renta:', { propertyId, email });
  
  if (!email) {
    console.error('Error: email no proporcionado para reclamar renta');
    throw new Error('Email no proporcionado para reclamar renta');
  }
  
  // Obtener o reconstruir el usuario desde localStorage primero (más actualizado)
  let user = null;
  
  // Intentar obtener datos directamente de localStorage primero
  const storedEmail = localStorage.getItem('fractea_user_email');
  const storedUserData = localStorage.getItem('fractea_user_data');
  
  if (storedEmail === email && storedUserData) {
    try {
      user = JSON.parse(storedUserData);
      console.log('Usuario recuperado de localStorage para reclamar renta:', user);
      
      // Actualizar SIMULATED_USERS con los datos más recientes
      SIMULATED_USERS[email] = user;
    } catch (error) {
      console.error('Error al parsear datos de usuario para reclamar renta:', error);
    }
  }
  
  // Si no pudimos obtener el usuario de localStorage, usar ensureUser
  if (!user) {
    console.log('Utilizando ensureUser como fallback para reclamar renta');
    user = ensureUser(email, 'claimRentViaRelayer');
  }
  
  if (!user) {
    console.error('No se pudo procesar la reclamación de renta: usuario no encontrado');
    throw new Error("No se pudo procesar la reclamación de renta: usuario no encontrado");
  }
  
  // Asegurar que existe la estructura de datos
  if (!user.claimable) {
    user.claimable = {};
  }
  
  // Reiniciar el monto reclamable a 0
  const claimed = user.claimable[propertyId] || '0';
  user.claimable[propertyId] = '0';
  
  // Guardar los cambios en localStorage
  saveUserToLocalStorage(email, user);
  
  // Verificar que se guardó correctamente
  const verificationData = localStorage.getItem('fractea_user_data');
  if (verificationData) {
    try {
      const verifiedUser = JSON.parse(verificationData);
      console.log('Verificación post-reclamo:', {
        guardadoCorrectamente: !!verifiedUser && 
                              !!verifiedUser.claimable && 
                              verifiedUser.claimable[propertyId] === '0',
        claimableEsperado: '0',
        claimableGuardado: verifiedUser.claimable ? verifiedUser.claimable[propertyId] : 'no existe'
      });
    } catch (error) {
      console.error('Error al verificar datos post-reclamo:', error);
    }
  } else {
    console.error('Error crítico: No se encontraron datos en localStorage después de guardar reclamo');
  }
  
  // Guardar en el historial de rentas
  if (parseFloat(claimed) > 0) {
    saveRentHistory(email, propertyId, claimed);
  }
  
  console.log('Renta reclamada exitosamente:', {
    propertyId,
    claimed,
    nuevoBalance: user.claimable[propertyId]
  });
  
  // Actualizar SIMULATED_USERS para asegurar sincronización
  SIMULATED_USERS[email] = user;
  
  return {
    success: true,
    amount: claimed,
    txHash: '0x' + Math.random().toString(16).substring(2, 34)
  };
}

/**
 * Simula una inversión en una propiedad
 * @param {number} propertyId - ID de la propiedad
 * @param {string} email - Email del usuario
 * @param {number} amount - Monto en USD
 */
export async function investInProperty(propertyId, email, amount) {
  // Simular delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Intentando invertir:', { propertyId, email, amount });
  
  if (!email) {
    console.error('Error: email no proporcionado para inversión');
    throw new Error('Email no proporcionado para inversión');
  }
  
  // Obtener o reconstruir el usuario desde localStorage primero (más actualizado)
  let user = null;
  
  // Intentar obtener datos directamente de localStorage primero
  const storedEmail = localStorage.getItem('fractea_user_email');
  const storedUserData = localStorage.getItem('fractea_user_data');
  
  if (storedEmail === email && storedUserData) {
    try {
      user = JSON.parse(storedUserData);
      console.log('Usuario recuperado de localStorage para inversión:', user);
      
      // Actualizar SIMULATED_USERS con los datos más recientes
      SIMULATED_USERS[email] = user;
    } catch (error) {
      console.error('Error al parsear datos de usuario para inversión:', error);
    }
  }
  
  // Si no pudimos obtener el usuario de localStorage, usar ensureUser
  if (!user) {
    console.log('Utilizando ensureUser como fallback para inversión');
    user = ensureUser(email, 'investInProperty');
  }
  
  if (!user) {
    console.error(`Usuario no encontrado para inversión (email: ${email})`);
    throw new Error(`Usuario no encontrado (email: ${email})`);
  }
  
  // Fracción precio para cada propiedad (datos simulados)
  const fractionPrices = {
    1: 10, // $10 USD
    2: 15  // $15 USD
  };
  
  const fractionPrice = fractionPrices[propertyId] || 10;
  const fractionCount = Math.floor(amount / fractionPrice);
  
  // Asegurar que existe la estructura de datos
  if (!user.balances) {
    user.balances = {};
  }
  
  // Actualizar balance
  if (!user.balances[propertyId]) {
    user.balances[propertyId] = fractionCount;
  } else {
    user.balances[propertyId] += fractionCount;
  }
  
  // Guardar los cambios en localStorage
  saveUserToLocalStorage(email, user);
  
  // Verificar que se guardó correctamente
  const verificationData = localStorage.getItem('fractea_user_data');
  if (verificationData) {
    try {
      const verifiedUser = JSON.parse(verificationData);
      console.log('Verificación post-inversión:', {
        guardadoCorrectamente: !!verifiedUser && 
                              !!verifiedUser.balances && 
                              verifiedUser.balances[propertyId] === user.balances[propertyId],
        balanceEsperado: user.balances[propertyId],
        balanceGuardado: verifiedUser.balances ? verifiedUser.balances[propertyId] : 'no existe'
      });
    } catch (error) {
      console.error('Error al verificar datos post-inversión:', error);
    }
  } else {
    console.error('Error crítico: No se encontraron datos en localStorage después de guardar');
  }
  
  console.log('Inversión exitosa:', {
    propertyId,
    fractionCount,
    newBalance: user.balances[propertyId]
  });
  
  // Actualizar SIMULATED_USERS para asegurar sincronización
  SIMULATED_USERS[email] = user;
  
  return {
    success: true,
    propertyId,
    addedFractions: fractionCount,
    totalFractions: user.balances[propertyId],
    txHash: '0x' + Math.random().toString(16).substring(2, 34)
  };
}

/**
 * Connect to wallet (MetaMask)
 */
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  // Request account access
  const accounts = await window.ethereum.request({ 
    method: 'eth_requestAccounts' 
  });

  // Check if connected to the correct network
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (parseInt(chainId, 16) !== FRACTEA_NETWORK_ID) {
    throw new Error(`Please connect to Mantle Sepolia network (Chain ID: ${FRACTEA_NETWORK_ID})`);
  }

  // Create provider and signer
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  return {
    address: accounts[0],
    signer
  };
}

/**
 * Guarda un nuevo registro en el historial de rentas de un usuario para una propiedad
 * @param {string} email - Email del usuario
 * @param {number} propertyId - ID de la propiedad
 * @param {string} amount - Monto reclamado en ETH
 * @returns {Object} El registro añadido al historial
 */
export function saveRentHistory(email, propertyId, amount) {
  try {
    if (!email || !propertyId || !amount) {
      console.error('Error: parámetros incompletos para saveRentHistory', { email, propertyId, amount });
      return null;
    }
    
    const newRecord = {
      date: new Date(),
      amount,
      status: 'completed'
    };
    
    // Recuperar historial existente
    const currentHistory = getRentHistory(email, propertyId);
    
    // Añadir el nuevo registro al principio del array
    const updatedHistory = [newRecord, ...currentHistory];
    
    // Obtener o crear el objeto completo de historiales
    let allHistory = {};
    const storedHistory = localStorage.getItem('fractea_user_rent_history');
    
    if (storedHistory) {
      try {
        allHistory = JSON.parse(storedHistory);
      } catch (error) {
        console.error('Error al parsear historial de rentas existente:', error);
        allHistory = {};
      }
    }
    
    // Asegurar que existe la estructura para el usuario
    if (!allHistory[email]) {
      allHistory[email] = {};
    }
    
    // Guardar el historial actualizado
    allHistory[email][propertyId] = updatedHistory;
    
    // Guardar en localStorage
    localStorage.setItem('fractea_user_rent_history', JSON.stringify(allHistory));
    
    console.log('Historial de rentas actualizado:', {
      email,
      propertyId,
      newRecord,
      historialActualizado: updatedHistory
    });
    
    return newRecord;
  } catch (error) {
    console.error('Error inesperado al guardar historial de rentas:', error);
    return null;
  }
}

/**
 * Recupera el historial de rentas de un usuario para una propiedad
 * @param {string} email - Email del usuario
 * @param {number} propertyId - ID de la propiedad
 * @returns {Array} Array de registros de historial
 */
export function getRentHistory(email, propertyId) {
  try {
    if (!email || !propertyId) {
      console.warn('Parámetros incompletos para getRentHistory', { email, propertyId });
      return [];
    }
    
    const storedHistory = localStorage.getItem('fractea_user_rent_history');
    
    if (!storedHistory) {
      // Si no hay historial almacenado, devolver array vacío
      return [];
    }
    
    try {
      const allHistory = JSON.parse(storedHistory);
      
      // Verificar si existe historial para este usuario y propiedad
      if (!allHistory[email] || !allHistory[email][propertyId]) {
        return [];
      }
      
      // Convertir strings de fecha a objetos Date
      const history = allHistory[email][propertyId].map(record => ({
        ...record,
        date: new Date(record.date)
      }));
      
      return history;
    } catch (error) {
      console.error('Error al parsear historial de rentas:', error);
      return [];
    }
  } catch (error) {
    console.error('Error inesperado al recuperar historial de rentas:', error);
    return [];
  }
}

/**
 * Obtiene el balance de un token específico para un usuario
 * @param {string} email - Email del usuario
 * @param {string} tokenSymbol - Símbolo del token (eUSD, BTC, ETH, etc.)
 * @returns {string} Balance del token
 */
export async function getTokenBalance(email, tokenSymbol) {
  const user = ensureUser(email, 'getTokenBalance');
  
  if (!user || !user.wallet || !user.wallet.tokenBalances || !user.wallet.tokenBalances[tokenSymbol]) {
    return '0.00';
  }
  
  return user.wallet.tokenBalances[tokenSymbol];
}

/**
 * Simula un depósito de tokens a la wallet custodial del usuario
 * @param {string} email - Email del usuario
 * @param {string} tokenSymbol - Símbolo del token a depositar
 * @param {string} amount - Cantidad a depositar
 * @returns {Object} Resultado de la operación
 */
export async function depositTokens(email, tokenSymbol, amount) {
  // Simular delay de procesamiento
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = ensureUser(email, 'depositTokens');
  
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  
  // Asegurar que la wallet y el balance de tokens existan
  if (!user.wallet) {
    user.wallet = generateCustodialWallet();
  }
  
  if (!user.wallet.tokenBalances) {
    user.wallet.tokenBalances = {};
  }
  
  if (!user.wallet.tokenBalances[tokenSymbol]) {
    user.wallet.tokenBalances[tokenSymbol] = '0.00';
  }
  
  // Convertir a número para hacer la suma
  const currentBalance = parseFloat(user.wallet.tokenBalances[tokenSymbol]);
  const amountToAdd = parseFloat(amount);
  
  // Actualizar el balance
  user.wallet.tokenBalances[tokenSymbol] = (currentBalance + amountToAdd).toFixed(2);
  
  // Guardar en localStorage
  saveUserToLocalStorage(email, user);
  
  // Actualizar en memoria
  SIMULATED_USERS[email] = user;
  
  // Retornar información de la transacción
  const txHash = '0x' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  
  return {
    success: true,
    txHash,
    amount,
    newBalance: user.wallet.tokenBalances[tokenSymbol],
    tokenSymbol,
    timestamp: new Date().toISOString()
  };
}

/**
 * Simula un retiro de tokens de la wallet custodial del usuario
 * @param {string} email - Email del usuario
 * @param {string} tokenSymbol - Símbolo del token a retirar
 * @param {string} amount - Cantidad a retirar
 * @param {string} destination - Dirección de destino o 'bank' para retiro bancario
 * @returns {Object} Resultado de la operación
 */
export async function withdrawTokens(email, tokenSymbol, amount, destination) {
  // Simular delay de procesamiento
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const user = ensureUser(email, 'withdrawTokens');
  
  if (!user || !user.wallet || !user.wallet.tokenBalances) {
    throw new Error('Wallet de usuario no encontrada');
  }
  
  // Obtener el balance actual
  const currentBalance = parseFloat(user.wallet.tokenBalances[tokenSymbol] || '0.00');
  const amountToWithdraw = parseFloat(amount);
  
  // Verificar que haya suficientes fondos
  if (currentBalance < amountToWithdraw) {
    throw new Error(`Balance insuficiente. Tienes ${currentBalance} ${tokenSymbol}`);
  }
  
  // Actualizar el balance
  user.wallet.tokenBalances[tokenSymbol] = (currentBalance - amountToWithdraw).toFixed(2);
  
  // Guardar en localStorage
  saveUserToLocalStorage(email, user);
  
  // Actualizar en memoria
  SIMULATED_USERS[email] = user;
  
  // Retornar información de la transacción
  const txHash = destination.startsWith('0x') 
    ? '0x' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
    : 'BANK_TRANSFER_' + Math.random().toString(36).substring(2, 10);
  
  return {
    success: true,
    txHash,
    amount,
    destination,
    newBalance: user.wallet.tokenBalances[tokenSymbol],
    tokenSymbol,
    timestamp: new Date().toISOString()
  };
}

/**
 * Transfiere tokens entre usuarios o hacia una wallet externa
 * @param {string} fromEmail - Email del usuario que envía
 * @param {string} tokenSymbol - Símbolo del token a transferir
 * @param {string} amount - Cantidad a transferir
 * @param {string} toAddress - Dirección de destino o email de usuario
 * @returns {Object} Resultado de la operación
 */
export async function transferTokens(fromEmail, tokenSymbol, amount, toAddress) {
  // Simular delay de procesamiento
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Verificar si el destino es una dirección o un email
  const isAddress = toAddress.startsWith('0x');
  const isEmail = toAddress.includes('@');
  
  // Si es una dirección externa, usar withdrawTokens
  if (isAddress) {
    return await withdrawTokens(fromEmail, tokenSymbol, amount, toAddress);
  }
  
  // Si es un email, realizar transferencia interna
  if (isEmail) {
    // Retirar los fondos del emisor
    const withdrawResult = await withdrawTokens(fromEmail, tokenSymbol, amount, 'internal_transfer');
    
    // Depositar los fondos al receptor
    const depositResult = await depositTokens(toAddress, tokenSymbol, amount);
    
    return {
      success: true,
      fromEmail,
      toEmail: toAddress,
      amount,
      tokenSymbol,
      txHash: 'INTERNAL_' + Math.random().toString(36).substring(2, 10),
      timestamp: new Date().toISOString()
    };
  }
  
  throw new Error('Destino inválido. Debe ser una dirección o un email');
} 