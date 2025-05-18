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
      address: '0x2cbf7D1d665CcA8d11845D814e3C11e390E94789', // Dirección fija para demo
      encryptedPrivateKey: encryptPrivateKey('0x63d0f3729e0117bb3f825b21c2c1f0d2d2dfa6793a656f7ef83b3c1ddf53a7b7'),
      tokenBalances: {
        eUSD: '100.00',
        BTC: '0.0005',
        ETH: '0.01',
        USDC: '0.00',
        MNT: '2.63393255248'
      }
    },
    balances: {
      1: 20, // 20 fracciones de la propiedad #1
      2: 10  // 10 fracciones de la propiedad #2
    },
    claimable: {
      1: '0.0002', // 0.0002 eUSD reclamables de la propiedad #1
      2: '0.0001'  // 0.0001 eUSD reclamables de la propiedad #2
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
            ETH: '0.01',
            MNT: '20.0002'
          }
        };
      } else {
        // Si la wallet se generó correctamente, asegurarnos de que tenga balances iniciales
        if (!wallet.tokenBalances) {
          wallet.tokenBalances = {};
        }
        
        // Asegurarnos de que tenga un balance inicial de MNT para poder hacer demostraciones
        if (!wallet.tokenBalances.MNT) {
          wallet.tokenBalances.MNT = '20.0002';
        }
        
        // Asegurarnos de que tenga balances iniciales de otros tokens
        if (!wallet.tokenBalances.eUSD) wallet.tokenBalances.eUSD = '100.00';
        if (!wallet.tokenBalances.BTC) wallet.tokenBalances.BTC = '0.0005';
        if (!wallet.tokenBalances.ETH) wallet.tokenBalances.ETH = '0.01';
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
      
      // Caso especial: si es el usuario demo, establecer balances iniciales altos
      if (email === 'demo@fractea.app') {
        SIMULATED_USERS[email].wallet.tokenBalances = {
          MNT: '20.0002',
          eUSD: '500.00',
          BTC: '0.002',
          ETH: '0.5'
        };
      }
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
              ETH: '0.01',
              MNT: '20.0002'
            }
          };
        } else {
          // Configurar balances iniciales
          if (!wallet.tokenBalances) {
            wallet.tokenBalances = {};
          }
          
          // Asegurar que tenga MNT
          if (!wallet.tokenBalances.MNT) {
            wallet.tokenBalances.MNT = '20.0002';
          }
          
          // Balances iniciales de otros tokens
          if (!wallet.tokenBalances.eUSD) wallet.tokenBalances.eUSD = '100.00';
          if (!wallet.tokenBalances.BTC) wallet.tokenBalances.BTC = '0.0005';
          if (!wallet.tokenBalances.ETH) wallet.tokenBalances.ETH = '0.01';
          
          SIMULATED_USERS[email].wallet = wallet;
          
          // Caso especial: si es el usuario demo, establecer balances iniciales altos
          if (email === 'demo@fractea.app') {
            SIMULATED_USERS[email].wallet.tokenBalances = {
              MNT: '20.0002',
              eUSD: '500.00',
              BTC: '0.002',
              ETH: '0.5'
            };
          }
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
 * Simula una inversión en una propiedad y minta tokens ERC-1155 al wallet custodial
 * @param {number} propertyId - ID de la propiedad
 * @param {string} email - Email del usuario
 * @param {number} amount - Monto en USD
 */
export async function investInProperty(propertyId, email, amount) {
  // Simular delay para UI/UX
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Iniciando inversión:', { propertyId, email, amount });
  
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
  
  // Verificar que el usuario tenga wallet
  if (!user.wallet || !user.wallet.address) {
    console.error('El usuario no tiene wallet custodial configurada');
    throw new Error('No se encontró wallet custodial para el usuario');
  }
  
  // Fracción precio para cada propiedad (datos simulados)
  const fractionPrices = {
    1: 10, // $10 USD
    2: 15  // $15 USD
  };
  
  const fractionPrice = fractionPrices[propertyId] || 10;
  const fractionCount = Math.floor(amount / fractionPrice);
  
  let txHash;
  let txReceipt;
  
  // Interactuar con el contrato ERC-1155 (FracteaNFT)
  try {
    console.log(`Mintando ${fractionCount} fracciones ERC-1155 de la propiedad #${propertyId}`);
    
    // Obtener la dirección de la wallet custodial del usuario
    const custodialWalletAddress = user.wallet.address;
    console.log(`Wallet custodial destino: ${custodialWalletAddress}`);
    
    // Verificar si estamos en modo producción o desarrollo
    const isProduction = process.env.NODE_ENV === 'production';
    
    // En modo producción, intentar interactuar con la blockchain real
    if (isProduction) {
      try {
        // Importar servicios necesarios
        const { getMantleProvider } = await import('../services/blockchain/mantleProvider');
        
        // Obtener provider para Mantle Sepolia
        const provider = getMantleProvider('SEPOLIA');
        
        // Obtener la clave privada del relayer desde una variable de entorno
        // Esta es una wallet de servicio que pagaría el gas de las transacciones
        // NOTA: En producción, esta clave estaría segura en el backend
        const relayerPrivateKey = process.env.NEXT_PUBLIC_RELAYER_KEY || decryptPrivateKey(user.wallet.encryptedPrivateKey);
        
        if (!relayerPrivateKey) {
          throw new Error('No se encontró la clave del relayer para realizar la transacción');
        }
        
        // Crear signer para el relayer
        const relayerWallet = new ethers.Wallet(relayerPrivateKey, provider);
        
        // Crear instancia del contrato con el signer
        const contract = new ethers.Contract(
          FRACTEA_NFT_ADDRESS,
          FRACTEA_NFT_ABI,
          relayerWallet
        );
        
        console.log('Enviando transacción para mintar fracciones ERC-1155...');
        
        // Verificar balance de gas del relayer
        const relayerBalance = await provider.getBalance(relayerWallet.address);
        console.log(`Balance del relayer: ${ethers.formatEther(relayerBalance)} MNT`);
        
        // Estimar gas
        let gasEstimate;
        try {
          gasEstimate = await contract.mintFraction.estimateGas(
            custodialWalletAddress,
            propertyId,
            fractionCount
          );
          console.log(`Gas estimado: ${gasEstimate.toString()}`);
        } catch (gasError) {
          console.warn('Error al estimar gas:', gasError);
          gasEstimate = ethers.BigInt('500000'); // Valor por defecto
        }
        
        // Enviar transacción con parámetros optimizados para Mantle
        const tx = await contract.mintFraction(
          custodialWalletAddress,
          propertyId,
          fractionCount,
          {
            gasLimit: gasEstimate * ethers.BigInt('120') / ethers.BigInt('100'), // +20% margen
            maxFeePerGas: ethers.parseUnits('1.04', 'gwei'),
            maxPriorityFeePerGas: ethers.parseUnits('1', 'gwei')
          }
        );
        
        console.log('Transacción enviada:', tx.hash);
        txHash = tx.hash;
        
        // Esperar confirmación - con timeout para evitar bloqueos
        const txPromise = tx.wait();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout esperando confirmación')), 30000) // 30 segundos
        );
        
        txReceipt = await Promise.race([txPromise, timeoutPromise])
          .catch(error => {
            console.warn('Error o timeout esperando confirmación:', error);
            // Continuar incluso si hay timeout, la tx puede confirmarse después
            return null;
          });
        
        if (txReceipt) {
          console.log('Transacción confirmada en bloque:', txReceipt.blockNumber);
        } else {
          console.log('La transacción fue enviada pero aún no se ha confirmado');
        }
      } catch (blockchainError) {
        console.error('Error en interacción con blockchain:', blockchainError);
        console.log('Fallback a simulación de minteo');
        
        // Fallback a simulación
        txHash = '0x' + Math.random().toString(16).substring(2, 34);
      }
    } else {
      // Para desarrollo y testing, simular una transacción exitosa
      txHash = '0x' + Math.random().toString(16).substring(2, 34);
      console.log('Hash de transacción simulado (desarrollo):', txHash);
    }
    
    // Emitir evento personalizado para debugging/monitoreo
    const customEvent = new CustomEvent('fractea:fraction_minted', {
      detail: {
        address: custodialWalletAddress,
        propertyId: propertyId,
        amount: fractionCount,
        txHash: txHash,
        environment: isProduction ? 'production' : 'development'
      }
    });
    window.dispatchEvent(customEvent);
    
  } catch (error) {
    console.error('Error al mintar fracciones ERC-1155:', error);
    throw new Error(`Error al mintar fracciones: ${error.message}`);
  }
  
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
        balanceGuardado: verifiedUser.balances ? verifiedUser.balances[propertyId] : 'no existe',
        erc1155Mintado: fractionCount
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
    newBalance: user.balances[propertyId],
    txHash
  });
  
  // Actualizar SIMULATED_USERS para asegurar sincronización
  SIMULATED_USERS[email] = user;
  
  return {
    success: true,
    propertyId,
    addedFractions: fractionCount,
    totalFractions: user.balances[propertyId],
    txHash: txHash,
    tokenType: 'ERC-1155',
    tokenId: propertyId
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
 * Sincroniza el balance de la wallet custodial con el balance real en la blockchain
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Resultado de la sincronización
 */
export async function syncWalletBalance(email) {
  try {
    console.log('Sincronizando balance con blockchain para:', email);
    
    // Obtener datos del usuario
    const user = ensureUser(email, 'syncWalletBalance');
    
    if (!user || !user.wallet || !user.wallet.address) {
      console.error('No se pudo obtener la wallet del usuario para sincronizar');
      throw new Error('Wallet de usuario no encontrada');
    }
    
    // Importar servicios necesarios
    const { getNativeBalance, getMantleProvider } = await import('../services/blockchain/mantleProvider');
    
    // Obtener balance real de la blockchain para MNT
    const realMntBalance = await getNativeBalance(user.wallet.address, 'SEPOLIA');
    console.log('Balance real en blockchain:', realMntBalance, 'MNT');
    
    // Verificar si la wallet es válida intentando obtener el balance mediante el provider
    const provider = getMantleProvider('SEPOLIA');
    const rawBalance = await provider.getBalance(user.wallet.address);
    const formattedBalance = ethers.formatEther(rawBalance);
    
    console.log('Balance verificado con provider:', formattedBalance, 'MNT');
    
    // Comprobar si los valores son consistentes
    if (parseFloat(realMntBalance) !== parseFloat(formattedBalance)) {
      console.warn('Inconsistencia entre los balances obtenidos:', {
        serviceBalance: realMntBalance,
        providerBalance: formattedBalance
      });
      // Usar el balance del provider como fuente de verdad en caso de discrepancia
      user.wallet.tokenBalances['MNT'] = formattedBalance;
    } else {
      // Actualizar balance en el sistema local
      if (!user.wallet.tokenBalances) {
        user.wallet.tokenBalances = {};
      }
      
      // Guardar balance actualizado
      user.wallet.tokenBalances['MNT'] = realMntBalance;
    }
    
    // Guardar en localStorage
    saveUserToLocalStorage(email, user);
    
    // Actualizar en memoria
    SIMULATED_USERS[email] = user;
    
    console.log('Balance sincronizado correctamente:', user.wallet.tokenBalances['MNT'], 'MNT');
    
    return {
      success: true,
      address: user.wallet.address,
      tokenBalances: user.wallet.tokenBalances
    };
  } catch (error) {
    console.error('Error al sincronizar balance con blockchain:', error);
    throw error;
  }
}

/**
 * Maneja depósitos de tokens a la wallet custodial del usuario.
 * Ahora incluye una opción para realizar depósitos reales desde una wallet externa.
 * @param {string} email - Email del usuario
 * @param {string} tokenSymbol - Símbolo del token a depositar
 * @param {string} amount - Cantidad a depositar
 * @param {Object} options - Opciones adicionales como privateKey para transacciones reales
 * @returns {Object} Resultado de la operación
 */
export async function depositTokens(email, tokenSymbol, amount, options = {}) {
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
  
  // Si se proporciona una clave privada, realizar una transacción real desde una wallet externa
  if (options.privateKey) {
    try {
      console.log('Iniciando depósito real desde wallet externa');
      
      // Importar servicios de transacciones
      const { getMantleProvider } = await import('../services/blockchain/mantleProvider');
      
      // Conectar a Mantle Sepolia
      const provider = getMantleProvider('SEPOLIA');
      
      // Formatear la clave con 0x si es necesario
      const formattedKey = options.privateKey.startsWith('0x') 
        ? options.privateKey 
        : `0x${options.privateKey}`;
      
      // Crear instancia de la wallet externa
      const externalWallet = new ethers.Wallet(formattedKey, provider);
      
      // Dirección de la wallet custodial como destino
      const custodialAddress = user.wallet.address;
      
      // Crear transacción
      const tx = {
        to: custodialAddress,
        value: ethers.parseEther(amount)
      };
      
      // Estimar gas para la transacción
      try {
        const fromAddress = await externalWallet.getAddress();
        const estimatedGas = await provider.estimateGas({
          from: fromAddress,
          to: custodialAddress,
          value: tx.value
        });
        
        // Añadir 20% de margen de seguridad
        tx.gasLimit = estimatedGas * 120n / 100n;
        console.log(`Gas estimado para depósito: ${tx.gasLimit.toString()}`);
      } catch (error) {
        console.warn('Error al estimar gas para depósito, usando valor predeterminado:', error);
        tx.gasLimit = 100000n;
      }
      
      // Enviar la transacción real
      console.log('Enviando transacción de depósito...');
      const txResponse = await externalWallet.sendTransaction(tx);
      console.log('Transacción enviada:', txResponse.hash);
      
      // Esperar a que se confirme
      console.log('Esperando confirmación...');
      const receipt = await txResponse.wait();
      console.log('Depósito confirmado en bloque:', receipt.blockNumber);
      
      // Convertir a número para hacer la suma
      const currentBalance = parseFloat(user.wallet.tokenBalances[tokenSymbol]);
      const amountToAdd = parseFloat(amount);
      
      // Actualizar el balance
      user.wallet.tokenBalances[tokenSymbol] = (currentBalance + amountToAdd).toFixed(2);
      
      // Guardar en localStorage
      saveUserToLocalStorage(email, user);
      
      // Actualizar en memoria
      SIMULATED_USERS[email] = user;
      
      return {
        success: true,
        txHash: txResponse.hash,
        amount,
        newBalance: user.wallet.tokenBalances[tokenSymbol],
        tokenSymbol,
        timestamp: new Date().toISOString(),
        blockNumber: receipt.blockNumber,
        network: 'SEPOLIA'
      };
    } catch (error) {
      console.error('Error al realizar depósito real:', error);
      throw new Error(`Error en depósito blockchain: ${error.message}`);
    }
  } 
  // Si no hay clave privada, simular el depósito como antes
  else {
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Convertir a número para hacer la suma
    const currentBalance = parseFloat(user.wallet.tokenBalances[tokenSymbol]);
    const amountToAdd = parseFloat(amount);
    
    // Actualizar el balance
    user.wallet.tokenBalances[tokenSymbol] = (currentBalance + amountToAdd).toFixed(2);
    
    // Guardar en localStorage
    saveUserToLocalStorage(email, user);
    
    // Actualizar en memoria
    SIMULATED_USERS[email] = user;
    
    // Retornar información de la transacción simulada
    const txHash = '0x' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    
    return {
      success: true,
      txHash,
      amount,
      newBalance: user.wallet.tokenBalances[tokenSymbol],
      tokenSymbol,
      timestamp: new Date().toISOString(),
      network: 'SIMULATED'
    };
  }
}

/**
 * Simula un retiro de tokens de la wallet custodial del usuario.
 * Para direcciones de blockchain, ahora usa transacciones reales en Mantle Sepolia.
 * @param {string} email - Email del usuario
 * @param {string} tokenSymbol - Símbolo del token a retirar
 * @param {string} amount - Cantidad a retirar
 * @param {string} destination - Dirección de destino o 'bank' para retiro bancario
 * @returns {Object} Resultado de la operación
 */
export async function withdrawTokens(email, tokenSymbol, amount, destination) {
  // Obtener el usuario
  const user = ensureUser(email, 'withdrawTokens');
  
  if (!user || !user.wallet || !user.wallet.tokenBalances) {
    throw new Error('Wallet de usuario no encontrada');
  }
  
  // Para transacciones blockchain, sincronizar balance primero
  if (destination && destination.startsWith('0x')) {
    try {
      console.log('Sincronizando balance real de blockchain antes de retirar');
      await syncWalletBalance(email);
      
      // Obtener el usuario actualizado después de la sincronización
      const updatedUser = ensureUser(email, 'withdrawTokens-afterSync');
      if (updatedUser && updatedUser.wallet && updatedUser.wallet.tokenBalances) {
        user.wallet.tokenBalances = updatedUser.wallet.tokenBalances;
      }
    } catch (syncError) {
      console.warn('Error al sincronizar balance, continuando con balance local:', syncError);
      // Continuar con el balance almacenado localmente
    }
  }
  
  // Obtener el balance actual
  const currentBalance = parseFloat(user.wallet.tokenBalances[tokenSymbol] || '0.00');
  const amountToWithdraw = parseFloat(amount);
  
  console.log(`Balance actual para retirar: ${currentBalance} ${tokenSymbol}, monto a retirar: ${amountToWithdraw}`);
  
  // Verificar que haya suficientes fondos
  if (currentBalance < amountToWithdraw) {
    throw new Error(`Balance insuficiente. Tienes ${currentBalance} ${tokenSymbol}`);
  }
  
  // Demo mode - si el usuario es el de demo
  const isDemoUser = email === 'demo@fractea.app';
  
  let txHash;
  
  // Si el destino es una dirección de blockchain, realizar transacción real
  if (destination && destination.startsWith('0x')) {
    try {
      console.log('Iniciando retiro real a blockchain:', { destination, amount });
      
      // Obtener la clave privada
      const privateKey = decryptPrivateKey(user.wallet.encryptedPrivateKey);
      
      // Verificar que tenemos la clave privada correcta
      console.log('Usando clave privada para transacción (oculta por seguridad):', 
        privateKey.substring(0, 6) + '...' + privateKey.substring(privateKey.length - 4));
      
      // Crear una wallet de ethers para verificar que la dirección coincide
      const checkWallet = new ethers.Wallet(privateKey);
      console.log('Verificación de dirección:', {
        configuradaEnUsuario: user.wallet.address,
        generadaDesdePrivateKey: checkWallet.address,
        coincide: checkWallet.address.toLowerCase() === user.wallet.address.toLowerCase()
      });
      
      if (checkWallet.address.toLowerCase() !== user.wallet.address.toLowerCase()) {
        console.error('Error crítico: La clave privada no corresponde a la dirección configurada.');
        console.log('Dirección esperada:', user.wallet.address, 'Dirección obtenida de private key:', checkWallet.address);
        
        // En este punto, la clave privada no corresponde a la dirección de la wallet
        // Esto no debería ocurrir si todo está correctamente generado
        throw new Error('La clave privada no corresponde a la dirección de la wallet. Contacte al soporte técnico.');
      }
      
      // Importar servicios de transacciones
      const { getMantleProvider, getNetworkFeeData } = await import('../services/blockchain/mantleProvider');
      
      // Conectar a Mantle Sepolia
      const provider = getMantleProvider('SEPOLIA');
      const wallet = new ethers.Wallet(privateKey, provider);
      
      // Comprobar si la wallet custodial tiene fondos reales
      const walletBalance = await provider.getBalance(wallet.address);
      const formattedBalance = ethers.formatEther(walletBalance);
      console.log(`Balance real de la wallet ${wallet.address}: ${formattedBalance} MNT`);
      
      // Verificar si hay fondos suficientes para la transacción
      if (parseFloat(formattedBalance) < parseFloat(amount)) {
        if (isDemoUser) {
          console.warn('Usuario demo con fondos insuficientes, realizando simulación en lugar de transacción real');
          // Simular transacción exitosa para demo
          // Actualizar el balance local
          user.wallet.tokenBalances[tokenSymbol] = (currentBalance - amountToWithdraw).toFixed(2);
          
          // Guardar en localStorage
          saveUserToLocalStorage(email, user);
          
          // Actualizar en memoria
          SIMULATED_USERS[email] = user;
          
          // Simulación de hash de transacción
          txHash = 'DEMO_TX_' + Math.random().toString(36).substring(2, 10);
          
          return {
            success: true,
            txHash,
            amount,
            destination,
            newBalance: user.wallet.tokenBalances[tokenSymbol],
            tokenSymbol,
            timestamp: new Date().toISOString(),
            blockNumber: Math.floor(Math.random() * 1000000) + 9000000,
            network: 'SEPOLIA_DEMO'
          };
        } else {
          throw new Error(`Balance insuficiente. Tienes ${formattedBalance} MNT en la blockchain.`);
        }
      }
      
      // SOLUCIÓN: Replicar exactamente la lógica de gas del script test-sepolia-tx-v6.js que funciona
      console.log('Configurando transacción con la lógica exitosa del script de prueba...');
      
      // Definir valores para cada tipo de token basados en transacciones exitosas reales
      const GAS_CONFIG = {
        'MNT': {
          base: 86000000n,       // ~86 millones basado en transacciones exitosas reales
          multiplier: 120n,      // 20% extra como margen de seguridad (igual que el script exitoso)
          baseGasPrice: ethers.parseUnits('1.04', 'gwei'),
          priorityFee: ethers.parseUnits('1', 'gwei')
        },
        'ERC20': {
          base: 130000000n,
          multiplier: 120n,
          baseGasPrice: ethers.parseUnits('1.04', 'gwei'),
          priorityFee: ethers.parseUnits('1', 'gwei')
        },
        'ERC1155': {
          base: 220000000n,
          multiplier: 120n,
          baseGasPrice: ethers.parseUnits('1.04', 'gwei'),
          priorityFee: ethers.parseUnits('1', 'gwei')
        },
        'default': {
          base: 86000000n,
          multiplier: 120n,
          baseGasPrice: ethers.parseUnits('1.04', 'gwei'),
          priorityFee: ethers.parseUnits('1', 'gwei')
        }
      };
      
      // Obtener la configuración para el tipo de token actual
      const gasConfig = GAS_CONFIG[tokenSymbol] || GAS_CONFIG['default'];
      
      // Estimar gas exactamente como lo hace el script exitoso
      let estimatedGas;
      let finalGasLimit;
      
      try {
        // Preparar datos básicos para estimación (igual que el script exitoso)
        const gasEstimationTx = {
          from: wallet.address,
          to: destination,
          value: ethers.parseEther(amount)
        };
        
        console.log('Estimando gas usando la misma estrategia del script exitoso...');
        const initialEstimate = await provider.estimateGas(gasEstimationTx);
        console.log(`Gas estimado por la red: ${initialEstimate.toString()}`);
        
        // Aplicar factor de seguridad (exactamente como el script exitoso)
        finalGasLimit = initialEstimate * gasConfig.multiplier / 100n;
        console.log(`Gas final con ${gasConfig.multiplier}% de margen: ${finalGasLimit.toString()}`);
      } catch (estimationError) {
        console.warn('Error al estimar gas, usando valor base conocido:', estimationError);
        // Usar valores base que funcionaron en transacciones reales
        finalGasLimit = gasConfig.base;
        console.log(`Usando gas base para ${tokenSymbol}: ${finalGasLimit.toString()}`);
      }
      
      // Configurar la transacción exactamente como el script exitoso
      const tx = {
        to: destination,
        value: ethers.parseEther(amount),
        gasLimit: finalGasLimit,
        type: 2,  // EIP-1559
        maxFeePerGas: gasConfig.baseGasPrice,
        maxPriorityFeePerGas: gasConfig.priorityFee
      };
      
      console.log('Configuración final replicando script exitoso:', {
        to: tx.to,
        value: ethers.formatEther(tx.value),
        gasLimit: tx.gasLimit.toString(),
        type: tx.type,
        maxFeePerGas: ethers.formatUnits(tx.maxFeePerGas, 'gwei') + ' gwei',
        maxPriorityFeePerGas: ethers.formatUnits(tx.maxPriorityFeePerGas, 'gwei') + ' gwei'
      });
      
      // Calcular costo estimado para verificar fondos
      const gasCost = tx.gasLimit * tx.maxFeePerGas;
      const totalCost = ethers.parseEther(amount) + gasCost;
      
      console.log('Análisis de costos basado en tx exitosa:', {
        gasLimit: tx.gasLimit.toString(),
        maxFeePerGas: ethers.formatUnits(tx.maxFeePerGas, 'gwei') + ' gwei',
        gasCostEstimado: ethers.formatEther(gasCost) + ' MNT',
        montoTransacción: amount + ' MNT',
        costoTotalEstimado: ethers.formatEther(totalCost) + ' MNT',
        balanceDisponible: formattedBalance + ' MNT'
      });
      
      // Verificar fondos con advertencia
      if (walletBalance < totalCost) {
        const errorMsg = `Balance insuficiente para cubrir la transacción y el gas. Tienes ${formattedBalance} MNT. Necesitas al menos ${ethers.formatEther(totalCost)} MNT. Obtén MNT gratuito en: https://faucet.sepolia.mantle.xyz`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      // Enviar la transacción exactamente igual a la exitosa
      console.log('Enviando transacción con parámetros de tx exitosa...');
      
      try {
        const txResponse = await wallet.sendTransaction(tx);
        console.log('¡Transacción enviada exitosamente!', txResponse.hash);
        
        // Actualizar el balance local después de la transacción exitosa
        // Sincronizar nuevamente para tener el balance actualizado
        await syncWalletBalance(email);
        
        // Obtener el balance actualizado
        const updatedUserAfterTx = ensureUser(email, 'withdrawTokens-afterTx');
        const newBalance = updatedUserAfterTx.wallet.tokenBalances[tokenSymbol];
        
        // Construir el resultado
        return {
          success: true,
          txHash: txResponse.hash,
          amount,
          destination,
          newBalance: newBalance,
          tokenSymbol,
          timestamp: new Date().toISOString(),
          blockNumber: txResponse.blockNumber,
          network: 'SEPOLIA'
        };
      } catch (error) {
        console.error('Error al realizar transacción real:', error);
        
        // Mejorar los mensajes de error para el usuario
        let errorMessage = error.message;
        
        // Errores específicos de gas y fondos
        if (errorMessage.includes('intrinsic gas too low')) {
          errorMessage = 'Gas insuficiente para la transacción. Necesitas MNT para pagar las comisiones de red. Obtén MNT gratuito en: https://faucet.sepolia.mantle.xyz';
        } else if (errorMessage.includes('insufficient funds')) {
          errorMessage = 'Fondos insuficientes para completar la transacción y pagar las comisiones. Obtén MNT gratuito en: https://faucet.sepolia.mantle.xyz';
        } else if (errorMessage.includes('failed to forward tx to sequencer')) {
          errorMessage = 'Error al enviar transacción a la red Mantle. Tu wallet necesita MNT para pagar comisiones. Obtén MNT gratuito en: https://faucet.sepolia.mantle.xyz';
        }
        
        throw new Error(`Error en transacción blockchain: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error al realizar transacción real:', error);
      
      // Mejorar los mensajes de error para el usuario
      let errorMessage = error.message;
      
      // Errores específicos de gas y fondos
      if (errorMessage.includes('intrinsic gas too low')) {
        errorMessage = 'Gas insuficiente para la transacción. Necesitas MNT para pagar las comisiones de red. Obtén MNT gratuito en: https://faucet.sepolia.mantle.xyz';
      } else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Fondos insuficientes para completar la transacción y pagar las comisiones. Obtén MNT gratuito en: https://faucet.sepolia.mantle.xyz';
      } else if (errorMessage.includes('failed to forward tx to sequencer')) {
        errorMessage = 'Error al enviar transacción a la red Mantle. Tu wallet necesita MNT para pagar comisiones. Obtén MNT gratuito en: https://faucet.sepolia.mantle.xyz';
      }
      
      throw new Error(`Error en transacción blockchain: ${errorMessage}`);
    }
  } 
  // Para transferencias bancarias u otros destinos, mantener la simulación
  else {
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Actualizar el balance
    user.wallet.tokenBalances[tokenSymbol] = (currentBalance - amountToWithdraw).toFixed(2);
    
    // Guardar en localStorage
    saveUserToLocalStorage(email, user);
    
    // Actualizar en memoria
    SIMULATED_USERS[email] = user;
    
    // Simular hash para transferencias que no son a blockchain
    txHash = destination === 'bank' 
      ? 'BANK_TRANSFER_' + Math.random().toString(36).substring(2, 10)
      : 'INTERNAL_' + Math.random().toString(36).substring(2, 10);
    
    return {
      success: true,
      txHash,
      amount,
      destination,
      newBalance: user.wallet.tokenBalances[tokenSymbol],
      tokenSymbol,
      timestamp: new Date().toISOString(),
      network: 'SIMULATED'
    };
  }
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