# 📚 Documentación del Backend - Network Scanner API

## 🏗️ Arquitectura General

El backend está construido con **FastAPI** y proporciona una API RESTful completa para escaneo de redes, gestión de hosts, SSH operations y programación de tareas.

### Stack Tecnológico
- **Framework**: FastAPI 
- **Base de Datos**: PostgreSQL con SQLAlchemy ORM
- **Escaneo de Red**: python-nmap, asyncio
- **WebSockets**: Comunicación en tiempo real
- **SSH**: paramiko para operaciones remotas
- **Scheduler**: APScheduler para tareas programadas

---

## 📁 Estructura de Archivos

```
app/
├── main.py                    # Punto de entrada, rutas principales y WebSocket
├── database.py                # Configuración SQLAlchemy y conexión a BD
├── models.py                  # Modelos SQLAlchemy (tablas de BD)
├── crud.py                    # Operaciones CRUD para hosts
├── ping.py                    # Funciones de escaneo de red (ping, puertos, servicios, OS)
├── scan_state.py             # Estado global de escaneos activos
├── websocket_manager.py      # Gestión de conexiones WebSocket
├── ssh_operations.py         # Operaciones SSH (apagado, reinicio, comandos)
├── ssh_terminal_manager.py   # Terminal SSH interactiva
├── scheduler_service.py      # Servicio de tareas programadas
├── schedule_routes.py        # Endpoints para gestión de schedules
└── schedule_schemas.py       # Schemas Pydantic para schedules
```

---

## 🗄️ Base de Datos

### Configuración (`database.py`)

```python
DATABASE_URL = "postgresql://scanner:scanner123@192.168.0.6:5432/network_scanner"
```

### Modelos Principales

#### **Host** (tabla `hosts`)
Almacena información de dispositivos en la red.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer | Primary key |
| `ip` | String(45) | Dirección IP (única, indexada) |
| `hostname` | String(255) | Nombre del host |
| `mac` | String(17) | Dirección MAC |
| `vendor` | String(255) | Fabricante de la tarjeta de red |
| `os_name` | String(255) | Sistema operativo detectado |
| `os_accuracy` | Integer | Precisión de detección de OS (%) |
| `status` | String(20) | Estado: "up", "down", "unknown" |
| `latency_ms` | Float | Latencia en milisegundos |
| `last_seen` | DateTime | Última vez visto online |
| `created_at` | DateTime | Fecha de creación |
| `updated_at` | DateTime | Última actualización |

**Relaciones:**
- `ports` → Lista de puertos abiertos
- `services` → Servicios detectados
- `vulnerabilities` → Vulnerabilidades encontradas
- `connection_history` → Historial de conexiones SSH

#### **Port** (tabla `ports`)
Puertos abiertos de cada host.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer | Primary key |
| `host_id` | Integer | Foreign key → hosts |
| `port` | Integer | Número de puerto |
| `protocol` | String(10) | tcp/udp |
| `service` | String(100) | Servicio detectado |
| `state` | String(20) | Estado del puerto |

#### **Service** (tabla `services`)
Servicios y versiones detectadas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer | Primary key |
| `host_id` | Integer | Foreign key → hosts |
| `port` | Integer | Puerto del servicio |
| `protocol` | String(10) | tcp/udp |
| `service` | String(100) | Nombre del servicio |
| `version` | String(255) | Versión detectada |
| `product` | String(255) | Producto específico |
| `extra_info` | Text | Información adicional |

#### **Vulnerability** (tabla `vulnerabilities`)
Vulnerabilidades detectadas (CVEs).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer | Primary key |
| `host_id` | Integer | Foreign key → hosts |
| `cve_id` | String(50) | ID del CVE |
| `description` | Text | Descripción de la vulnerabilidad |
| `severity` | String(20) | Criticidad (low, medium, high, critical) |
| `cvss_score` | Float | Puntuación CVSS |

