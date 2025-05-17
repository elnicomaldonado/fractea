require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Valores predeterminados para evitar errores si no existe .env
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const MANTLE_SEPOLIA_URL = process.env.MANTLE_SEPOLIA_URL || "https://rpc.sepolia.mantle.xyz";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20", // Actualizado para coincidir con el pragma del contrato
  networks: {
    mantleSepolia: {
      url: MANTLE_SEPOLIA_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5003,
    },
    hardhat: {
      // Configuración para pruebas locales
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};
