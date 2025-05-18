#!/bin/bash

# Script para probar transacciones en Mantle Sepolia con ethers v6
# Asegúrate de que este script tiene permisos de ejecución (chmod +x test-sepolia-tx-v6.sh)

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}======================================${NC}"
echo -e "${YELLOW}Prueba de Transacción en Mantle Sepolia${NC}"
echo -e "${YELLOW}======================================${NC}"

# ADVERTENCIA DE SEGURIDAD
echo -e "${RED}⚠️  ADVERTENCIA DE SEGURIDAD ⚠️${NC}"
echo -e "${RED}Este script es SOLO para pruebas en testnet.${NC}"
echo -e "${RED}NUNCA uses una clave privada que contenga fondos reales.${NC}"
echo -e "${RED}NUNCA compartas o expongas tu clave privada.${NC}"
echo -e "${BLUE}Este script no almacena tu clave privada, solo la usa temporalmente.${NC}"
echo 

# Verificar si estamos en el directorio correcto
if [ ! -d "frontend" ]; then
  echo -e "${RED}Error: Este script debe ejecutarse desde el directorio raíz del proyecto${NC}"
  exit 1
fi

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
  echo -e "${RED}Error: Node.js no está instalado. Por favor, instala Node.js para continuar.${NC}"
  exit 1
fi

# Verificar si ethers está instalado correctamente
if ! npm list ethers &> /dev/null; then
  echo -e "${YELLOW}Instalando dependencia ethers...${NC}"
  npm install --save ethers@latest
fi

# Solicitar clave privada si no se proporciona como argumento
if [ -z "$1" ]; then
  echo -e "${YELLOW}Ingresa tu clave privada para la wallet de prueba:${NC}"
  read -s PRIVATE_KEY
  echo # Salto de línea después de input
else
  PRIVATE_KEY=$1
fi

# Dirección de destino opcional
if [ -z "$2" ]; then
  # Usar una dirección de ejemplo (esta es una dirección de ejemplo conocida, no contiene fondos reales)
  RECIPIENT="0x000000000000000000000000000000000000dEaD"
  echo -e "${YELLOW}Usando dirección de destino predeterminada (dirección burn): ${RECIPIENT}${NC}"
else
  RECIPIENT=$2
  echo -e "${YELLOW}Usando dirección de destino proporcionada: ${RECIPIENT}${NC}"
fi

echo -e "${YELLOW}Preparando entorno...${NC}"
echo

# Ejecutar el script de prueba con variables temporales que no se guardan
export TEST_PRIVATE_KEY=$PRIVATE_KEY
export TEST_RECIPIENT=$RECIPIENT

echo -e "${GREEN}Ejecutando prueba de transacción...${NC}"
node frontend/src/scripts/test-sepolia-transaction-v6.js

# Limpiar variables de entorno sensibles
unset TEST_PRIVATE_KEY
unset TEST_RECIPIENT

# Verificar resultado
if [ $? -eq 0 ]; then
  echo
  echo -e "${GREEN}=============================================${NC}"
  echo -e "${GREEN}Prueba completada. Verifica el explorador de Mantle Sepolia${NC}"
  echo -e "${GREEN}para confirmar que la transacción aparece correctamente.${NC}"
  echo -e "${GREEN}=============================================${NC}"
else
  echo
  echo -e "${RED}=============================================${NC}"
  echo -e "${RED}Hubo un error durante la prueba. Verifica los errores arriba.${NC}"
  echo -e "${RED}=============================================${NC}"
fi 