#### **ScanSchedule** (tabla `scan_schedules`)
Tareas de escaneo programadas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer | Primary key |
| `name` | String | Nombre de la tarea |
| `action_type` | String | 'scan' o 'shutdown' |
| `scan_type` | String | ping, ports, services, os, mac, full |
| `frequency` | String | hourly, daily, weekly, monthly |
| `time` | String | Hora en formato "HH:MM" |
| `day_of_week` | Integer | 0-6 (lunes-domingo) |
| `day_of_month` | Integer | 1-31 |
| `enabled` | Boolean | Si está activo |
| `target_range` | String | Rango de IPs |
| `target_subnet` | String | Subred CIDR |
| `auto_shutdown` | Boolean | Apagado automático |
| `ssh_username` | String | Usuario SSH |
| `ssh_password` | String | Contraseña SSH |

---

## 🔌 API Endpoints

### 📡 **Escaneo de Red**

#### **POST** `/ping`
Ping a múltiples hosts.

**Request:**
```json
{
  "hosts": ["192.168.0.1", "192.168.0.2", "google.com"]
}
```

**Response:**
```json
{
  "results": [
    {
      "host": "192.168.0.1",
      "hostname": "router.local",
      "status": "up",
      "latency_ms": 2.45,
      "method": "icmp"
    }
  ]
}
```

#### **POST** `/scan-network`
Escanea una red completa (CIDR).

**Request:**
```json
{
  "cidr": "192.168.0.0/24"
}
```

#### **POST** `/scan-ports`
Escanea puertos de un host.

**Request:**
```json
{
  "host": "192.168.0.1",
  "ports": "1-1024"
}
```

**Response:**
```json
{
  "host": "192.168.0.1",
  "ports": [
    {"port": 22, "protocol": "tcp", "service": "ssh", "state": "open"},
    {"port": 80, "protocol": "tcp", "service": "http", "state": "open"}
  ]
}
```

#### **POST** `/scan-services`
Detecta servicios y versiones.

**Request:**
```json
{
  "host": "192.168.0.1"
}
```

#### **POST** `/scan-os`
Detección de sistema operativo.

**Request:**
```json
{
  "host": "192.168.0.1"
}
```

**Response:**
```json
{
  "os": [
    {"name": "Linux 5.x", "accuracy": 98}
  ]
}
```

#### **POST** `/scan-mac`
Escanea direcciones MAC.

**Request:**
```json
{
  "hosts": ["192.168.0.1", "192.168.0.2"]
}
```

#### **POST** `/full-scan`
Escaneo completo (hostname, MAC, puertos, servicios, OS).

**Request:**
```json
{
  "host": "192.168.0.1",
  "save_to_db": true
}
```

**Response:**
```json
{
  "host": "192.168.0.1",
  "hostname": "server.local",
  "mac": "aa:bb:cc:dd:ee:ff",
  "vendor": "Dell Inc.",
  "status": "up",
  "latency_ms": 3.2,
  "ports": [...],
  "services": [...],
  "os": {...}
}
```

### 💾 **Gestión de Hosts (Base de Datos)**

#### **GET** `/hosts`
Obtiene todos los hosts guardados.

**Response:**
```json
[
  {
    "id": 1,
    "ip": "192.168.0.1",
    "hostname": "router.local",
    "mac": "aa:bb:cc:dd:ee:ff",
    "vendor": "TP-Link",
    "os_name": "Linux",
    "status": "up",
    "latency_ms": 2.1,
    "last_seen": "2026-01-05T10:30:00",
    "ports": [...],
    "services": [...]
  }
]
```

#### **GET** `/hosts/{ip}`
Obtiene un host específico por IP.

#### **DELETE** `/hosts/{ip}`
Elimina un host de la base de datos.

#### **GET** `/hosts/filter/range`
Filtra hosts por rango de IPs.

**Query params:**
- `start_ip`: IP inicial
- `end_ip`: IP final

#### **GET** `/hosts/filter/subnet`
Filtra hosts por subred.

**Query params:**
- `subnet`: CIDR (ej: "192.168.0.0/24")

