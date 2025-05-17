import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const data = await req.json();
    const { propertyId, email } = data;
    
    if (!propertyId || !email) {
      return NextResponse.json(
        { error: 'Se requiere propertyId y email' }, 
        { status: 400 }
      );
    }
    
    // El backend no tiene acceso directo a localStorage, así que devolvemos
    // información para que el cliente actualice el estado por sí mismo
    
    // Simulamos el monto a reclamar (en un entorno real esto vendría de la blockchain)
    let amount = '0';
    
    // Si incluye un monto como parámetro, lo usamos (viene de la UI)
    if (data.claimableAmount && parseFloat(data.claimableAmount) > 0) {
      amount = data.claimableAmount;
    } else {
      // Valor predeterminado si no hay monto especificado
      amount = '0.0005';
    }
    
    return NextResponse.json({
      success: true,
      amount: amount,
      txHash: '0x' + Math.random().toString(16).substring(2, 34),
      email: email,
      propertyId: propertyId
    });
  } catch (error) {
    console.error('Error al procesar la reclamación:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar la reclamación' }, 
      { status: 500 }
    );
  }
} 