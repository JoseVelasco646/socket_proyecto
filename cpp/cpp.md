# 🛡️ Sistema de Escaneo y Monitoreo de Redes

## 📋 Tabla de Contenidos
- [Objetivo del Sistema](#objetivo-del-sistema)
- [Alcance](#alcance)
- [Arquitectura General](#arquitectura-general)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Funcionalidades Principales](#funcionalidades-principales)
- [Requisitos del Sistema](#requisitos-del-sistema)
- [Instalación y Despliegue](#instalación-y-despliegue)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)

---

## 🎯 Objetivo del Sistema

El **Sistema de Escaneo y Monitoreo de Redes** es una plataforma integral de seguridad y administración de infraestructura de red diseñada para proporcionar visibilidad completa, control y gestión automatizada de dispositivos en entornos de red corporativos.

### Objetivos Específicos:

1. **Monitoreo Proactivo**: Identificar y catalogar todos los dispositivos conectados a la red en tiempo real
2. **Seguridad Preventiva**: Detectar vulnerabilidades y servicios potencialmente inseguros
3. **Gestión Centralizada**: Administrar remotamente dispositivos mediante SSH con terminal interactivo
4. **Automatización**: Programar escaneos automáticos y acciones de control (apagado/reinicio de equipos)
5. **Control de Acceso**: Sistema de whitelist para restringir el acceso al sistema
6. **Trazabilidad**: Registro histórico de todos los escaneos y eventos de seguridad

---

## 📊 Alcance

### Funcionalidades Incluidas:

#### 🔍 **Escaneo de Red**
- ✅ **Ping Scanner**: Detección de hosts activos en la red
- ✅ **Port Scanner**: Análisis de puertos abiertos por dispositivo
- ✅ **Service Scanner**: Identificación de servicios y versiones
- ✅ **OS Detection**: Detección del sistema operativo
- ✅ **MAC Scanner**: Obtención de direcciones MAC y fabricantes
- ✅ **Vulnerability Scanner**: Detección de vulnerabilidades conocidas
- ✅ **Full Scan**: Escaneo completo combinando todas las técnicas anteriores

#### 🔐 **Seguridad y Control de Acceso**
- ✅ Whitelist de IPs permitidas con gestión dinámica
- ✅ IPs administradoras con permisos especiales
- ✅ Registro de intentos de acceso bloqueados
- ✅ Metadata de whitelist (descripción, fecha de agregado, agregado por)

#### ⏰ **Automatización y Programación**
- ✅ Programador de escaneos (horario, diario, semanal, mensual)
- ✅ Apagado automático de equipos vía SSH
- ✅ Reinicio programado de dispositivos
- ✅ Ejecución de comandos remotos personalizados

#### 💻 **Terminal SSH Interactivo**
- ✅ Conexión SSH en tiempo real mediante WebSocket
- ✅ Ejecución de comandos administrativos
- ✅ Soporte para sudo con credenciales encriptadas
- ✅ Gestión de múltiples sesiones concurrentes

#### 📈 **Reportes y Exportación**
- ✅ Exportación de resultados a Excel
- ✅ Generación de reportes PDF
- ✅ Visualización de datos en tablas interactivas
- ✅ Histórico de escaneos con filtros avanzados

#### 🌐 **Interfaz de Usuario**
- ✅ Dashboard responsive con Vue 3
- ✅ Modo oscuro/claro
- ✅ Notificaciones en tiempo real (toasts)
- ✅ Skeleton loaders para mejor UX
- ✅ Validación de inputs en tiempo real

### Limitaciones y Exclusiones:

- ❌ No incluye IDS/IPS (Sistema de Detección/Prevención de Intrusiones)
- ❌ No realiza pentesting activo avanzado
- ❌ No incluye análisis de tráfico de red en tiempo real
- ❌ No soporta autenticación de múltiples usuarios (sistema de whitelist por IP)

---

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (NAVEGADOR)                      │
│                    http://192.168.0.9:8080                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             │ WebSocket
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                          NGINX (Puerto 8080)                     │
│                    (Proxy Inverso y Balanceador)                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Servidor de archivos estáticos (Frontend)             │   │
│  │  • Reverse Proxy a Backend API                           │   │
│  │  • WebSocket Proxy para SSH Terminal                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────┬────────────────────────────────────┬──────────────────┘
          │                                    │
          │ /api/*                             │ Archivos estáticos
          │ /ws/*                              │ (Vue.js Build)
          ▼                                    ▼
┌──────────────────────────────┐    ┌─────────────────────────────┐
│    BACKEND (FastAPI)         │    │   FRONTEND (Vue 3 + Vite)   │
│    Puerto: 8000              │    │   Build estático            │
│  ┌────────────────────────┐  │    │  ┌────────────────────────┐ │
│  │  API REST              │  │    │  │ • Dashboard            │ │
│  │  • Escaneos de red     │  │    │  │ • Gestión Whitelist    │ │
│  │  • Gestión SSH         │  │    │  │ • Terminal SSH         │ │
│  │  • Programador tareas  │  │    │  │ • Programador Scans    │ │
│  │  • Whitelist           │  │    │  │ • Tablas de resultados │ │
│  │  • Reportes            │  │    │  │ • Exportación datos    │ │
│  └────────────────────────┘  │    │  └────────────────────────┘ │
│  ┌────────────────────────┐  │    │  Tecnologías:               │
│  │  WebSocket Manager     │  │    │  • Vue 3 Composition API    │
│  │  • Terminal SSH real   │  │    │  • Vue Router               │
│  │  • Múltiples sesiones  │  │    │  • Axios                    │
│  └────────────────────────┘  │    │  • TailwindCSS              │
│  ┌────────────────────────┐  │    │  • Lucide Icons             │
│  │  Scheduler Service     │  │    │  • jsPDF / ExcelJS          │
│  │  • APScheduler         │  │    └─────────────────────────────┘
│  │  • Tareas programadas  │  │
│  │  • Apagado automático  │  │
│  └────────────────────────┘  │
│  Tecnologías:                │
│  • FastAPI Framework         │
│  • SQLAlchemy ORM            │
│  • Python-nmap               │
│  • Paramiko / AsyncSSH       │
│  • APScheduler               │
│  • Cryptography              │
└──────────┬───────────────────┘
           │
           │ SQLAlchemy
           │
           ▼
┌──────────────────────────────┐
│   BASE DE DATOS PostgreSQL   │
│       Puerto: 5432           │
│  ┌────────────────────────┐  │
│  │  Tablas:               │  │
│  │  • ping_results        │  │
│  │  • port_scans          │  │
│  │  • service_scans       │  │
│  │  • vulnerability_scans │  │
│  │  • os_scans            │  │
│  │  • mac_scans           │  │
│  │  • scan_schedules      │  │
│  │  • hosts (agregada)    │  │
│  └────────────────────────┘  │
│  Características:            │
│  • Persistencia de datos     │
│  • Histórico de escaneos     │
│  • Configuración scheduler   │
│  • Credenciales encriptadas  │
└──────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     SERVICIOS EXTERNOS                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  • Nmap: Escaneo de red, puertos, servicios, OS, CVEs     │ │
│  │  • SSH: Conexión remota a dispositivos de red             │ │
│  │  • ICMP: Ping para detección de hosts activos             │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 🔄 Flujo de Datos

```
1. ESCANEO MANUAL
   Usuario → Frontend → API Request → Backend → Nmap/SSH → 
   → Procesamiento → PostgreSQL → Response → Frontend → Usuario

2. ESCANEO PROGRAMADO
   APScheduler → Scheduler Service → Ejecuta Scan → Nmap → 
   → Almacena en DB → (Opcional) Apagado SSH

3. TERMINAL SSH
   Usuario → Frontend WebSocket → Backend WS Handler → 
   → AsyncSSH → Dispositivo Remoto → Output → WS → Frontend

4. CONTROL DE ACCESO
   Request → Middleware Whitelist → Verifica IP → 
   → (Si bloqueada) Log + HTTP 403 → Frontend Access Denied
```

---

## 🛠️ Tecnologías Utilizadas

### **Backend**
| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| Python | 3.10+ | Lenguaje principal |
| FastAPI | 0.126.0 | Framework web asíncrono |
| SQLAlchemy | 2.0.45 | ORM para base de datos |
| PostgreSQL | 15+ | Base de datos relacional |
| python-nmap | 0.7.1 | Wrapper para Nmap |
| Paramiko | 4.0.0 | Cliente SSH |
| AsyncSSH | 2.22.0 | SSH asíncrono |
| APScheduler | 3.11.2 | Programador de tareas |
| Cryptography | 46.0.3 | Encriptación de credenciales |
| WebSockets | 15.0.1 | Comunicación en tiempo real |
| Pandas | 2.3.3 | Procesamiento de datos |
| ReportLab | 4.4.6 | Generación de PDFs |

### **Frontend**
| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| Vue.js | 3.5.25 | Framework JavaScript |
| Vue Router | 4.6.3 | Enrutamiento SPA |
| Axios | 1.13.2 | Cliente HTTP |
| TailwindCSS | 3.4.19 | Framework CSS |
| Vite | 7.2.4 | Build tool |
| Lucide Icons | 0.562.0 | Librería de iconos |
| jsPDF | 3.0.4 | Exportación PDF |
| ExcelJS | 4.4.0 | Exportación Excel |
| Vue Toastification | 2.0.0-rc.5 | Notificaciones |

### **Infraestructura**
- **Docker** + **Docker Compose**: Contenedores y orquestación
- **Nginx**: Proxy inverso y servidor de archivos estáticos
- **Nmap**: Herramienta de escaneo de red
- **PostgreSQL**: Sistema de gestión de base de datos

---

## ✨ Funcionalidades Principales

### 1. **Dashboard de Monitoreo**
- Vista general del estado de la red
- Indicadores de hosts activos/inactivos
- Últimos escaneos realizados
- Alertas de seguridad

### 2. **Módulos de Escaneo**

#### 📡 Ping Scanner
- Detección rápida de hosts activos
- Soporte para rangos de IP (192.168.0.1-254)
- Soporte para subredes CIDR (192.168.0.0/24)
- Medición de latencia en milisegundos

#### 🔌 Port Scanner
- Escaneo de puertos específicos o rangos
- Detección de puertos abiertos/cerrados/filtrados
- Top 1000 puertos más comunes
- Escaneo personalizado por puerto

#### ⚙️ Service Scanner
- Identificación de servicios corriendo en puertos
- Detección de versiones de software
- Banner grabbing
- Fingerprinting de aplicaciones

#### 🐧 OS Detection
- Detección de sistema operativo
- Precisión basada en Nmap OS fingerprinting
- Información de versión de kernel
- Tipo de dispositivo (router, PC, servidor)

#### 🔗 MAC Scanner
- Obtención de direcciones MAC
- Identificación de fabricante (vendor)
- Asociación IP-MAC
- Detección de cambios de MAC

#### 🚨 Vulnerability Scanner
- Escaneo de CVEs conocidos
- Detección de servicios vulnerables
- Puntuación de severidad
- Recomendaciones de mitigación

### 3. **Programador de Tareas**
- Frecuencias: horaria, diaria, semanal, mensual
- Configuración de hora específica
- Selección de tipo de escaneo
- Targets personalizables (rango, subnet, hosts individuales)
- Habilitación/deshabilitación de tareas
- Visualización de próxima ejecución

### 4. **Gestión SSH Remota**
- **Terminal Interactivo**: Conexión SSH en tiempo real vía WebSocket
- **Apagado/Reinicio**: Control remoto de equipos
- **Ejecución de Comandos**: Scripts personalizados
- **Credenciales Encriptadas**: Almacenamiento seguro de contraseñas

### 5. **Sistema de Whitelist**
- Gestión de IPs permitidas
- IPs administradoras con permisos especiales
- Metadata por IP (descripción, fecha, usuario)
- Log de intentos de acceso denegados
- Vista de Access Denied personalizada

### 6. **Exportación y Reportes**
- **Excel**: Exportación completa de tablas
- **PDF**: Reportes formateados con logo
- **Capturas**: Screenshots de resultados
- Filtros y ordenamiento de datos

---

## 💻 Requisitos del Sistema

### Requisitos Mínimos

#### Hardware
- **CPU**: 2 cores @ 2.0 GHz
- **RAM**: 4 GB
- **Almacenamiento**: 10 GB disponibles
- **Red**: Interfaz de red con acceso a la red objetivo

#### Software
- **Sistema Operativo**: 
  - Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+)
  - Windows 10/11 (con Docker Desktop)
  - macOS 11+ (con Docker Desktop)
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Nmap**: 7.80+ (instalado en el host o contenedor)
- **Navegador**: Chrome 90+, Firefox 88+, Edge 90+

### Requisitos Recomendados

#### Hardware
- **CPU**: 4+ cores @ 3.0 GHz
- **RAM**: 8+ GB
- **Almacenamiento**: 50 GB SSD
- **Red**: Gigabit Ethernet

#### Software
- **Sistema Operativo**: Ubuntu 22.04 LTS o Debian 12
- **Docker**: Última versión estable
- **PostgreSQL**: 15+

---

## 🚀 Instalación y Despliegue

### Opción 1: Docker Compose (Recomendado)

#### Desarrollo
```bash
# Clonar repositorio
git clone <repositorio>
cd jose

# Iniciar servicios
./start.sh  # Linux/macOS
.\start.ps1  # Windows PowerShell

# Los servicios estarán disponibles en:
# Frontend: http://192.168.0.9:8080
# Backend: http://192.168.0.9:8000
# PostgreSQL: localhost:5432
```

#### Producción
```bash
# Usar configuración de producción
docker-compose -f docker-compose.prod.yml up -d

# Verificar logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Opción 2: Instalación Manual

#### Backend
```bash
cd back/

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # Linux/macOS
.\venv\Scripts\activate   # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
nano .env

# Iniciar servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend
```bash
cd front/

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Producción
npm run build
npm run preview
```

#### PostgreSQL
```bash
# Instalar PostgreSQL
sudo apt-get install postgresql-15

# Crear base de datos
sudo -u postgres psql
CREATE DATABASE network_scanner;
CREATE USER scanner_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE network_scanner TO scanner_user;
```

---

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/network_scanner

# Whitelist de IPs
IP_WHITELIST=192.168.0.9,192.168.0.10,192.168.0.11
ADMIN_IPS=192.168.0.9,192.168.0.10

# Encriptación
ENCRYPTION_KEY=<generar-con-cryptography>

# Backend
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

# Frontend (para build)
VITE_API_URL=http://192.168.0.9:8000
```

### Configuración Nginx

```nginx
# nginx-unified.conf
server {
    listen 8080;
    server_name localhost;

    # Frontend (archivos estáticos)
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:8000/;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://backend:8000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 📁 Estructura del Proyecto

```
jose/
├── back/                          # Backend (FastAPI)
│   ├── app/
│   │   ├── main.py               # Punto de entrada
│   │   ├── database.py           # Configuración DB
│   │   ├── models.py             # Modelos SQLAlchemy
│   │   ├── crud.py               # Operaciones CRUD
│   │   ├── ping.py               # Funciones de escaneo
│   │   ├── ssh_operations.py    # Operaciones SSH
│   │   ├── ssh_terminal_manager.py  # WebSocket SSH
│   │   ├── websocket_manager.py  # Gestión WS
│   │   ├── scheduler_service.py  # APScheduler
│   │   ├── schedule_routes.py    # Rutas scheduler
│   │   ├── schedule_schemas.py   # Schemas Pydantic
│   │   ├── encryption.py         # Encriptación
│   │   └── scan_state.py         # Estado de escaneos
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── init.sql                  # Schema DB inicial
│   └── .env
├── front/                         # Frontend (Vue 3)
│   ├── src/
│   │   ├── main.js
│   │   ├── App.vue
│   │   ├── components/           # Componentes Vue
│   │   │   ├── PingScanner.vue
│   │   │   ├── PortScanner.vue
│   │   │   ├── ServiceScanner.vue
│   │   │   ├── OSDetection.vue
│   │   │   ├── MacScanner.vue
│   │   │   ├── VulnerabilityScanner.vue
│   │   │   ├── FullScan.vue
│   │   │   ├── ScanScheduler.vue
│   │   │   ├── SSHTerminal.vue
│   │   │   ├── SSHTerminalInteractive.vue
│   │   │   ├── WhitelistAdmin.vue
│   │   │   └── HostsTable.vue
│   │   ├── composables/          # Lógica reutilizable
│   │   │   ├── useWebSocket.js
│   │   │   ├── useScanProgress.js
│   │   │   ├── useIPValidation.js
│   │   │   ├── useTheme.js
│   │   │   └── useToast.js
│   │   ├── router/
│   │   │   └── index.js
│   │   └── views/
│   │       ├── Dashboard.vue
│   │       ├── AccessDenied.vue
│   │       └── NotFound.vue
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── docker-compose.yml            # Desarrollo
├── docker-compose.prod.yml       # Producción
├── nginx-unified.conf            # Configuración Nginx
├── start.sh / start.ps1          # Scripts de inicio
├── stop.sh / stop.ps1            # Scripts de parada
└── README.md                     # Este archivo
```

---

## 🔐 Seguridad

### Medidas Implementadas

1. **Whitelist de IPs**: Control de acceso basado en IP
2. **Encriptación de Credenciales**: Contraseñas SSH encriptadas en DB
3. **Validación de Inputs**: Sanitización en frontend y backend
4. **Logs de Auditoría**: Registro de accesos denegados
5. **CORS Configurado**: Restricción de orígenes permitidos
6. **Sin Documentación API Pública**: Endpoints /docs y /redoc deshabilitados

### Recomendaciones

- ⚠️ Cambiar credenciales por defecto de PostgreSQL
- ⚠️ Generar nueva `ENCRYPTION_KEY` en producción
- ⚠️ Configurar HTTPS con certificados SSL
- ⚠️ Restringir acceso a PostgreSQL solo desde backend
- ⚠️ Implementar rate limiting en Nginx
- ⚠️ Realizar backups regulares de la base de datos

---

## 📝 Uso

### Iniciar el Sistema
```bash
# Linux/macOS
./start.sh

# Windows
.\start.ps1
```

### Acceder al Dashboard
1. Abrir navegador en `http://192.168.0.9:8080`
2. Verificar que tu IP esté en la whitelist
3. Navegar a los módulos de escaneo

### Realizar un Escaneo
1. Seleccionar tipo de escaneo (Ping, Puertos, Servicios, etc.)
2. Ingresar rango de IP o subnet
3. Hacer clic en "Escanear"
4. Visualizar resultados en tabla
5. Exportar a Excel/PDF si es necesario

### Programar Escaneo Automático
1. Ir a "Programador de Escaneos"
2. Hacer clic en "Nueva Tarea"
3. Configurar:
   - Nombre de tarea
   - Tipo de escaneo
   - Frecuencia (horaria/diaria/semanal/mensual)
   - Hora de ejecución
   - Targets (rango/subnet/hosts)
4. Guardar tarea

### Terminal SSH
1. Ir a "Terminal SSH"
2. Ingresar IP del host
3. Proporcionar credenciales
4. Conectar
5. Ejecutar comandos en tiempo real

---

## 🐛 Troubleshooting

### Problema: "Acceso Denegado"
**Solución**: Verificar que tu IP esté en `IP_WHITELIST` en el archivo `.env`

### Problema: Backend no responde
**Solución**: 
```bash
docker-compose logs backend
docker-compose restart backend
```

### Problema: Escaneos no funcionan
**Solución**: Verificar que Nmap esté instalado:
```bash
docker-compose exec backend nmap --version
```

### Problema: WebSocket no conecta
**Solución**: Verificar configuración de Nginx para WebSocket upgrade

---

## 📄 Licencia

Este proyecto es de uso interno. Todos los derechos reservados.

---

## 👥 Soporte

Para soporte técnico o consultas:
- **Email**: soporte@empresa.com
- **Documentación**: Ver `/front/DOCUMENTACION_FRONTEND.md` y `/front/DOCUMENTACION_BACKEND.md`

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2026  
**Desarrollado con**: ❤️ y ☕
