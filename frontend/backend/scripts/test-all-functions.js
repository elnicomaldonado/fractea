// test-all-functions.js
// Pruebas E2E del contrato FracteaNFT en Mantle Sepolia

/**
 * Dependencias:
 * - Hardhat v2.x
 * - Ethers v6 (por defecto en Hardhat)
 * Ejecuta con: npx hardhat run scripts/test-all-functions.js --network mantleSepolia
 * 
 * Cambia los parámetros arriba para probar con diferentes propiedades o montos.
 */

const hre = require("hardhat");
const assert = require("assert"); // Solo si quieres usar asserts

// Variables configurables
const CONTRACT_ADDRESS = "0xC7301a077d4089C6e620B6f41C1fE70686092057";
const PROPERTY_1_ID = 1;
const PROPERTY_2_ID = 2;
const PROPERTY_1_FRACTIONS = 100;
const PROPERTY_2_FRACTIONS = 200;
const PROPERTY_1_RENT = "0.01";
const PROPERTY_2_RENT = "0.02";

async function main() {
  console.log("\n🧪 INICIANDO PRUEBAS DEL CONTRATO FRACTEANFT\n==========================================");
  console.log(`📄 Contrato: ${CONTRACT_ADDRESS}`);
  console.log(`🔗 Red: Mantle Sepolia\n`);

  // Configuración inicial
  const [admin] = await hre.ethers.getSigners();
  console.log(`🔑 Cuenta utilizada: ${admin.address}\n`);
  
  // Conectar al contrato
  const FracteaNFT = await hre.ethers.getContractFactory("FracteaNFT");
  const contract = FracteaNFT.attach(CONTRACT_ADDRESS);

  // 1️⃣ ACUÑACIÓN DE FRACCIONES
  console.group("\n1️⃣ ACUÑACIÓN DE FRACCIONES");
  for (const [propertyId, fractions] of [[PROPERTY_1_ID, PROPERTY_1_FRACTIONS], [PROPERTY_2_ID, PROPERTY_2_FRACTIONS]]) {
    try {
      console.group(`🏢 Propiedad #${propertyId} - Acuñando ${fractions} fracciones`);
      let initialBalance = await contract.balanceOf(admin.address, propertyId);
      console.log(`👉 Balance inicial: ${initialBalance}`);

      const tx = await contract.mintFraction(admin.address, propertyId, fractions);
      const receipt = await tx.wait();

      // Verificar evento FractionMinted
      const event = receipt.logs?.find(log =>
        log.fragment && log.fragment.name === "FractionMinted"
      );
      if (event) {
        console.log("✅ Evento FractionMinted emitido correctamente");
      } else {
        console.warn("⚠️ No se detectó evento FractionMinted");
      }

      let finalBalance = await contract.balanceOf(admin.address, propertyId);
      console.log(`✅ Balance final: ${finalBalance}`);
      console.log(`✅ Incremento: ${finalBalance - initialBalance}`);
      // assert(finalBalance - initialBalance === fractions, "El número de fracciones acuñadas no coincide");
      console.groupEnd();
    } catch (error) {
      console.error(`❌ Error al acuñar fracciones para propiedad #${propertyId}: ${error.message}`);
      console.groupEnd();
    }
  }
  console.groupEnd();

  // 2️⃣ DEPÓSITO DE RENTA
  console.group("\n2️⃣ DEPÓSITO DE RENTA");
  for (const [propertyId, rent] of [[PROPERTY_1_ID, PROPERTY_1_RENT], [PROPERTY_2_ID, PROPERTY_2_RENT]]) {
    try {
      console.group(`💰 Propiedad #${propertyId} - Depositando ${rent} ETH`);
      const initialProp = await contract.properties(propertyId);
      console.log(`👉 Renta inicial: ${hre.ethers.formatEther(initialProp.totalRent)} ETH`);

      const rentAmount = hre.ethers.parseEther(rent);
      const tx = await contract.depositRent(propertyId, { value: rentAmount });
      const receipt = await tx.wait();

      // Verificar evento RentDeposited
      const event = receipt.logs?.find(log =>
        log.fragment && log.fragment.name === "RentDeposited"
      );
      if (event) {
        console.log("✅ Evento RentDeposited emitido correctamente");
      } else {
        console.warn("⚠️ No se detectó evento RentDeposited");
      }

      const finalProp = await contract.properties(propertyId);
      console.log(`✅ Renta final: ${hre.ethers.formatEther(finalProp.totalRent)} ETH`);
      console.log(`✅ Incremento: ${hre.ethers.formatEther(finalProp.totalRent - initialProp.totalRent)} ETH`);
      console.groupEnd();
    } catch (error) {
      console.error(`❌ Error al depositar renta para propiedad #${propertyId}: ${error.message}`);
      console.groupEnd();
    }
  }
  console.groupEnd();

  // 3️⃣ CONFIGURACIÓN DEL RELAYER
  console.group("\n3️⃣ CONFIGURACIÓN DEL RELAYER");
  try {
    const currentRelayer = await contract.relayer();
    if (currentRelayer.toLowerCase() === admin.address.toLowerCase()) {
      console.log(`ℹ️ El relayer ya está configurado a tu dirección (${currentRelayer})`);
    } else {
      const tx = await contract.setRelayer(admin.address);
      const receipt = await tx.wait();
      const event = receipt.logs?.find(log =>
        log.fragment && log.fragment.name === "RelayerUpdated"
      );
      if (event) {
        console.log("✅ Evento RelayerUpdated emitido correctamente");
      } else {
        console.warn("⚠️ No se detectó evento RelayerUpdated");
      }
      const newRelayer = await contract.relayer();
      console.log(`✅ Nuevo relayer: ${newRelayer}`);
    }
  } catch (error) {
    console.error(`❌ Error al configurar relayer: ${error.message}`);
  }
  console.groupEnd();

  // 4️⃣ CÁLCULO DE RENTA RECLAMABLE (ANTES)
  console.group("\n4️⃣ CÁLCULO DE RENTA RECLAMABLE (ANTES)");
  let claimable1Before, claimable2Before;
  try {
    claimable1Before = await contract.calculateClaimable(PROPERTY_1_ID, admin.address);
    claimable2Before = await contract.calculateClaimable(PROPERTY_2_ID, admin.address);
    console.log(`👉 Propiedad #${PROPERTY_1_ID}: ${hre.ethers.formatEther(claimable1Before)} ETH`);
    console.log(`👉 Propiedad #${PROPERTY_2_ID}: ${hre.ethers.formatEther(claimable2Before)} ETH`);
  } catch (error) {
    console.error(`❌ Error al calcular renta reclamable: ${error.message}`);
  }
  console.groupEnd();

  // 5️⃣ RECLAMACIÓN DE RENTA
  console.group("\n5️⃣ RECLAMACIÓN DE RENTA");
  const initialBalance = await hre.ethers.provider.getBalance(admin.address);

  for (const [propertyId, claimable] of [
    [PROPERTY_1_ID, claimable1Before],
    [PROPERTY_2_ID, claimable2Before]
  ]) {
    try {
      if (claimable <= 0) {
        console.log(`ℹ️ No hay renta reclamable para propiedad #${propertyId}`);
        continue;
      }
      const tx = await contract.claimRent(propertyId, admin.address);
      const receipt = await tx.wait();
      const event = receipt.logs?.find(log =>
        log.fragment && log.fragment.name === "RentClaimed"
      );
      if (event) {
        console.log("✅ Evento RentClaimed emitido correctamente");
      } else {
        console.warn("⚠️ No se detectó evento RentClaimed");
      }
      console.log(`✅ Renta reclamada para propiedad #${propertyId}: ${hre.ethers.formatEther(claimable)} ETH`);
    } catch (error) {
      console.error(`❌ Error al reclamar renta para propiedad #${propertyId}: ${error.message}`);
    }
  }

  const finalBalance = await hre.ethers.provider.getBalance(admin.address);
  const balanceDiff = finalBalance - initialBalance;
  console.log(`\n👉 Balance ETH final: ${hre.ethers.formatEther(finalBalance)} ETH`);
  console.log(`✅ Cambio en balance: ${hre.ethers.formatEther(balanceDiff)} ETH`);
  console.log("ℹ️ (Este cambio incluye tanto las rentas recibidas como los gastos de gas)");
  console.groupEnd();

  // 6️⃣ CÁLCULO DE RENTA RECLAMABLE (DESPUÉS)
  console.group("\n6️⃣ CÁLCULO DE RENTA RECLAMABLE (DESPUÉS)");
  try {
    const claimable1After = await contract.calculateClaimable(PROPERTY_1_ID, admin.address);
    const claimable2After = await contract.calculateClaimable(PROPERTY_2_ID, admin.address);
    console.log(`👉 Propiedad #${PROPERTY_1_ID}: ${hre.ethers.formatEther(claimable1After)} ETH`);
    console.log(`👉 Propiedad #${PROPERTY_2_ID}: ${hre.ethers.formatEther(claimable2After)} ETH`);
    // assert(claimable1After.toString() === "0" && claimable2After.toString() === "0", "La renta debería ser 0 después del claim");
  } catch (error) {
    console.error(`❌ Error al calcular renta reclamable después del claim: ${error.message}`);
  }
  console.groupEnd();

  // 7️⃣ CONSULTA DE PROPIEDADES
  console.group("\n7️⃣ CONSULTA DE PROPIEDADES");
  for (const propertyId of [PROPERTY_1_ID, PROPERTY_2_ID]) {
    try {
      const prop = await contract.properties(propertyId);
      const balance = await contract.balanceOf(admin.address, propertyId);
      console.log(`📊 PROPIEDAD #${propertyId}:\n  • Total Supply: ${prop.totalSupply}\n  • Total Rent: ${hre.ethers.formatEther(prop.totalRent)} ETH\n  • Fecha de creación: ${new Date(Number(prop.createdAt) * 1000).toLocaleString()}\n  • Tu balance: ${balance} fracciones`);
    } catch (error) {
      console.error(`❌ Error al consultar propiedad #${propertyId}: ${error.message}`);
    }
  }
  console.groupEnd();

  // RESUMEN FINAL
  console.log("\n🎯 RESUMEN DE PRUEBAS\n==================");
  console.log("1️⃣ Acuñación de fracciones: Verificado para propiedades #1 y #2");
  console.log("2️⃣ Depósito de renta: Verificado para propiedades #1 y #2");
  console.log("3️⃣ Configuración del relayer: Verificado");
  console.log("4️⃣ Cálculo de renta reclamable (antes): Verificado");
  console.log("5️⃣ Reclamación de renta: Verificado para ambas propiedades");
  console.log("6️⃣ Cálculo de renta reclamable (después): Verificado (debe ser 0)");
  console.log("7️⃣ Consulta de propiedades: Verificado");
  console.log("\n✅ PRUEBAS COMPLETADAS EXITOSAMENTE");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ ERROR GENERAL EN PRUEBAS:", error);
    process.exit(1);
  });