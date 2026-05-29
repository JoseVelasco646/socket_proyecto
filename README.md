**Proyecto**

Este repositorio contiene un servidor de chat en tiempo real basado en Node.js, Express, MongoDB y Socket.IO. Provee APIs REST para usuarios, chats y mensajes, y emite eventos en tiempo real para notificar nuevos mensajes en chats privados y grupos.

**Requisitos**

- **Node.js** v16+ instalado
- **MongoDB** (Atlas o instancia accesible)
- Ejecutar `npm install` para instalar dependencias

**Instalación**

1. Clona el repositorio.
2. Instala dependencias:

```
npm install
```

3. Revisa y ajusta configuración en [constants.js](constants.js) (usuario/contraseña/host de MongoDB, puerto):

- **DB_USER**, **DB_PASSWORD**, **DB_HOST**, **IP_SERVER**, **PORT**

**Ejecución**

- En desarrollo:

```
npm run dev
```

- En producción:

```
npm start
```

El servidor arranca y expone la API en `http://<IP_SERVER>:<PORT>/api`.

**Archivos clave**

- **app.js**: configuración de Express y rutas ([app.js](app.js))
- **index.js**: arranque del servidor y configuración de Socket.IO ([index.js](index.js))
- **utils/socketServer.js**: inicializa Socket.IO ([utils/socketServer.js](utils/socketServer.js))
- **routes/**: rutas REST (ver [routes/index.js](routes/index.js))
- **controllers/**: lógica de negocio y emisiones de eventos (p. ej. [controllers/chat_message.js](controllers/chat_message.js), [controllers/group_message.js](controllers/group_message.js))

**API REST (resumen)**

- **Autenticación**
	- `POST /api/auth/register` — Registrar usuario
	- `POST /api/auth/login` — Login
	- `POST /api/auth/refresh_access_token` — Refrescar token
- **Usuarios**
	- `GET /api/user/me` — Obtener perfil del usuario autenticado
	- `PATCH /api/user/me` — Actualizar perfil (avatar upload)
	- `GET /api/user` — Listar usuarios
- **Chats**
	- `POST /api/chat` — Crear chat privado
	- `GET /api/chat` — Listar chats del usuario
	- `GET /api/chat/:id` — Obtener chat
	- `DELETE /api/chat/:id` — Eliminar chat
- **Mensajes de chat**
	- `POST /api/chat/message` — Enviar texto (requiere `chat_id`, `message`)
	- `POST /api/chat/message/image` — Enviar imagen (multipart)
	- `GET /api/chat/message/:chat_id` — Obtener mensajes
	- `GET /api/chat/message/total/:chat_id` — Total mensajes
	- `GET /api/chat/message/last/:chat_id` — Último mensaje
- **Grupos**
	- `POST /api/group` — Crear grupo
	- `GET /api/group` — Listar grupos
	- `PATCH /api/group/:id` — Actualizar grupo
	- `PATCH /api/group/exit/:id` — Salir de grupo
	- `PATCH /api/group/add_participants/:id` — Agregar participantes
	- `PATCH /api/group/ban` — Banear participante
- **Mensajes de grupo**
	- `POST /api/group/message` — Enviar texto a grupo
	- `POST /api/group/message/image` — Enviar imagen a grupo
	- `GET /api/group/message/:group_id` — Obtener mensajes de grupo
	- `GET /api/group/message/total/:group_id` — Total mensajes
	- `GET /api/group/message/last/:group_id` — Último mensaje

Todas las rutas protegidas requieren autenticación mediante el middleware (ver [routes/](routes)).

**Eventos de Socket.IO**

El servidor inicializa Socket.IO en [utils/socketServer.js](utils/socketServer.js) y escucha conexiones en [index.js](index.js). Eventos disponibles:

- `connection` — Cliente conectado (evento de servidor)
- `disconnect` — Cliente desconectado (evento de servidor)
- `subscribe` — Un cliente se une a una sala (payload: `room` — p. ej. `chat_id` o `group_id`)
- `unsubscribe` — Un cliente sale de una sala (payload: `room`)
- `message` — Emitido por el servidor en una sala cuando se crea un mensaje (payload: objeto `ChatMessage` o `GroupMessage` con `user`, `message`, `type`, `createdAt`)
- `message_notify` — Emitido por el servidor en una sala de notificaciones (`${room}_notify`) para notificaciones de nuevos mensajes

Ejemplo simple de cliente usando Socket.IO (browser / Node):

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3977");

socket.on("connect", () => {
	// Suscribirse al chat
	const chatId = "<CHAT_ID>";
	socket.emit("subscribe", chatId);

	// Escuchar mensajes en la sala
	socket.on("message", (data) => {
		console.log("Nuevo mensaje:", data);
	});

	// Escuchar notificaciones
	socket.on("message_notify", (data) => {
		console.log("Notificación:", data);
	});
});
```

Para dejar la sala: `socket.emit("unsubscribe", chatId);`.

**Notas sobre archivos de subida**

- Imágenes de mensajes se guardan bajo la carpeta `uploads/images` (configurada en [routes/chat_message.js](routes/chat_message.js) y [routes/group_message.js](routes/group_message.js)).

**Contribuir**

- Fork y PR. Mantén los cambios pequeños y documentados.

**Licencia**

- MIT
