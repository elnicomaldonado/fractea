import { useState } from 'react';

export default function WalletEducation() {
  const [activeTopic, setActiveTopic] = useState('intro');
  
  // Temas educativos
  const topics = {
    intro: {
      title: 'Introducción a Wallets',
      content: `Una wallet (billetera) de criptomonedas es como tu cuenta bancaria en el mundo blockchain. 
        Tiene una dirección pública (similar a tu número de cuenta) y una clave privada 
        (similar a tu contraseña). La diferencia es que tu clave privada te da control total 
        de tus fondos en la blockchain, sin intermediarios.`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    custodial: {
      title: 'Wallets Custodiales vs No-Custodiales',
      content: `Una wallet custodial es administrada por un tercero (como Fractea), quien custodia 
        las claves privadas por ti, haciéndola más fácil de usar. Las wallets no-custodiales te 
        dan control total sobre tus claves privadas, pero requieren más responsabilidad: si pierdes 
        tus claves, pierdes acceso a tus fondos permanentemente.`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    tokens: {
      title: 'Tipos de Tokens',
      content: `eUSD: Es una stablecoin (criptomoneda estable) en la red Mantle, diseñada para mantener un valor de $1 USD, ideal para pagos.
        BTC: Bitcoin, la primera y más conocida criptomoneda, funciona como una reserva de valor global.
        ETH: Ether, la moneda nativa de Ethereum, potencia aplicaciones descentralizadas y contratos inteligentes.`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    security: {
      title: 'Seguridad en Wallets',
      content: `Nunca compartas tu clave privada o frase de recuperación con nadie.
        Utiliza autenticación de dos factores cuando esté disponible.
        Considera usar una hardware wallet para grandes cantidades.
        Verifica siempre las direcciones de destino antes de enviar fondos.
        Mantén actualizado el software de tu wallet.`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    mantle: {
      title: 'Red Mantle',
      content: `Mantle es una solución de capa 2 (L2) para Ethereum que ofrece transacciones más rápidas y económicas.
        Al utilizar tecnología de rollups, Mantle hereda la seguridad de Ethereum mientras mejora la escalabilidad.
        Las transacciones en Mantle suelen ser confirmadas en segundos y cuestan una fracción de lo que costarían en Ethereum.`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    }
  };
  
  // Lista de pasos para crear tu propia wallet
  const walletCreationSteps = [
    {
      title: 'Elige un proveedor de wallet',
      description: 'Recomendamos MetaMask, Rainbow, o Coinbase Wallet para principiantes.'
    },
    {
      title: 'Instala la extensión o app',
      description: 'Descarga desde fuentes oficiales (tiendas de aplicaciones o sitios web verificados).'
    },
    {
      title: 'Crea una nueva wallet',
      description: 'Sigue el proceso de configuración y GUARDA TU FRASE DE RECUPERACIÓN en un lugar seguro.'
    },
    {
      title: 'Configura la red Mantle',
      description: 'Añade la red Mantle a tu wallet: Chain ID 5000, RPC URL: https://rpc.sepolia.mantle.xyz'
    },
    {
      title: 'Transfiere tus fondos',
      description: 'Usa la dirección de tu nueva wallet para transferir fondos desde tu wallet custodial.'
    }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Aprende sobre Wallets y Blockchain</h2>
      
      {/* Navegación de tópicos */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(topics).map(([key, topic]) => (
          <button
            key={key}
            onClick={() => setActiveTopic(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTopic === key
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {topic.title}
          </button>
        ))}
      </div>
      
      {/* Contenido del tópico activo */}
      <div className="bg-gray-50 rounded-lg p-5 mb-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3 text-indigo-600">
            {topics[activeTopic].icon}
          </div>
          <h3 className="text-lg font-medium text-gray-900">{topics[activeTopic].title}</h3>
        </div>
        <p className="text-gray-600 whitespace-pre-line">{topics[activeTopic].content}</p>
      </div>
      
      {/* Sección: Cómo crear tu propia wallet */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cómo crear tu propia wallet</h3>
        <div className="space-y-4">
          {walletCreationSteps.map((step, index) => (
            <div key={index} className="flex">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3 text-indigo-600 font-bold">
                {index + 1}
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{step.title}</h4>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recursos adicionales */}
      <div className="bg-indigo-50 rounded-lg p-5">
        <h3 className="text-lg font-medium text-indigo-800 mb-3">Recursos adicionales</h3>
        <ul className="space-y-2">
          <li className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <a href="https://ethereum.org/es/wallets/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
              Guía de Wallets de Ethereum.org
            </a>
          </li>
          <li className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <a href="https://metamask.io/learn/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
              MetaMask: Aprende lo básico
            </a>
          </li>
          <li className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <a href="https://www.mantle.xyz/developers" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
              Documentación de Mantle Network
            </a>
          </li>
        </ul>
      </div>
      
      {/* Nueva sección sobre cómo obtener MNT de testnet */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">Obtener MNT para pruebas</h4>
        <p className="text-blue-700 mb-3">
          Para probar transacciones reales en la red Mantle Sepolia (testnet), puedes obtener tokens MNT gratuitos de prueba:
        </p>
        <ol className="list-decimal pl-5 text-blue-700 space-y-2 mb-3">
          <li>
            Visita el <a 
              href="https://faucet.sepolia.mantle.xyz/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium underline hover:text-blue-900"
            >
              Faucet oficial de Mantle Sepolia
            </a>
          </li>
          <li>Conecta tu wallet personal de MetaMask u otra wallet compatible</li>
          <li>Solicita MNT de prueba (cada solicitud otorga 0.5 MNT)</li>
          <li>Envía estos MNT a tu dirección de wallet custodial en Fractea</li>
          <li>Haz clic en "Sincronizar balance" para ver tus fondos en Fractea</li>
        </ol>
        <p className="text-blue-700 text-sm">
          <strong>Nota:</strong> Los tokens de testnet no tienen valor real y solo están disponibles para pruebas.
        </p>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-2">Beneficios del modelo Web 2.5</h4>
        <p className="text-gray-600 mb-3">
          Fractea usa un modelo "Web 2.5" que ofrece lo mejor de ambos mundos:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-3">
            <h5 className="font-medium text-gray-700 mb-2">Facilidad de Web2</h5>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Inicio de sesión con email</li>
              <li>No necesitas gestionar claves privadas</li>
              <li>Experiencia de usuario intuitiva</li>
              <li>Recuperación de cuenta sencilla</li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <h5 className="font-medium text-gray-700 mb-2">Beneficios de Web3</h5>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Propiedad real de activos tokenizados</li>
              <li>Transacciones verificables en blockchain</li>
              <li>Posibilidad de transferir a wallets externas</li>
              <li>Transparencia en todas las operaciones</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-800 mb-2">¿Quieres usar tu propia wallet?</h4>
        <p className="text-gray-600 mb-3">
          Si prefieres tener control total sobre tus claves privadas, puedes:
        </p>
        <ol className="list-decimal pl-5 text-gray-600 space-y-1">
          <li>Crear una wallet no-custodial como MetaMask, Trust Wallet o similar</li>
          <li>Transferir tus activos desde Fractea a tu wallet personal</li>
          <li>Gestionar tus propias claves y seguridad</li>
        </ol>
        <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
          <p className="text-yellow-800 text-sm">
            <strong>Importante:</strong> Si decides usar tu propia wallet, recuerda que serás 
            completamente responsable de la seguridad de tus claves privadas y fondos.
          </p>
        </div>
      </div>
    </div>
  );
}
