# 🏢 Fractea: Inversión Inmobiliaria Tokenizada

Fractea es una plataforma que democratiza la inversión inmobiliaria mediante la tokenización de propiedades en blockchain. Permite a los usuarios invertir en fracciones de bienes raíces desde $1,000 USD, eliminando las barreras tradicionales de entrada al mercado inmobiliario y proporcionando liquidez a un activo históricamente ilíquido.

> **Problema:** Invertir en bienes raíces requiere grandes capitales y conocimientos especializados.  
> **Solución:** Tokenización inmobiliaria con experiencia web2 y tecnología blockchain.

## 🚀 Estado Actual del MVP

Este MVP demuestra la visión completa del producto con algunos componentes funcionales y otros simulados:

### ✅ Conectado a Blockchain Real
- Smart Contract ERC-1155 desplegado en Mantle Sepolia
- Consulta de balances nativos (MNT) en blockchain
- Interacción parcial con transacciones en modo producción
- Estructura de datos para propiedades y fracciones tokenizadas

### 🧪 Simulado / Mock
- Sistema de autenticación y registro de usuarios
- Wallet custodial (generación de direcciones real, almacenamiento simulado)
- Inversión en propiedades (UI completa, transacciones simuladas)
- Cobro de rentas (distribución proporcional simulada)
- APIs de backend (respuestas predefinidas)

### 🎮 Demo Funcional
En la demo puedes:
- Registrarte y obtener una wallet custodial
- Ver propiedades disponibles para inversión
- Invertir $1,000 en una propiedad (simulado)
- Visualizar tus fracciones y porcentaje de propiedad
- Cobrar rentas acumuladas
- Ver historial de cobros y transacciones

## 🧱 Stack Tecnológico

### Frontend
- **Framework:** Next.js 14 con App Router
- **UI Library:** React
- **Styling:** Tailwind CSS
- **Web3:** ethers.js v6

### Blockchain
- **Red:** Mantle Sepolia (testnet)
- **Smart Contract:** ERC-1155 personalizado (FracteaNFT)
- **Lenguaje:** Solidity 0.8.20
- **Herramientas:** Hardhat, OpenZeppelin

### Backend (Simulado)
- **API Routes:** Next.js API Routes
- **Persistencia:** LocalStorage (demo)
- **Simulación:** Wallet custodial, balance de tokens, historiales

## 🔧 Cómo Ejecutar Localmente

