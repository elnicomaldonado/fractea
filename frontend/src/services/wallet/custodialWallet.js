import { ethers } from 'ethers';
import { getMantleProvider } from '../blockchain/mantleProvider';

// Clave para encriptación local (en producción usar un servicio seguro como KMS)
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'FRACTEA_ENCRYPTION_KEY';

/**
 * Genera una nueva wallet custodial para un usuario
 * @param {string} userId - ID único del usuario
 * @param {string} email - Email del usuario
 * @returns {Object} Wallet generada con detalles
 */
export async function generateCustodialWallet(userId, email) {
  try {
    // Crear wallet aleatoria
    const wallet = ethers.Wallet.createRandom();
    
    // Encriptar la clave privada
    const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey);
    
    // Crear objeto de wallet con información necesaria
    const walletData = {
      address: wallet.address,
      encryptedPrivateKey,
      userId,
      email,
      createdAt: new Date().toISOString(),
      tokenBalances: {
        USDC: '0.00',
        MNT: '0.00'
      }
    };
    
    // En producción, guardar en base de datos segura
    // Aquí simulamos almacenamiento local para el MVP
    saveWalletToStorage(walletData);
    
    console.log(`Wallet custodial generada para ${email}: ${wallet.address}`);
    
    return {
      address: wallet.address,
      userId,
      createdAt: walletData.createdAt
    };
  } catch (error) {
    console.error('Error al generar wallet custodial:', error);
    throw new Error('No se pudo generar la wallet custodial');
  }
}

/**
 * Firma una transacción usando la wallet custodial
 * @param {string} email - Email del usuario
 * @param {Object} transaction - Datos de la transacción
 * @param {string} network - Red de Mantle ('MAINNET', 'TESTNET' o 'SEPOLIA')
 * @returns {Promise<Object>} Resultado de la transacción
 */
export async function signAndSendTransaction(email, transaction, network = 'SEPOLIA') {
  try {
    console.log(`[signAndSendTransaction] Iniciando transacción para usuario: ${email} en red: ${network}`);
    
    // Obtener datos de wallet del usuario
    const walletData = getWalletByEmail(email);
    
    if (!walletData) {
      console.error(`[signAndSendTransaction] No se encontró wallet para el usuario ${email}`);
      throw new Error(`No se encontró wallet para el usuario ${email}`);
    }
    
    console.log(`[signAndSendTransaction] Wallet encontrada: ${walletData.address}`);
    
    // Desencriptar clave privada
    const privateKey = decryptPrivateKey(walletData.encryptedPrivateKey);
    
    // Crear instancia de wallet con provider
    const provider = getMantleProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`[signAndSendTransaction] Wallet conectada a ${network}`);
    
    // Estimar gas para la transacción (importante para Mantle)
    try {
      console.log(`[signAndSendTransaction] Estimando gas para transacción a ${transaction.to}`);
      const estimatedGas = await provider.estimateGas({
        from: wallet.address,
        to: transaction.to,
        value: transaction.value,
        data: transaction.data || '0x'
      });
      
      // Añadir un 20% extra al gas estimado para mayor seguridad
      const safeGas = estimatedGas * 120n / 100n;
      transaction.gasLimit = safeGas;
      
      console.log(`[signAndSendTransaction] Gas estimado para transacción: ${safeGas.toString()}`);
    } catch (error) {
      console.warn('[signAndSendTransaction] Error al estimar gas, se usará un valor por defecto:', error);
      // Si la estimación falla, usar un valor seguro para Mantle
      transaction.gasLimit = 100000n;
    }
    
    // Preparar y enviar transacción
    console.log(`[signAndSendTransaction] Enviando transacción desde ${wallet.address} a ${transaction.to}`);
    const tx = await wallet.sendTransaction(transaction);
    console.log(`[signAndSendTransaction] Transacción enviada! Hash: ${tx.hash}`);
    
    // Crear registro de transacción
    const txRecord = {
      hash: tx.hash,
      from: walletData.address,
      to: transaction.to,
      value: transaction.value ? ethers.formatEther(transaction.value) : '0',
      data: transaction.data || '0x',
      nonce: tx.nonce,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      network
    };
    
    // Guardar registro de transacción
    saveTransactionToStorage(email, txRecord);
    console.log(`[signAndSendTransaction] Registro de transacción guardado en storage`);
    
    // Esperar confirmación (1 bloque)
    console.log(`[signAndSendTransaction] Esperando confirmación de la transacción...`);
    const receipt = await tx.wait();
    console.log(`[signAndSendTransaction] Transacción confirmada en bloque: ${receipt.blockNumber}`);
    
    // Actualizar estado de transacción
    const status = receipt.status ? 'COMPLETED' : 'FAILED';
    updateTransactionStatus(email, tx.hash, status);
    console.log(`[signAndSendTransaction] Estado de transacción actualizado a: ${status}`);
    
    return {
      success: receipt.status,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      timestamp: txRecord.timestamp,
      message: receipt.status ? 'Transacción confirmada exitosamente' : 'Transacción fallida',
      status: status
    };
  } catch (error) {
    console.error('[signAndSendTransaction] Error al firmar y enviar transacción:', error);
    throw new Error(`Error en transacción: ${error.message}`);
  }
}

