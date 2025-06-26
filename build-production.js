#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando build de producción...');

// Función para reemplazar configuración
function updateConfigForProduction() {
  console.log('📝 Actualizando configuración para producción...');
  
  const configPath = path.join(__dirname, 'src/config/index.ts');
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Reemplazar URLs del backend con las de producción
  configContent = configContent.replace(
    /BASE_URL: 'http:\/\/192\.168\.1\.131:3001\/api'/g,
    "BASE_URL: 'https://tu-servidor-produccion.com/api'"
  );
  
  configContent = configContent.replace(
    /UPLOADS_URL: 'http:\/\/192\.168\.1\.131:3001\/uploads'/g,
    "UPLOADS_URL: 'https://tu-servidor-produccion.com/uploads'"
  );
  
  fs.writeFileSync(configPath, configContent);
  console.log('✅ Configuración actualizada para producción');
}

// Función para restaurar configuración de desarrollo
function restoreDevConfig() {
  console.log('🔄 Restaurando configuración de desarrollo...');
  
  const configPath = path.join(__dirname, 'src/config/index.ts');
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Restaurar URLs del backend de desarrollo
  configContent = configContent.replace(
    /BASE_URL: 'https:\/\/tu-servidor-produccion\.com\/api'/g,
    "BASE_URL: 'http://192.168.1.131:3001/api'"
  );
  
  configContent = configContent.replace(
    /UPLOADS_URL: 'https:\/\/tu-servidor-produccion\.com\/uploads'/g,
    "UPLOADS_URL: 'http://192.168.1.131:3001/uploads'"
  );
  
  fs.writeFileSync(configPath, configContent);
  console.log('✅ Configuración de desarrollo restaurada');
}

// Función principal
async function buildProduction() {
  try {
    // 1. Actualizar configuración
    updateConfigForProduction();
    
    // 2. Limpiar cache
    console.log('🧹 Limpiando cache...');
    execSync('npx expo start --clear', { stdio: 'inherit' });
    
    // 3. Build para web
    console.log('🌐 Generando build para web...');
    execSync('npx expo export:web', { stdio: 'inherit' });
    
    // 4. Build para Android
    console.log('🤖 Generando build para Android...');
    execSync('npx expo build:android', { stdio: 'inherit' });
    
    // 5. Build para iOS
    console.log('🍎 Generando build para iOS...');
    execSync('npx expo build:ios', { stdio: 'inherit' });
    
    console.log('✅ Build de producción completado exitosamente!');
    console.log('📁 Los archivos están en:');
    console.log('   - Web: ./web-build/');
    console.log('   - Android: ./android/');
    console.log('   - iOS: ./ios/');
    
  } catch (error) {
    console.error('❌ Error durante el build:', error);
    
    // Restaurar configuración en caso de error
    restoreDevConfig();
    process.exit(1);
  } finally {
    // Restaurar configuración de desarrollo
    restoreDevConfig();
  }
}

// Ejecutar build
buildProduction(); 