### Requisitos Previos
- Node.js v18+ ([descargar aquí](https://nodejs.org/))
- npm o yarn
- Git

### Instalación y Ejecución del Frontend

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/elnicomaldonado/fractea.git
   cd fractea
   ```

2. **Instalar dependencias del frontend**
   ```bash
   cd frontend
   npm install
   ```

3. **Configurar variables de entorno**
   Crea un archivo `.env.local` en la carpeta `frontend` con:
   ```
   NEXT_PUBLIC_FRACTEA_CONTRACT_ADDRESS=0xC7301a077d4089C6e620B6f41C1fE70686092057
   NEXT_PUBLIC_MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
   # Opcional para modo producción (integración real)
   # NEXT_PUBLIC_RELAYER_KEY=tu_clave_privada_de_relayer
   ```

   Ver [ENV-SETUP.md](ENV-SETUP.md) para instrucciones detalladas sobre todas las variables de entorno.

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`

5. **Ejecutar en modo producción** (opcional, para pruebas de integración real)
   ```bash
   npm run build
   npm run start
   ```

### Instalación y Despliegue de Contratos (Opcional)

Si deseas trabajar con los contratos inteligentes:

1. **Instalar dependencias del backend**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar variables de entorno para Hardhat**
   Crea un archivo `.env` en la carpeta `backend` con:
   ```
   PRIVATE_KEY=tu_clave_privada_para_despliegue
   MANTLE_SEPOLIA_URL=https://rpc.sepolia.mantle.xyz
   ```

3. **Compilar los contratos**
   ```bash
   npx hardhat compile
   ```

4. **Ejecutar tests (opcional)**
   ```bash
   npx hardhat test
   ```

5. **Desplegar en Mantle Sepolia (opcional)**
   ```bash
   npx hardhat run scripts/deploy.js --network mantleSepolia
   ```

## 📸 Capturas de Pantalla

> *[Aquí se incluirán capturas de pantalla o un GIF de la demo]*

## 🛠️ Contratos Inteligentes

### FracteaNFT (ERC-1155)
- **Dirección:** [0xC7301a077d4089C6e620B6f41C1fE70686092057](https://explorer.sepolia.mantle.xyz/address/0xC7301a077d4089C6e620B6f41C1fE70686092057)
- **Red:** Mantle Sepolia (Chain ID: 5003)

### Funciones Principales

- `mintFraction(address to, uint256 propertyId, uint256 amount)`: Crea tokens para una propiedad
- `depositRent(uint256 propertyId)`: Deposita rentas para distribución
- `claimRent(uint256 propertyId, address user)`: Permite a usuarios reclamar rentas proporcionales
- `calculateClaimable(uint256 propertyId, address user)`: Calcula rentas disponibles para reclamar

### Estructura de Datos On-Chain
```solidity
struct Property {
    uint256 totalSupply;    // Total de fracciones
    uint256 totalRent;      // Rentas acumuladas
    uint256 createdAt;      // Timestamp de creación
}
```

## 🧪 Estado de la Auditoría Técnica

### Implementado con blockchain real:
- Contrato FracteaNFT (ERC-1155) desplegado en Mantle Sepolia
- Estructura de datos para propiedades y fracciones
- Funciones de consulta básicas hacia blockchain real
- Sincronización de balance MNT nativo desde la red

### Simulado/Mocks:
- Sistema de autenticación y registro
- Wallet custodial (generación de direcciones real, almacenamiento simulado)
- Inversión en propiedades (transacciones simuladas)
- Cobro de rentas (distribución proporcional simulada)
- APIs de backend (respuestas predefinidas)

### No implementado (roadmap):
- Sistema completo de relayer para transacciones gasless
- Seguridad real para claves privadas
- Almacenamiento persistente en base de datos
- Sistema de KYC/AML
- Marketplace para fracciones

## 🗺️ Roadmap Post-Hackathon

### Corto plazo (3 meses)
- **Backend real:** Implementación de API segura y persistencia en base de datos
- **Relayer:** Sistema para transacciones gasless (meta-transactions)
- **Seguridad de wallets:** Implementación de almacenamiento seguro de claves
- **Real-estate partnerships:** Alianzas con desarrolladores inmobiliarios

### Medio plazo (6-12 meses)
- **KYC/AML:** Cumplimiento regulatorio para inversores
- **Marketplace:** Compra/venta de fracciones en mercado secundario
- **Mobile app:** Aplicación nativa para iOS/Android
- **Multi-token:** Soporte para inversión con stablecoins

### Largo plazo (12+ meses)
- **DeFi integration:** Usar fracciones como colateral para préstamos
- **Multi-chain:** Soporte para múltiples blockchains
- **DAO governance:** Sistema de gobernanza para propietarios de fracciones
- **Real-world legal framework:** Estructura legal completa para tokenización inmobiliaria global

## 🤝 Créditos y Agradecimientos

**Desarrollado por:**
- Nicolás Maldonado

**Herramientas:**
- Cursor (IDE)
- ChatGPT (Asistencia de código)
- Hardhat (Desarrollo de contratos)
- Next.js (Framework frontend)
- Mantle (Blockchain L2)

## 📄 Licencia

Este proyecto está licenciado bajo la licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

*Este proyecto fue creado como parte de [ETH Global LATAM] y está en fase de prototipo.*

### Pruebas en Blockchain Real (Opcional)

Si deseas probar transacciones reales en Mantle Sepolia:

1. **Obtener MNT de testnet:**
   Visita [https://faucet.sepolia.mantle.xyz](https://faucet.sepolia.mantle.xyz) para obtener MNT gratuito en testnet.

2. **Ejecutar prueba de transacción:**
   ```bash
   # Con ethers.js v6 (recomendado)
   chmod +x test-sepolia-tx-v6.sh
   ./test-sepolia-tx-v6.sh

   # O con ethers.js v5
   chmod +x test-sepolia-tx.sh
   ./test-sepolia-tx.sh
   ```

   Estos scripts te guiarán para enviar una transacción de prueba segura en Mantle Sepolia.

> **⚠️ IMPORTANTE:** Estos scripts son SOLO para testnet y requieren una clave privada para transacciones de prueba. Nunca uses claves que contengan fondos reales.
