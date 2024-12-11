import { server } from "./app.js";
import mongoose from "mongoose";
import { IP_SERVER, PORT, DB_USER, DB_PASSWORD, DB_HOST } from "./constants.js";
import { io } from "./utils/socketServer.js";

const mongoDbUrl = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/`;

const startServer = async () => {
  try {
    // Conecta a MongoDB usando async/await
    await mongoose.connect(mongoDbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Conexión a MongoDB establecida");

    // Inicia el servidor
    server.listen(PORT, () => {
      console.log(`http://${IP_SERVER}:${PORT}/api`);

      io.sockets.on("connection", (socket) => {
        console.log("Usuario conectado");

        socket.on("disconnect", () => {
          console.log("Usuario desconectado");
        });
        socket.on("subscribe", (room) => {
          socket.join(room);
        });
        socket.on("unsubscribe", (room) => {
          socket.leave(room);
        });
      });
    });
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error);
  }
};

startServer();
