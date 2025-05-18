#!/bin/bash

# Script para actualizar el repositorio Git con los cambios de wallet custodial
echo "Actualizando Git con los cambios de wallet custodial..."

# 1. Añadir archivos de tests organizados por categoría
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

# 2. Crear commits organizados
echo "Creando commits..."

# Commit para tests
git commit -m "test: implementa suite completa de pruebas para wallet custodial

- Añade tests unitarios para funcionalidad core
- Añade tests de integración para API
- Implementa pruebas de manejo de errores
- Añade tests básicos de UI
- Mejora la cobertura total al ~80%"

# 3. Push al repositorio
echo "¿Deseas hacer push de los cambios a la rama actual? (s/n)"
read respuesta

if [ "$respuesta" = "s" ]; then
  git push
  echo "Cambios publicados exitosamente"
else
  echo "Cambios commiteados localmente. Puedes hacer push manualmente cuando estés listo"
fi

echo "Proceso completado!" 