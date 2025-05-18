# Plan de Implementación Web 2.5 para Fractea

## Estructura de Carpetas

```
frontend/src/
├── components/
│   ├── wallet/
│   │   ├── TransactionCard.jsx         # Tarjeta de transacción individual
│   │   ├── TransactionDetail.jsx       # Vista detallada (como en la imagen)
│   │   ├── TransactionHistory.jsx      # Listado de transacciones
│   │   ├── MigrationPrompt.jsx         # Componente para migración
│   │   ├── WalletStats.jsx             # Resumen de wallet (saldos, etc)
│   │   └── BlockchainVerification.jsx  # Componente para verificación
│   └── ui/
│       ├── StatusBadge.jsx             # Badge de estado (Completed, etc)
│       ├── DetailRow.jsx               # Fila de detalle (label + valor)
│       └── CopyableText.jsx            # Texto con botón de copia
├── services/
│   ├── wallet/
│   │   ├── custodialWallet.js          # Lógica de wallet custodial
│   │   ├── migrationService.js         # Servicio para migración
│   │   └── transactionService.js       # Manejo de transacciones
│   └── blockchain/
│       ├── mantleProvider.js           # Conexión a Mantle
│       ├── explorerService.js          # URLs y utilidades de explorador
│       └── contractInteractions.js     # Interacciones con smart contracts
└── utils/
    ├── formatters.js                   # Formateadores (direcciones, montos)
    ├── validators.js                   # Validaciones
    └── constants.js                    # Constantes
```

## Plan de Implementación

### Fase 1: Servicios de Backend (1-2 semanas)

1. **Implementar Sistema de Wallet Custodial**
   - Servicio de generación y gestión de claves
   - Almacenamiento seguro (encriptación)
   - Conexión a Mantle testnet

2. **Crear Servicio de Transacciones**
   - Firma de transacciones con wallet custodial
   - Manejo de estados (pending, completed, failed)
   - Logging de transacciones y errores

3. **Configurar Contratos en Mantle**
   - Desplegar contratos necesarios en testnet
   - Crear ABI y interfaces para interacción

### Fase 2: Componentes UI Básicos (1-2 semanas)

1. **Implementar TransactionCard y TransactionDetail**
   - UI similar a la mostrada en la imagen de referencia
   - Mostrar datos básicos (monto, fecha, estado)
   - Enlaces a explorador de Mantle

2. **Crear TransactionHistory**
   - Listado de transacciones con filtros
   - Paginación y búsqueda
   - Visualización de estados

3. **Implementar WalletStats**
   - Mostrar saldos y balances
   - Resumen de actividad
   - Call-to-action para operaciones

### Fase 3: Funcionalidad de Verificación (1 semana)

1. **BlockchainVerification**
   - Componente para verificar transacciones
   - Enlaces directos al explorador
   - Visualización de estados en cadena

2. **ExplorerService**
   - URLs para Mantle testnet/mainnet
   - Formateo de direcciones y hashes
   - Utilidades de verificación

### Fase 4: Sistema de Migración (1-2 semanas)

1. **MigrationPrompt**
   - UI para informar sobre opciones
   - Flujo paso a paso

2. **MigrationService**
   - Lógica para trasladar activos
   - Conexión con wallets externas
   - Validaciones y seguridad

## Prioridades iniciales

Para comenzar hoy, implementaremos:

1. **mantleProvider.js** - Conexión básica a Mantle
2. **TransactionDetail.jsx** - UI para mostrar detalles de transacción
3. **custodialWallet.js** - Lógica inicial de wallet custodial 