#### **GET** `/hosts/search`
Busca hosts por IP, hostname o MAC.

**Query params:**
- `q`: Término de búsqueda

#### **GET** `/statistics`
Obtiene estadísticas de la red.

**Response:**
```json
{
  "total": 150,
  "online": 87,
  "offline": 63,
  "unknown": 0
}
```

#### **GET** `/export/csv`
Exporta hosts a CSV.

### 🔐 **SSH Operations**

#### **POST** `/ssh/shutdown`
Apaga un host remotamente.

**Request:**
```json
{
  "ip": "192.168.0.100",
  "username": "admin",
  "password": "password123",
  "sudo_password": "sudo_pass",
  "os_type": "linux"
}
```

#### **POST** `/ssh/shutdown-range`
Apaga múltiples hosts.

**Request:**
```json
{
  "start_ip": "192.168.0.10",
  "end_ip": "192.168.0.20",
  "username": "admin",
  "password": "password123",
  "sudo_password": "sudo_pass"
}
```

#### **POST** `/ssh/reboot`
Reinicia un host.

#### **POST** `/ssh/execute`
Ejecuta un comando SSH.

**Request:**
```json
{
  "ip": "192.168.0.100",
  "username": "admin",
  "password": "password123",
  "command": "uptime",
  "use_sudo": false
}
```

#### **POST** `/ssh/test`
Prueba conexión SSH.

#### **WebSocket** `/ws/ssh/{ip}`
Terminal SSH interactiva.

### 📅 **Scheduled Tasks**

#### **POST** `/schedules`
Crea una tarea programada.

**Request:**
```json
{
  "name": "Escaneo Nocturno",
  "action_type": "scan",
  "scan_type": "full",
  "frequency": "daily",
  "time": "02:00",
  "target_subnet": "192.168.0.0/24",
  "enabled": true
}
```

#### **GET** `/schedules`
Lista todas las tareas programadas.

#### **GET** `/schedules/{id}`
Obtiene una tarea específica.

#### **PUT** `/schedules/{id}`
Actualiza una tarea.

#### **DELETE** `/schedules/{id}`
Elimina una tarea.

#### **POST** `/schedules/{id}/toggle`
Activa/desactiva una tarea.

#### **POST** `/schedules/{id}/run`
Ejecuta una tarea manualmente.

---

## 🔄 WebSocket

### Conexión: `ws://localhost:8000/ws`

El WebSocket permite comunicación bidireccional en tiempo real.

### Eventos Enviados por el Servidor

#### **scan_progress**
Progreso de escaneos en tiempo real.

```json
{
  "type": "scan_progress",
  "scan_id": "scan_123456789",
  "scan_type": "full",
  "progress": 45,
  "total": 100,
  "current": 45,
  "status": "running",
  "message": "Escaneando 192.168.0.45",
  "result": {
    "host": "192.168.0.45",
    "status": "up",
    "hostname": "server45.local"
  }
}
```

#### **host_update**
Notificación cuando se crea/actualiza un host.

```json
{
  "type": "host_update",
  "action": "created",
  "host": {
    "id": 123,
    "ip": "192.168.0.50",
    "hostname": "newhost.local",
    "status": "up"
  }
}
```

### Mensajes del Cliente

#### Ping/Pong
```json
"ping"  // Servidor responde "pong"
```

#### Cancelar Escaneo
```json
{
  "type": "cancel_scan",
  "scan_id": "scan_123456789"
}
```

---

## 🔍 Funciones de Escaneo (`ping.py`)

### `ping_multiple(hosts: list) -> list`
Realiza ping ICMP a múltiples hosts de forma concurrente.

**Características:**
- Detecta automáticamente Windows/Linux
- Timeout: 2 segundos por host
- Retorna latencia en milisegundos
- Resuelve hostnames automáticamente

### `scan_ports(host: str, ports: str) -> dict`
Escanea puertos usando nmap.

