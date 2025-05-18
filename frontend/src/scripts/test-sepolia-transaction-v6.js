/**
 * Test script para verificar transacciones reales en Mantle Sepolia con ethers v6
 * Ejecutar con: node test-sepolia-transaction-v6.js
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
    console.log('🧪 Iniciando prueba de transacción en Mantle Sepolia (ethers v6)');
    
    // Solicitar clave privada
    const privateKey = process.env.TEST_PRIVATE_KEY || '';
    if (!privateKey) {
      console.error('❌ Error: Debes configurar la variable de entorno TEST_PRIVATE_KEY');
      console.log('   Ejemplo: TEST_PRIVATE_KEY=tuclaveaqui node frontend/src/scripts/test-sepolia-transaction-v6.js');
      return;
    }
    
    // Añadir 0x si es necesario
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    
    // Crear provider y wallet según ethers v6
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(formattedKey, provider);
    
    // Obtener información de la cuenta
    const address = await wallet.getAddress();
    const balanceWei = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balanceWei);
    
    console.log(`📡 Conectado a Mantle Sepolia`);
    console.log(`👛 Dirección de wallet: ${address}`);
    console.log(`💰 Balance actual: ${balanceEth} MNT`);
    
    // Verificar si hay fondos suficientes
    if (parseFloat(balanceEth) < 0.001) {
      console.error('⚠️ Balance insuficiente para realizar prueba. Se necesita al menos 0.001 MNT');
      console.log('   Puedes obtener MNT gratis en: https://faucet.sepolia.mantle.xyz');
      return;
    }
    
    // Preparar transacción (sintaxis de ethers v6)
    const txValue = ethers.parseEther('0.0001'); // Enviar 0.0001 MNT
    
    // Crear objeto de transacción básico sin gasLimit fijo
    const txParams = {
      to: RECIPIENT,
      value: txValue,
    };
    
    // Estimar gas antes de enviar la transacción (esto es importante para Mantle)
    console.log('⛽ Estimando gas necesario...');
    const estimatedGas = await provider.estimateGas({
      from: address,
      to: RECIPIENT,
      value: txValue
    });
    console.log(`⛽ Gas estimado: ${estimatedGas.toString()}`);
    
    // Añadir un 20% extra al gas estimado para mayor seguridad
    const safeGas = estimatedGas * 120n / 100n;
    txParams.gasLimit = safeGas;
    
    console.log(`🔧 Preparando transacción de prueba:`);
    console.log(`   De: ${address}`);
    console.log(`   Para: ${RECIPIENT}`);
    console.log(`   Monto: 0.0001 MNT`);
    console.log(`   Gas Limit: ${safeGas.toString()}`);
    
    // Enviar transacción
    console.log('📤 Enviando transacción...');
    const tx = await wallet.sendTransaction(txParams);
    
    console.log(`✅ Transacción enviada!`);
    console.log(`📝 Hash: ${tx.hash}`);
    console.log(`🔍 Ver en explorador: https://explorer.sepolia.mantle.xyz/tx/${tx.hash}`);
    
    // Esperar confirmación
    console.log('⏱️ Esperando confirmación (puede tardar 15-30 segundos)...');
    const receipt = await tx.wait(); // En v6 no es necesario especificar el número de confirmaciones
    
    console.log(`🎉 Transacción confirmada en el bloque #${receipt.blockNumber}`);
    console.log(`⛽ Gas usado: ${receipt.gasUsed.toString()}`);
    
    // Verificar nuevo balance
    const newBalanceWei = await provider.getBalance(address);
    const newBalanceEth = ethers.formatEther(newBalanceWei);
    
    console.log(`💰 Nuevo balance: ${newBalanceEth} MNT`);
    console.log('✅ Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    // Mostrar más detalles sobre el error si está disponible
    if (error.error && error.error.message) {
      console.error('  Mensaje del error:', error.error.message);
    }
  } finally {
    // Limpiar cualquier referencia a la clave privada
    // (aunque las variables de entorno están fuera de este script)
    console.log('\n🔒 Finalizando prueba y limpiando datos sensibles...');
  }
}

main(); 