const hre = require("hardhat");

// Configuración
const contractAddress = "0xC7301a077d4089C6e620B6f41C1fE70686092057";
const propertyId = 1;
const rentAmount = hre.ethers.parseEther("0.01"); // 0.01 ETH

// Función ABI de depositRent
const depositRentABI = {
  inputs: [
    {
      internalType: "uint256",
      name: "propertyId",
      type: "uint256"
    }
  ],
  name: "depositRent",
  outputs: [],
  stateMutability: "payable",
  type: "function"
};

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log("Cuenta utilizada:", signer.address);
  
  try {
    console.log(`\n💰 Depositando ${hre.ethers.formatEther(rentAmount)} ETH como renta para la propiedad #${propertyId}...`);
    
    // Crear una instancia del contrato con solo la función que necesitamos
    const contract = new hre.ethers.Contract(
      contractAddress,
      [depositRentABI],
      signer
    );
    
    // Llamar a la función depositRent
    const tx = await contract.depositRent(propertyId, { value: rentAmount });
    console.log("Transacción enviada:", tx.hash);
    
    // Esperar a que se confirme la transacción
    const receipt = await tx.wait();
    console.log("Transacción confirmada en el bloque:", receipt.blockNumber);
    
    console.log("✅ Renta depositada con éxito!");
    
    // Consultar el nuevo saldo
    console.log("\n🔍 Verificando la actualización...");
    
    // Solo podemos leer la propiedad si añadimos función properties al ABI
    console.log("Para verificar el nuevo saldo, ejecuta: OPTION=4 npx hardhat run scripts/manage-contract.js --network mantleSepolia");
  } catch (error) {
    console.error("❌ Error:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n⚠️ Posible causa: Fondos insuficientes para pagar el gas + valor de la transacción");
      console.log("💡 Solución: Asegúrate de tener suficientes tokens en tu wallet.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error general:", error);
    process.exit(1);
  }); 