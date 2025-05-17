const hre = require("hardhat");

// Dirección del contrato desplegado - actualiza esto con tu dirección actual
const FRACTEA_NFT_ADDRESS = "0xC7301a077d4089C6e620B6f41C1fE70686092057";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Cuenta utilizada:", deployer.address);
  
  // Obtenemos la instancia del contrato
  const FracteaNFT = await hre.ethers.getContractFactory("FracteaNFT");
  const fracteaNFT = FracteaNFT.attach(FRACTEA_NFT_ADDRESS);
  
  // Menú de opciones
  console.log("\n=== MENÚ DE GESTIÓN DEL CONTRATO FRACTEA NFT ===");
  console.log("1. Configurar relayer");
  console.log("2. Acuñar fracciones de propiedad");
  console.log("3. Depositar renta");
  console.log("4. Consultar información de propiedad");
  
  // Lee la opción desde la variable de entorno OPTION
  const option = process.env.OPTION || "";
  console.log(`\nOpción seleccionada: ${option || "ninguna"}`);
  
  switch (option) {
    case "1":
      await setRelayer(fracteaNFT, deployer);
      break;
    case "2":
      await mintFraction(fracteaNFT, deployer);
      break;
    case "3":
      await depositRent(fracteaNFT, deployer);
      break;
    case "4":
      await getPropertyInfo(fracteaNFT, deployer);
      break;
    default:
      console.log("⚠️ Opción no válida o no especificada. Ejecuta con: OPTION=1 npx hardhat run scripts/manage-contract.js --network mantleSepolia");
  }
}

async function setRelayer(contract, signer) {
  try {
    console.log("\n📡 Configurando relayer...");
    
    // Usar función directa para llamar al método del contrato
    const tx = await contract.setRelayer(signer.address);
    await tx.wait();
    
    console.log("✅ Relayer configurado correctamente:", signer.address);
  } catch (error) {
    console.error("❌ Error al configurar relayer:", error.message);
  }
}

async function mintFraction(contract, signer) {
  try {
    const propertyId = 1; // ID de la propiedad
    const recipient = signer.address; // Destinatario (puede ser cualquier dirección)
    const amount = 100; // Cantidad de fracciones (100 = 100%)
    
    console.log(`\n🔨 Acuñando ${amount} fracciones de la propiedad #${propertyId} para ${recipient}...`);
    
    const tx = await contract.mintFraction(recipient, propertyId, amount);
    await tx.wait();
    
    console.log(`✅ Fracciones acuñadas con éxito!`);
  } catch (error) {
    console.error("❌ Error al acuñar fracciones:", error.message);
  }
}

async function depositRent(contract, signer) {
  try {
    const propertyId = 1; // ID de la propiedad
    const rentAmount = hre.ethers.parseEther("0.01"); // 0.01 ETH como ejemplo
    
    console.log(`\n💰 Depositando ${hre.ethers.formatEther(rentAmount)} ETH como renta para la propiedad #${propertyId}...`);
    
    const tx = await contract.depositRent(propertyId, { value: rentAmount });
    await tx.wait();
    
    console.log("✅ Renta depositada con éxito!");
  } catch (error) {
    console.error("❌ Error al depositar renta:", error.message);
  }
}

async function getPropertyInfo(contract, signer) {
  try {
    const propertyId = 1; // ID de la propiedad
    
    console.log(`\n🔍 Consultando información de la propiedad #${propertyId}...`);
    
    const property = await contract.properties(propertyId);
    const balance = await contract.balanceOf(signer.address, propertyId);
    const claimable = await contract.calculateClaimable(propertyId, signer.address);
    
    console.log("=== INFORMACIÓN DE LA PROPIEDAD ===");
    console.log(`• Total Supply: ${property.totalSupply} fracciones`);
    console.log(`• Total Rent: ${hre.ethers.formatEther(property.totalRent)} ETH`);
    console.log(`• Fecha de creación: ${new Date(Number(property.createdAt) * 1000).toLocaleString()}`);
    console.log(`• Tu balance: ${balance} fracciones`);
    console.log(`• Renta reclamable: ${hre.ethers.formatEther(claimable)} ETH`);
  } catch (error) {
    console.error("❌ Error al consultar información:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error general:", error);
    process.exit(1);
  }); 