/**
 * Encripta una clave privada (simplificado para MVP)
 * @param {string} privateKey - Clave privada
 * @returns {string} Clave encriptada
 */
function encryptPrivateKey(privateKey) {
  // En producción usar una solución real de encriptación
  // Esto es solo una simulación simple para el MVP
  return btoa(`${privateKey}:${ENCRYPTION_KEY}`);
}

/**
 * Desencripta una clave privada
 * @param {string} encryptedKey - Clave encriptada
 * @returns {string} Clave privada original
 */
function decryptPrivateKey(encryptedKey) {
  // Desencriptación simple para MVP
  const decrypted = atob(encryptedKey).split(':')[0];
  return decrypted;
}

/**
 * Guarda datos de wallet en almacenamiento local
 * @param {Object} walletData - Datos de la wallet
 */
function saveWalletToStorage(walletData) {
  // En producción, esto debería ser en una base de datos segura
  const existingWallets = JSON.parse(localStorage.getItem('fractea_wallets') || '{}');
  existingWallets[walletData.email] = walletData;
  localStorage.setItem('fractea_wallets', JSON.stringify(existingWallets));
}

/**
 * Obtiene datos de wallet por email
 * @param {string} email - Email del usuario
 * @returns {Object|null} Datos de wallet o null si no existe
 */
function getWalletByEmail(email) {
  const existingWallets = JSON.parse(localStorage.getItem('fractea_wallets') || '{}');
  return existingWallets[email] || null;
}

/**
 * Guarda registro de transacción
 * @param {string} email - Email del usuario
 * @param {Object} transaction - Datos de la transacción
 */
function saveTransactionToStorage(email, transaction) {
  const existingTxs = JSON.parse(localStorage.getItem(`fractea_txs_${email}`) || '[]');
  existingTxs.push(transaction);
  localStorage.setItem(`fractea_txs_${email}`, JSON.stringify(existingTxs));
}

/**
 * Actualiza estado de una transacción
 * @param {string} email - Email del usuario
 * @param {string} txHash - Hash de la transacción
 * @param {string} status - Nuevo estado
 */
function updateTransactionStatus(email, txHash, status) {
  const existingTxs = JSON.parse(localStorage.getItem(`fractea_txs_${email}`) || '[]');
  const updatedTxs = existingTxs.map(tx => {
    if (tx.hash === txHash) {
      return { ...tx, status };
    }
    return tx;
  });
  localStorage.setItem(`fractea_txs_${email}`, JSON.stringify(updatedTxs));
}

/**
 * Obtiene transacciones de un usuario
 * @param {string} email - Email del usuario
 * @returns {Array} Lista de transacciones
 */
export function getUserTransactions(email) {
  return JSON.parse(localStorage.getItem(`fractea_txs_${email}`) || '[]');
}

/**
 * Obtiene detalles de una transacción específica
 * @param {string} email - Email del usuario
 * @param {string} txHash - Hash de la transacción
 * @returns {Object|null} Detalles de la transacción o null si no existe
 */
export function getTransactionDetails(email, txHash) {
  const txs = getUserTransactions(email);
  return txs.find(tx => tx.hash === txHash) || null;
}

/**
 * Obtiene la wallet asociada a un usuario
 * @param {string} email - Email del usuario
 * @returns {Object|null} Datos públicos de la wallet o null si no existe
 */
export function getUserWallet(email) {
  const wallet = getWalletByEmail(email);
  
  if (!wallet) return null;
  
  // Solo devolver datos públicos, nunca la clave encriptada
  return {
    address: wallet.address,
    userId: wallet.userId,
    createdAt: wallet.createdAt,
    tokenBalances: wallet.tokenBalances
  };
}

export default {
  generateCustodialWallet,
  signAndSendTransaction,
  getUserTransactions,
  getTransactionDetails,
  getUserWallet
}; 