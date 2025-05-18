# Configuración de Variables de Entorno

Este documento detalla las variables de entorno necesarias para ejecutar Fractea correctamente.

## Frontend (.env.local)

Crea un archivo `.env.local` en la carpeta `frontend` con las siguientes variables:

```
# Dirección del contrato FracteaNFT en Mantle Sepolia
NEXT_PUBLIC_FRACTEA_CONTRACT_ADDRESS=0xC7301a077d4089C6e620B6f41C1fE70686092057

# URL del RPC de Mantle Sepolia
NEXT_PUBLIC_MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz

# Opcional: Solo para modo producción (integración real)
# Clave privada de la wallet relayer para transacciones gasless
# NEXT_PUBLIC_RELAYER_KEY=tu_clave_privada_de_relayer
```

## Backend (.env)

Crea un archivo `.env` en la carpeta `backend` con las siguientes variables:

```
# Clave privada para desplegar y gestionar contratos
PRIVATE_KEY=tu_clave_privada_para_despliegue

# RPC URL para Mantle Sepolia
MANTLE_SEPOLIA_URL=https://rpc.sepolia.mantle.xyz

# Opcional: API Key para verificar contratos
# ETHERSCAN_API_KEY=tu_api_key_para_verificacion
```

## Notas importantes:

1. **Nunca compartas tus claves privadas**: Asegúrate de no subir tus archivos `.env` o `.env.local` a GitHub.
2. **Seguridad para el Relayer**: En un entorno de producción, el `RELAYER_KEY` debería estar solo en un backend seguro, no en el frontend.
3. **Obtener MNT para tests**: Para obtener MNT gratuito en Mantle Sepolia, usa el faucet oficial: [https://faucet.sepolia.mantle.xyz](https://faucet.sepolia.mantle.xyz)
4. **Verificación de contratos**: Si deseas verificar el contrato en el explorador de bloques, necesitarás configurar una API key correspondiente.

## Modo Desarrollo vs. Producción

- En **modo desarrollo** (`npm run dev`), la mayoría de las transacciones blockchain son simuladas.
- En **modo producción** (`npm run build && npm run start`), se intentarán realizar transacciones reales utilizando el `RELAYER_KEY` si está configurado. 