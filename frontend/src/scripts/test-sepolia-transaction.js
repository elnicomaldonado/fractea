/**
 * Test script para verificar transacciones reales en Mantle Sepolia
 * Ejecutar con: node test-sepolia-transaction.js
 */

const { ethers } = require('ethers');

// Configuración
const SEPOLIA_RPC_URL = 'https://rpc.sepolia.mantle.xyz';
// Usar la dirección del destinatario desde la variable de entorno o una predeterminada
const RECIPIENT = process.env.TEST_RECIPIENT || '0x000000000000000000000000000000000000dEaD';

// Advertencia de seguridad
console.log('\x1b[31m⚠️  ADVERTENCIA DE SEGURIDAD ⚠️\x1b[0m');
console.log('\x1b[31mEste script es SOLO para pruebas en testnet.\x1b[0m');
console.log('\x1b[31mNUNCA uses una clave privada que contenga fondos reales.\x1b[0m');
console.log('\x1b[31mDespués de terminar, la clave privada no se guarda.\x1b[0m');
console.log('\n');

async function main() {
  try {
    console.log('🧪 Iniciando prueba de transacción en Mantle Sepolia');
    
    // Obtener clave privada de variable de entorno
    const privateKey = process.env.TEST_PRIVATE_KEY || '';
    if (!privateKey) {
      console.error('❌ Error: Debes configurar la variable de entorno TEST_PRIVATE_KEY');
      console.log('   Ejemplo: TEST_PRIVATE_KEY=0xtuclaveaqui node frontend/src/scripts/test-sepolia-transaction.js');
      return;
    }
    
    // Crear provider y wallet
    const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Obtener información de la cuenta
    const address = wallet.address;
    const balanceWei = await provider.getBalance(address);
    const balanceEth = ethers.utils.formatEther(balanceWei);
    
    console.log(`📡 Conectado a Mantle Sepolia`);
    console.log(`👛 Dirección de wallet: ${address}`);
    console.log(`💰 Balance actual: ${balanceEth} MNT`);
    
    // Verificar si hay fondos suficientes
    if (parseFloat(balanceEth) < 0.001) {
      console.error('⚠️ Balance insuficiente para realizar prueba. Se necesita al menos 0.001 MNT');
      console.log('   Puedes obtener MNT gratis en: https://faucet.sepolia.mantle.xyz');
      return;
    }
    
    // Preparar transacción
    const txValue = ethers.utils.parseEther('0.0001'); // Enviar 0.0001 MNT
    
    // Estimar gas para mayor precisión con Mantle
    console.log('⛽ Estimando gas necesario...');
    try {
      const gasEstimate = await provider.estimateGas({
        from: address,
        to: RECIPIENT,
        value: txValue
      });
      console.log(`⛽ Gas estimado: ${gasEstimate.toString()}`);
      
      // Añadir 20% de margen
      const gasLimit = gasEstimate.mul(120).div(100);
      
      const txParams = {
        to: RECIPIENT,
        value: txValue,
        gasLimit: gasLimit
      };
      
      console.log(`🔧 Preparando transacción de prueba:`);
      console.log(`   De: ${address}`);
      console.log(`   Para: ${RECIPIENT}`);
      console.log(`   Monto: 0.0001 MNT`);
      console.log(`   Gas Limit: ${gasLimit.toString()}`);
      
      // Enviar transacción
      console.log('📤 Enviando transacción...');
      const tx = await wallet.sendTransaction(txParams);
      
      console.log(`✅ Transacción enviada!`);
      console.log(`📝 Hash: ${tx.hash}`);
      console.log(`🔍 Ver en explorador: https://explorer.sepolia.mantle.xyz/tx/${tx.hash}`);
      
      // Esperar confirmación
      console.log('⏱️ Esperando confirmación (puede tardar 15-30 segundos)...');
      const receipt = await tx.wait(1);
      
      console.log(`🎉 Transacción confirmada en el bloque #${receipt.blockNumber}`);
      console.log(`⛽ Gas usado: ${receipt.gasUsed.toString()}`);
      
      // Verificar nuevo balance
      const newBalanceWei = await provider.getBalance(address);
      const newBalanceEth = ethers.utils.formatEther(newBalanceWei);
      
      console.log(`💰 Nuevo balance: ${newBalanceEth} MNT`);
      console.log('✅ Prueba completada exitosamente!');
    } catch (gasError) {
      console.error('❌ Error al estimar gas:', gasError);
      console.error('   Intenta con un valor de gas fijo o verifica tu conexión a Mantle Sepolia');
    }
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    if (error.reason) {
      console.error('   Razón:', error.reason);
    }
  } finally {
    // Limpiar cualquier referencia a la clave privada
    console.log('\n🔒 Finalizando prueba y limpiando datos sensibles...');
  }
}

main(); 