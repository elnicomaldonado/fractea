import { ethers } from 'ethers';
import { 
  FRACTEA_NFT_ADDRESS, 
  FRACTEA_NFT_ABI, 
  FRACTEA_NETWORK_ID 
} from '../contracts/FracteaNFT';

// RPC URL for Mantle Sepolia
const RPC_URL = "https://rpc.sepolia.mantle.xyz";

/**
 * Creates a read-only provider for querying blockchain data
 */
export function getReadProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

/**
 * Creates a read-only contract instance
 */
export function getReadOnlyContract() {
  const provider = getReadProvider();
  return new ethers.Contract(FRACTEA_NFT_ADDRESS, FRACTEA_NFT_ABI, provider);
}

/**
 * Creates a contract instance for write operations using wallet
 * @param {Object} wallet - Ethers wallet or web3 provider from MetaMask
 */
export function getWriteContract(wallet) {
  return new ethers.Contract(FRACTEA_NFT_ADDRESS, FRACTEA_NFT_ABI, wallet);
}

/**
 * Get property details
 * @param {number} propertyId - ID of the property
 */
export async function getPropertyDetails(propertyId) {
  const contract = getReadOnlyContract();
  const property = await contract.properties(propertyId);
  
  return {
    id: propertyId,
    totalSupply: Number(property.totalSupply),
    totalRent: ethers.formatEther(property.totalRent),
    createdAt: new Date(Number(property.createdAt) * 1000),
  };
}

/**
 * Get user's balance for a property
 * @param {string} address - User's address
 * @param {number} propertyId - ID of the property
 */
export async function getUserBalance(address, propertyId) {
  const contract = getReadOnlyContract();
  const balance = await contract.balanceOf(address, propertyId);
  return Number(balance);
}

/**
 * Get claimable rent amount
 * @param {number} propertyId - ID of the property
 * @param {string} address - User's address
 */
export async function getClaimableRent(propertyId, address) {
  const contract = getReadOnlyContract();
  const claimable = await contract.calculateClaimable(propertyId, address);
  return ethers.formatEther(claimable);
}

/**
 * Connect to wallet (MetaMask)
 */
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  // Request account access
  const accounts = await window.ethereum.request({ 
    method: 'eth_requestAccounts' 
  });

  // Check if connected to the correct network
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (parseInt(chainId, 16) !== FRACTEA_NETWORK_ID) {
    throw new Error(`Please connect to Mantle Sepolia network (Chain ID: ${FRACTEA_NETWORK_ID})`);
  }

  // Create provider and signer
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  return {
    address: accounts[0],
    signer
  };
} 