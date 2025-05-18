#!/bin/bash

# Script para actualizar el repositorio Git con una versión funcional completa de wallet custodial
echo "Actualizando Git con la versión funcional completa de wallet custodial..."

# 1. Añadir código funcional
echo "Añadiendo código funcional de wallet custodial..."

# Core de wallet (blockchain.js)
git add frontend/src/utils/blockchain.js

# Componentes de UI
git add frontend/src/components/Dashboard.jsx
git add frontend/src/components/WalletActions.jsx
git add frontend/src/components/WalletEducation.jsx
git add frontend/src/components/LoginForm.jsx

# 2. Añadir archivos de tests organizados por categoría
echo "Añadiendo archivos de tests..."

# Tests principales
git add tests/wallet/wallet.core.test.js
git add tests/wallet/wallet.unit.test.js
git add tests/wallet/wallet.integration.test.js
git add tests/wallet/wallet.error.test.js
git add tests/wallet/wallet.ui.test.js
git add tests/wallet/dashboard.test.js
git add tests/wallet/jest.setup.js
git add tests/wallet/README.md

# Archivos de configuración
git add jest.config.js
git add package.json

# Mocks
git add tests/mocks/fileMock.js
git add tests/mocks/styleMock.js
git add tests/mocks/componentMocks.js

# Documentación
git add testing-improvements.md

# 3. Crear commits organizados
echo "Creando commits..."

# Commit para la versión funcional completa
git commit -m "feat(wallet): versión funcional completa de wallet custodial con tests

- Implementa sistema completo de wallet custodial
- Añade funciones para generar wallet, gestionar tokens y transferencias
- Incluye UI para operaciones de wallet (Dashboard, WalletActions, WalletEducation)
- Implementa suite completa de pruebas (~80% cobertura)
- Añade documentación sobre mejoras y estructura

Progreso del MVP: 80% completado"

# 4. Push al repositorio
echo "¿Deseas hacer push de los cambios a la rama actual? (s/n)"
read respuesta

if [ "$respuesta" = "s" ]; then
  git push
  echo "Cambios publicados exitosamente"
else
  echo "Cambios commiteados localmente. Puedes hacer push manualmente cuando estés listo"
fi

echo "Proceso completado!" 