**Parámetros:**
- `host`: IP o hostname
- `ports`: Rango de puertos (ej: "1-1024", "80,443,8080")

**Argumentos nmap:** `-sS -T4` (SYN scan, timing aggressive)

### `scan_services(host: str) -> dict`
Detecta servicios y versiones.

**Argumentos nmap:** `-sV --version-intensity 5`

### `detect_os(host: str) -> dict`
Detección de sistema operativo.

**Argumentos nmap:** `-O --osscan-guess`

**Nota:** Requiere permisos de administrador/root.

### `scan_mac(hosts: list) -> list`
Escanea direcciones MAC y vendors.

**Argumentos nmap:** `-sn -PR` (ARP ping)

### `full_host_scan(host: str, save_to_db: bool) -> dict`
Escaneo completo del host.

**Incluye:**
1. Ping (latencia y estado)
2. Hostname resolution
3. Escaneo MAC (si está en la misma red)
4. Escaneo de puertos (1-1024)
5. Detección de servicios
6. Detección de OS

**Optimización:**
- Usa semáforo global (límite: 30 operaciones nmap simultáneas)
- Ejecución async para no bloquear
- Guarda automáticamente en BD si `save_to_db=True`

---

## 🔧 Operaciones SSH (`ssh_operations.py`)

### Características
- Conexión mediante paramiko
- Soporte para sudo
- Timeout: 10 segundos
- Detección automática de OS (Linux/Windows)

### `shutdown_host_ssh(ip, username, password, sudo_password, os_type)`
Apaga un host remotamente.

**Comandos ejecutados:**
- **Linux:** `sudo shutdown -h now`
- **Windows:** `shutdown /s /t 0`

### `execute_command_ssh(ip, username, password, command, use_sudo, sudo_password)`
Ejecuta comando arbitrario.

**Ejemplo:**
```python
result = execute_command_ssh(
    ip="192.168.0.100",
    username="admin",
    password="pass",
    command="df -h",
    use_sudo=False
)
```

### `test_ssh_connection(ip, username, password)`
Prueba credenciales SSH.

**Returns:**
```json
{
  "success": true,
  "message": "Conexión SSH exitosa",
  "hostname": "server.local",
  "os_info": "Linux 5.15.0-generic"
}
```

---

## ⏰ Scheduler (`scheduler_service.py`)

### Servicio de Tareas Programadas

Basado en **APScheduler** con backend PostgreSQL.

#### Inicialización
```python
scheduler_service.start()  # Se inicia automáticamente en lifespan
```

#### Tipos de Frecuencia

| Frecuencia | Descripción | Campos Requeridos |
|------------|-------------|-------------------|
| `hourly` | Cada hora | `time` (minutos) |
| `daily` | Diario | `time` (HH:MM) |
| `weekly` | Semanal | `time`, `day_of_week` (0-6) |
| `monthly` | Mensual | `time`, `day_of_month` (1-31) |

#### Acciones Soportadas

1. **Escaneos Automáticos**
   - `scan_type`: ping, ports, services, os, mac, full
   - `target_subnet`: Red CIDR a escanear
   - `target_range`: Rango de IPs
   - `target_hosts`: Lista de hosts

2. **Apagado Automático**
   - `action_type`: shutdown
   - `shutdown_targets`: IPs a apagar
   - Credenciales SSH requeridas

#### Ejemplo de Uso
```python
# Crear escaneo diario a las 3 AM
schedule = ScanSchedule(
    name="Escaneo Nocturno",
    action_type="scan",
    scan_type="full",
    frequency="daily",
    time="03:00",
    target_subnet="192.168.0.0/24",
    enabled=True
)
```

---

## 🔐 CRUD Operations (`crud.py`)

### `create_or_update_host(db, scan_data)`
Crea o actualiza un host con todos sus datos.

**Características:**
- Detecta si el host existe (por IP)
- Actualiza datos si ya existe
- Crea relaciones con puertos, servicios, vulnerabilidades
- Emite evento WebSocket de actualización
- Maneja transacciones de forma segura

