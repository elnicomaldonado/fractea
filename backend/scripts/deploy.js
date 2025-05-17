// Script para el despliegue del contrato FracteaNFT
const hre = require("hardhat");

async function main() {
  console.log("🚀 Iniciando despliegue del contrato FracteaNFT...");

  // Obtenemos la cuenta del deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Desplegando desde la cuenta:", deployer.address);

  // Desplegamos el contrato
  const FracteaNFT = await hre.ethers.getContractFactory("FracteaNFT");
  const fracteaNFT = await FracteaNFT.deploy();

  await fracteaNFT.waitForDeployment();
  
  const address = await fracteaNFT.getAddress();
  console.log("🎉 Contrato FracteaNFT desplegado en:", address);
  
  console.log("⚠️ Importante: Actualiza la variable FRACTEA_NFT_ADDRESS en tu archivo .env");
  
  // Configuramos el relayer
  console.log("\n📡 Configurando relayer...");
  try {
    // Método correcto para ethers v6
    const tx = await fracteaNFT.setRelayer(deployer.address);
    await tx.wait();
    console.log("✅ Relayer configurado correctamente:", deployer.address);
  } catch (error) {
    console.log("⚠️ No se pudo configurar el relayer automáticamente. Error:", error.message);
    console.log("ℹ️ Puedes configurar el relayer manualmente más tarde.");
  }
  
  console.log("✅ Despliegue completado con éxito!");
  console.log("\n📝 Recuerda guardar esta información:");
  console.log("• Dirección del contrato:", address);
  console.log("• Red: Mantle Sepolia");
}

// Ejecutamos la función y manejamos errores
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en el despliegue:", error);
    process.exit(1);
  }); 