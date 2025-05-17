const hre = require("hardhat");

// Configuración
const contractAddress = "0xC7301a077d4089C6e620B6f41C1fE70686092057";

// Función ABI de setRelayer
const setRelayerABI = {
  inputs: [
    {
      internalType: "address",
      name: "_relayer",
      type: "address"
    }
  ],
  name: "setRelayer",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
};

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log("Cuenta utilizada:", signer.address);
  
  try {
    console.log(`\n📡 Configurando relayer a la dirección ${signer.address}...`);
    
    // Crear una instancia del contrato con solo la función que necesitamos
    const contract = new hre.ethers.Contract(
      contractAddress,
      [setRelayerABI],
      signer
    );
    
    // Llamar a la función setRelayer
    const tx = await contract.setRelayer(signer.address);
    console.log("Transacción enviada:", tx.hash);
    
    // Esperar a que se confirme la transacción
    const receipt = await tx.wait();
    console.log("Transacción confirmada en el bloque:", receipt.blockNumber);
    
    console.log("✅ Relayer configurado con éxito!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error general:", error);
    process.exit(1);
  }); 