**Ejemplo:**
```python
scan_data = {
    "host": "192.168.0.100",
    "hostname": "server.local",
    "mac": "aa:bb:cc:dd:ee:ff",
    "vendor": "Dell",
    "status": "up",
    "latency_ms": 2.5,
    "os": {"name": "Linux 5.x", "accuracy": 95},
    "ports": [
        {"port": 22, "protocol": "tcp", "service": "ssh"},
        {"port": 80, "protocol": "tcp", "service": "http"}
    ],
    "services": [
        {"port": 22, "service": "OpenSSH", "version": "8.2"}
    ]
}
create_or_update_host(db, scan_data)
```

### `get_all_hosts(db) -> list`
Retorna todos los hosts con sus relaciones.

### `filter_by_ip_range(db, start_ip, end_ip) -> list`
Filtra hosts por rango de IPs.

### `search_hosts(db, query) -> list`
Búsqueda por IP, hostname o MAC (case-insensitive).

---

## 📊 Optimizaciones y Buenas Prácticas

### Control de Concurrencia
```python
# Semáforo global para limitar nmap simultáneos
GLOBAL_NMAP_SEMAPHORE = asyncio.Semaphore(30)

async with GLOBAL_NMAP_SEMAPHORE:
    # Operación nmap
    pass
```

### Timeout y Robustez
- Todos los comandos SSH tienen timeout de 10s
- Ping timeout: 2s por host
- Manejo de excepciones en todas las operaciones de red

### WebSocket Broadcasting
```python
# Enviar progreso a todos los clientes conectados
await ws_manager.broadcast("scan_progress", {
    "scan_id": scan_id,
    "progress": 50,
    "total": 100
})
```

### Procesamiento por Lotes
Para escaneos masivos (>100 hosts), se procesan en lotes:
```python
batch_size = 100
for i in range(0, len(hosts), batch_size):
    batch = hosts[i:i + batch_size]
    await process_batch(batch)
```

---

## 🚀 Ejecutar el Backend

### Instalación de Dependencias
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-nmap paramiko apscheduler
```

### Variables de Entorno
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### Iniciar Servidor
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Endpoints de Documentación
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 📝 Notas de Seguridad

⚠️ **Importante:**

1. **Contraseñas SSH**: Actualmente se almacenan en texto plano. En producción, usar:
   - Encriptación (AES-256)
   - HashiCorp Vault
   - Variables de entorno seguras

2. **Permisos nmap**: 
   - Detección de OS requiere root/admin
   - SYN scan requiere privilegios

3. **CORS**: 
   - Actualmente permite todos los orígenes (`*`)
   - En producción, especificar dominios permitidos

4. **Rate Limiting**: 
   - Implementar límites de peticiones
   - Proteger contra escaneos masivos abusivos

5. **Autenticación**: 
   - Añadir JWT o OAuth2
   - Proteger endpoints sensibles

---

## 🐛 Debug y Logs

### Activar Logs Detallados
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Monitorear WebSocket
Los eventos WebSocket se pueden inspeccionar en el navegador:
```javascript
ws = new WebSocket('ws://localhost:8000/ws')
ws.onmessage = (event) => console.log(JSON.parse(event.data))
```

---

## 📈 Próximas Mejoras

- [ ] Autenticación y autorización (JWT)
- [ ] Encriptación de credenciales SSH
- [ ] Soporte para escaneo UDP
- [ ] Detección de vulnerabilidades con CVE
- [ ] Export a múltiples formatos (JSON, XML, PDF)
- [ ] Dashboard de métricas (Prometheus/Grafana)
- [ ] Rate limiting
- [ ] Cache de resultados (Redis)
- [ ] Escaneo distribuido (múltiples workers)

---

## 📞 Contacto y Soporte

Para reportar bugs o solicitar features, crear un issue en el repositorio.

**Autor**: Manuel  
**Fecha**: Enero 2026  
**Versión**: 1.0.0
