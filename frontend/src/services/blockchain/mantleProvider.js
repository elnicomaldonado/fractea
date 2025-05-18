import { ethers } from 'ethers';

// Configuración de redes de Mantle
const NETWORKS = {
  MAINNET: {
    name: 'Mantle Mainnet',
    chainId: 5000,
    rpcUrl: 'https://rpc.mantle.xyz',
    symbol: 'MNT',
    decimals: 18,
    explorerUrl: 'https://explorer.mantle.xyz'
  },
  TESTNET: {
    name: 'Mantle Testnet',
    chainId: 5001,
    rpcUrl: 'https://rpc.testnet.mantle.xyz',
    symbol: 'MNT',
    decimals: 18,
    explorerUrl: 'https://explorer.testnet.mantle.xyz'
  },
  SEPOLIA: {
    name: 'Mantle Sepolia',
    chainId: 5003,
    rpcUrl: 'https://rpc.sepolia.mantle.xyz',
    symbol: 'MNT',
    decimals: 18,
    explorerUrl: 'https://explorer.sepolia.mantle.xyz'
  }
};

// Por defecto usar Sepolia para desarrollo
const DEFAULT_NETWORK = process.env.NODE_ENV === 'production' ? NETWORKS.MAINNET : NETWORKS.SEPOLIA;

/**
 * Crea un provider para interactuar con Mantle blockchain
 * @param {string} network - 'MAINNET', 'TESTNET' o 'SEPOLIA'
 * @returns {ethers.JsonRpcProvider} Provider de ethers
 */
export function getMantleProvider(network = 'SEPOLIA') {
  const networkConfig = NETWORKS[network] || DEFAULT_NETWORK;
  return new ethers.JsonRpcProvider(networkConfig.rpcUrl);
}

/**
 * Obtiene la configuración del explorador de bloques para una red
 * @param {string} network - 'MAINNET', 'TESTNET' o 'SEPOLIA'
 * @returns {Object} Configuración del explorador
 */
export function getExplorerConfig(network = 'SEPOLIA') {
  const networkConfig = NETWORKS[network] || DEFAULT_NETWORK;
  return {
    baseUrl: networkConfig.explorerUrl,
    addressUrl: (address) => `${networkConfig.explorerUrl}/address/${address}`,
    txUrl: (txHash) => `${networkConfig.explorerUrl}/tx/${txHash}`,
    tokenUrl: (tokenAddress) => `${networkConfig.explorerUrl}/token/${tokenAddress}`
  };
}

/**
 * Verifica si una transacción ha sido confirmada
 * @param {string} txHash - Hash de la transacción
 * @param {string} network - 'MAINNET', 'TESTNET' o 'SEPOLIA'
 * @returns {Promise<Object>} Estado de la transacción
 */
export async function checkTransactionStatus(txHash, network = 'SEPOLIA') {
  const provider = getMantleProvider(network);
  
  try {
    // Obtener recibo de la transacción
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return { status: 'PENDING', confirmations: 0 };
    }
    
    // Obtener la transacción para información adicional
    const tx = await provider.getTransaction(txHash);
    
    return {
      status: receipt.status ? 'COMPLETED' : 'FAILED',
      confirmations: tx ? (tx.confirmations || 0) : 0,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: receipt.gasPrice ? receipt.gasPrice.toString() : '0',
      fee: ethers.formatEther(receipt.gasUsed * (receipt.gasPrice || 0n))
    };
  } catch (error) {
    console.error('Error al verificar estado de transacción:', error);
    return { status: 'ERROR', error: error.message };
  }
}

/**
 * Obtiene el balance nativo (MNT) de una dirección
 * @param {string} address - Dirección a consultar
 * @param {string} network - 'MAINNET', 'TESTNET' o 'SEPOLIA'
 * @returns {Promise<string>} Balance formateado
 */
export async function getNativeBalance(address, network = 'SEPOLIA') {
  const provider = getMantleProvider(network);
  
  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error al obtener balance:', error);
    throw error;
  }
}

/**
 * Obtiene los datos de tarifas (gas) actuales de la red
 * @param {string} network - 'MAINNET', 'TESTNET' o 'SEPOLIA'
 * @returns {Promise<Object>} Datos de tarifas de gas
 */
export async function getNetworkFeeData(network = 'SEPOLIA') {
  const provider = getMantleProvider(network);
  
  try {
    // Obtener datos de tarifas usando getFeeData de ethers.js v6
    const feeData = await provider.getFeeData();
    
    // Fallback a getGasPrice si getFeeData no incluye gasPrice (compatibilidad)
    if (!feeData.gasPrice) {
      try {
        // Intentar obtener el precio del gas directamente
        const gasPrice = await provider.getGasPrice();
        feeData.gasPrice = gasPrice;
      } catch (gasPriceError) {
        console.warn('Error al obtener gasPrice, usando valor por defecto:', gasPriceError);
        // Usar un valor por defecto si todo falla (1 gwei para Mantle Sepolia)
        feeData.gasPrice = ethers.parseUnits('1', 'gwei');
      }
    }
    
    // Formatear los resultados para facilitar su uso
    return {
      gasPrice: feeData.gasPrice ? feeData.gasPrice.toString() : undefined,
      maxFeePerGas: feeData.maxFeePerGas ? feeData.maxFeePerGas.toString() : undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? feeData.maxPriorityFeePerGas.toString() : undefined,
      formatted: {
        gasPrice: feeData.gasPrice ? `${ethers.formatUnits(feeData.gasPrice, 'gwei')} gwei` : undefined,
        maxFeePerGas: feeData.maxFeePerGas ? `${ethers.formatUnits(feeData.maxFeePerGas, 'gwei')} gwei` : undefined,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? `${ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei')} gwei` : undefined
      }
    };
  } catch (error) {
    console.error('Error al obtener datos de tarifas de gas:', error);
    throw error;
  }
}

/**
 * Estima el gas para una transacción
 * @param {Object} txParams - Parámetros de la transacción
 * @param {string} network - 'MAINNET', 'TESTNET' o 'SEPOLIA'
 * @returns {Promise<string>} Estimación de gas
 */
export async function estimateGas(txParams, network = 'SEPOLIA') {
  const provider = getMantleProvider(network);
  
  try {
    const gasEstimate = await provider.estimateGas(txParams);
    return gasEstimate.toString();
  } catch (error) {
    console.error('Error al estimar gas:', error);
    throw error;
  }
}

export default {
  NETWORKS,
  DEFAULT_NETWORK,
  getMantleProvider,
  getExplorerConfig,
  checkTransactionStatus,
  getNativeBalance,
  getNetworkFeeData,
  estimateGas
}; 