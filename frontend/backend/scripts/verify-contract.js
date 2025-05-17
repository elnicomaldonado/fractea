const hre = require("hardhat");

async function main() {
  // Dirección del contrato desplegado
  const contractAddress = "0xC7301a077d4089C6e620B6f41C1fE70686092057";
  
  console.log("🔍 Verificando contrato en:", contractAddress);
  
  // Conectamos al contrato desplegado
  const FracteaNFT = await hre.ethers.getContractFactory("FracteaNFT");
  const fracteaNFT = FracteaNFT.attach(contractAddress);
  
  try {
    // Intentamos obtener el owner
    const owner = await fracteaNFT.owner();
    console.log("👤 Propietario del contrato:", owner);
    
    // Verificar si es el mismo que el deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("👤 Tu dirección:", deployer.address);
    
    if (owner.toLowerCase() === deployer.address.toLowerCase()) {
      console.log("✅ Confirmado: Tú eres el propietario del contrato");
    } else {
      console.log("❌ Advertencia: Tú NO eres el propietario del contrato");
    }
  } catch (error) {
    console.error("❌ Error al verificar el contrato:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 