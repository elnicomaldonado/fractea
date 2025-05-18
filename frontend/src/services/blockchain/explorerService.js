/**
 * explorerService.js
 * Servicio para interactuar con el explorador de bloques de Mantle
 */

// Configuración de exploradores por red
const EXPLORER_CONFIG = {
  MAINNET: {
    name: 'Mantle Explorer',
    baseUrl: 'https://explorer.mantle.xyz',
    apiUrl: 'https://explorer.mantle.xyz/api',
    chainId: 5000
  },
  TESTNET: {
    name: 'Mantle Testnet Explorer',
    baseUrl: 'https://explorer.testnet.mantle.xyz',
    apiUrl: 'https://explorer.testnet.mantle.xyz/api',
    chainId: 5001
  },
  SEPOLIA: {
    name: 'Mantle Sepolia Explorer',
    baseUrl: 'https://explorer.sepolia.mantle.xyz',
    apiUrl: 'https://explorer.sepolia.mantle.xyz/api',
    chainId: 5003
  }
};

/**
 * Obtiene la configuración del explorador para una red específica
 * @param {string} network - 'MAINNET', 'TESTNET' o 'SEPOLIA'
 * @returns {Object} Configuración del explorador
 */
export function getExplorerConfig(network = 'SEPOLIA') {
  const config = EXPLORER_CONFIG[network] || EXPLORER_CONFIG.SEPOLIA;
  
  return {
    baseUrl: config.baseUrl,
    apiUrl: config.apiUrl,
    name: config.name,
    chainId: config.chainId
  };
}

/**
 * Genera la URL para ver una transacción en el explorador
 * @param {string} txHash - Hash de la transacción
 * @param {string} network - 'MAINNET', 'TESTNET' o 'SEPOLIA'
 * @returns {string} URL completa al explorador
 */
export function getTxExplorerUrl(txHash, network = 'SEPOLIA') {
  const config = getExplorerConfig(network);
  return `${config.baseUrl}/tx/${txHash}`;
}

/**
 * Genera la URL para ver una dirección en el explorador
 * @param {string} address - Dirección a consultar
 * @param {string} network - 'MAINNET', 'TESTNET' o 'SEPOLIA'
 * @returns {string} URL completa al explorador
 */
export function getAddressExplorerUrl(address, network = 'SEPOLIA') {
  const config = getExplorerConfig(network);
  return `${config.baseUrl}/address/${address}`;
}

/**
 * Genera la URL para ver un token en el explorador
 * @param {string} tokenAddress - Dirección del contrato del token
 * @param {string} network - 'MAINNET', 'TESTNET' o 'SEPOLIA'
 * @returns {string} URL completa al explorador
 */
export function getTokenExplorerUrl(tokenAddress, network = 'SEPOLIA') {
  const config = getExplorerConfig(network);
  return `${config.baseUrl}/token/${tokenAddress}`;
}

/**
 * Genera la URL para ver un bloque en el explorador
 * @param {string|number} blockNumber - Número o hash del bloque
 * @param {string} network - 'MAINNET', 'TESTNET' o 'SEPOLIA'
 * @returns {string} URL completa al explorador
 */
export function getBlockExplorerUrl(blockNumber, network = 'SEPOLIA') {
  const config = getExplorerConfig(network);
  return `${config.baseUrl}/block/${blockNumber}`;
}

/**
 * Obtiene el estado de una transacción a través de la API del explorador
 * @param {string} txHash - Hash de la transacción
 * @param {string} network - 'MAINNET', 'TESTNET' o 'SEPOLIA'
 * @returns {Promise<Object>} Datos de la transacción
 */
export async function getTransactionStatus(txHash, network = 'SEPOLIA') {
  const config = getExplorerConfig(network);
  
  try {
    const response = await fetch(`${config.apiUrl}?module=transaction&action=gettxinfo&txhash=${txHash}`);
    const data = await response.json();
    
    if (data.status !== '1') {
      throw new Error(data.message || 'Error al consultar la transacción');
    }
    
    const txInfo = data.result;
    
    return {
      success: txInfo.status === '1',
      hash: txHash,
      blockNumber: parseInt(txInfo.blockNumber, 10),
      timestamp: new Date(parseInt(txInfo.timeStamp, 10) * 1000).toISOString(),
      from: txInfo.from,
      to: txInfo.to,
      value: txInfo.value,
      gasUsed: txInfo.gasUsed,
      confirmations: parseInt(txInfo.confirmations, 10) || 0
    };
  } catch (error) {
    console.error('Error al verificar estado de transacción:', error);
    
    // En caso de error, devolver información básica
    return {
      success: false,
      hash: txHash,
      error: error.message,
      network
    };
  }
}

/**
 * Verifica si una transacción existe y está confirmada
 * @param {string} txHash - Hash de la transacción
 * @param {string} network - 'MAINNET', 'TESTNET' o 'SEPOLIA'
 * @returns {Promise<boolean>} Verdadero si la transacción está confirmada
 */
export async function isTransactionConfirmed(txHash, network = 'SEPOLIA') {
  try {
    const txStatus = await getTransactionStatus(txHash, network);
    return txStatus.success && txStatus.confirmations > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Obtiene detalles del token para una dirección
 * @param {string} address - Dirección a consultar
 * @param {string} tokenAddress - Dirección del token (opcional)
 * @param {string} network - 'MAINNET', 'TESTNET' o 'SEPOLIA'
 * @returns {Promise<Object>} Información del token
 */
export async function getTokenInfo(tokenAddress, network = 'SEPOLIA') {
  const config = getExplorerConfig(network);
  
  try {
    const response = await fetch(`${config.apiUrl}?module=token&action=getTokenInfo&contractaddress=${tokenAddress}`);
    const data = await response.json();
    
    if (data.status !== '1') {
      throw new Error(data.message || 'Error al consultar información del token');
    }
    
    return data.result;
  } catch (error) {
    console.error('Error al obtener información del token:', error);
    throw error;
  }
}

export default {
  getExplorerConfig,
  getTxExplorerUrl,
  getAddressExplorerUrl,
  getTokenExplorerUrl,
  getBlockExplorerUrl,
  getTransactionStatus,
  isTransactionConfirmed,
  getTokenInfo
}; 