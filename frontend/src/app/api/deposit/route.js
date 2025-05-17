import { NextResponse } from 'next/server';

// Simulación de wallets custodiadas - esto estaría en una base de datos en un entorno real
const USERS_DB = {
  'demo@fractea.app': {
    userId: 'user_demo123',
    address: '0xe505fEe4bD1B2F380017f65adB9DE550Ca06D191',
    balances: { 1: 20 },
    claimable: { 1: '0.001' }
  },
  'test@fractea.app': {
    userId: 'user_test456',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    balances: { 1: 10 },
    claimable: { 1: '0.0005' }
  }
};

// Esta función simula un depósito de renta y la distribución a los propietarios
async function simulateRentDeposit(propertyId, amount) {
  // Simular delay de blockchain
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // En un entorno real, llamaríamos al contrato para depositar la renta
  // const contract = new ethers.Contract(FRACTEA_NFT_ADDRESS, FRACTEA_NFT_ABI, adminWallet);
  // const tx = await contract.depositRent(propertyId, { value: ethers.parseEther(amount) });
  // await tx.wait();
  
  // Calcular el total de fracciones para esta propiedad
  const totalSupply = Object.values(USERS_DB).reduce((sum, user) => {
    return sum + (user.balances[propertyId] || 0);
  }, 0);
  
  if (totalSupply > 0) {
    // Distribuir la renta proporcionalmente entre los propietarios
    for (const email in USERS_DB) {
      const user = USERS_DB[email];
      const userBalance = user.balances[propertyId] || 0;
      
      if (userBalance > 0) {
        // Calcular la parte proporcional de la renta
        const share = (userBalance / totalSupply) * parseFloat(amount);
        
        // Añadir a la renta reclamable
        const currentClaimable = parseFloat(user.claimable[propertyId] || '0');
        user.claimable[propertyId] = (currentClaimable + share).toFixed(6);
      }
    }
  }
  
  return {
    success: true,
    amount,
    propertyId,
    totalSupply,
    timestamp: new Date().toISOString(),
    txHash: '0x' + Math.random().toString(16).substring(2, 34)
  };
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { propertyId, amount } = data;
    
    if (!propertyId || !amount) {
      return NextResponse.json(
        { error: 'Se requiere propertyId y amount' }, 
        { status: 400 }
      );
    }
    
    if (parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor a 0' }, 
        { status: 400 }
      );
    }
    
    // Procesar el depósito de renta
    const result = await simulateRentDeposit(propertyId, amount);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error al procesar el depósito:', error);
    return NextResponse.json(
      { error: 'Error al procesar el depósito' }, 
      { status: 500 }
    );
  }
} 