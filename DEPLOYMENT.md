# 🚀 Guía de Despliegue en Producción

## 📋 **Prerrequisitos**

### **Servidor de Producción**
- Servidor con Node.js 18+ instalado
- Dominio configurado (ej: `tu-app.com`)
- Certificado SSL (HTTPS obligatorio)
- Puerto 3001 abierto para el backend

### **Configuración del Backend**

1. **Subir el backend al servidor:**
```bash
# En tu servidor de producción
git clone <tu-repositorio>
cd backend
npm install
npm start
```

2. **Configurar PM2 para mantener el backend corriendo:**
```bash
npm install -g pm2
pm2 start index.js --name "localizador-backend"
pm2 startup
pm2 save
```

3. **Configurar Nginx como proxy reverso:**
```nginx
server {
    listen 80;
    server_name tu-app.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name tu-app.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Archivos de imágenes
    location /uploads/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend web
    location / {
        root /var/www/localizador-web;
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔧 **Configuración del Frontend**

### **1. Actualizar URLs de Producción**

Edita `src/config/index.ts` y cambia las URLs:

```typescript
BACKEND: {
  BASE_URL: 'https://tu-app.com/api', // Tu dominio real
  HEALTH_ENDPOINT: '/health',
  PLATES_ENDPOINT: '/plates',
  UPLOADS_URL: 'https://tu-app.com/uploads', // Tu dominio real
  CONNECTION_TIMEOUT: 15000,
  RETRY_INTERVAL: 30000,
},
```

### **2. Build para Web**

```bash
# En tu máquina local
cd LocalizadorDeMatriculas
npm run build:web
```

Esto generará la carpeta `web-build/` con los archivos optimizados.

### **3. Subir a Servidor Web**

```bash
# Subir archivos al servidor
scp -r web-build/* usuario@tu-servidor:/var/www/localizador-web/
```

### **4. Build para Móviles**

```bash
# Android APK
npm run build:android

# iOS (requiere cuenta de desarrollador)
npm run build:ios
```

## 📱 **Despliegue Automatizado**

### **Script de Despliegue Completo**

```bash
#!/bin/bash

echo "🚀 Iniciando despliegue de producción..."

# 1. Actualizar configuración
echo "📝 Actualizando configuración..."
sed -i 's/http:\/\/192\.168\.1\.131:3001/https:\/\/tu-app.com/g' src/config/index.ts

# 2. Build para web
echo "🌐 Generando build web..."
npm run build:web

# 3. Subir al servidor
echo "📤 Subiendo archivos..."
rsync -avz --delete web-build/ usuario@tu-servidor:/var/www/localizador-web/

# 4. Restaurar configuración de desarrollo
echo "🔄 Restaurando configuración de desarrollo..."
sed -i 's/https:\/\/tu-app.com/http:\/\/192.168.1.131:3001/g' src/config/index.ts

echo "✅ Despliegue completado!"
```

## 🔒 **Configuración de Seguridad**

### **Variables de Entorno**

Crea un archivo `.env.production` en el servidor:

```env
NODE_ENV=production
PORT=3001
DB_PATH=/var/lib/localizador/plates.db
UPLOADS_PATH=/var/lib/localizador/uploads
CORS_ORIGIN=https://tu-app.com
```

### **Firewall**

```bash
# Abrir solo puertos necesarios
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### **Backup Automático**

```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
cp /var/lib/localizador/plates.db /backups/plates_$DATE.db
find /backups -name "plates_*.db" -mtime +7 -delete
```

Agregar al crontab:
```bash
0 2 * * * /path/to/backup-db.sh
```

## 📊 **Monitoreo**

### **Logs del Backend**

```bash
# Ver logs en tiempo real
pm2 logs localizador-backend

# Ver estadísticas
pm2 monit
```

### **Monitoreo de Recursos**

```bash
# Instalar herramientas de monitoreo
sudo apt install htop iotop nethogs

# Monitorear uso de disco
df -h
du -sh /var/lib/localizador/*
```

## 🚨 **Solución de Problemas**

### **Problemas Comunes**

1. **Error de CORS**
   - Verificar configuración de CORS en el backend
   - Asegurar que el dominio esté en la lista blanca

2. **Error de conexión al backend**
   - Verificar que PM2 esté corriendo: `pm2 status`
   - Verificar logs: `pm2 logs localizador-backend`
   - Verificar puerto: `netstat -tlnp | grep 3001`

3. **Error de permisos**
   - Verificar permisos de carpetas: `ls -la /var/lib/localizador/`
   - Ajustar permisos: `chown -R node:node /var/lib/localizador/`

4. **Error de SSL**
   - Verificar certificado: `openssl x509 -in certificate.crt -text`
   - Renovar certificado si es necesario

## 📞 **Contacto de Emergencia**

En caso de problemas críticos:
- Revisar logs: `pm2 logs localizador-backend --lines 100`
- Reiniciar servicio: `pm2 restart localizador-backend`
- Verificar estado del servidor: `htop`

---

**¡Tu aplicación está lista para producción! 🎉** 