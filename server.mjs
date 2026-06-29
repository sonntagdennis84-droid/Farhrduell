import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.SOCKET_CORS_ORIGIN || process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

const httpServer = createServer(handle);
const io = new Server(httpServer, {
  cors: {
    origin: dev || allowedOrigins.length === 0 ? true : allowedOrigins,
    credentials: true
  }
});

globalThis.fahrduellIo = io;

io.on("connection", (socket) => {
  socket.on("host:join", ({ sessionId }) => {
    socket.join(`session:${sessionId}`);
    socket.join(`moderator:${sessionId}`);
  });

  socket.on("participant:join", ({ sessionId, participantId }) => {
    socket.join(`session:${sessionId}`);
    socket.join(`participant:${participantId}`);
  });
});

httpServer.listen(port, hostname, () => {
  console.log(`Fahrduell runs on http://localhost:${port}`);
  if (!dev) console.log(`Socket.IO allowed origins: ${allowedOrigins.join(", ") || "none configured"}`);
});
