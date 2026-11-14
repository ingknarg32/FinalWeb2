import { createServer } from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { WebSocket, WebSocketServer } from "ws";
import { applyUpdate, buildRequest, validateNewRequest, validateUpdate } from "./domain.js";
import { SEED_REQUESTS } from "./seed.js";

const PORT = Number(process.env.PORT ?? 4000);
const ORIGINS = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true;

/**
 * Fase 1 (prototipo): el estado vive en memoria. En la fase 2 estas funciones
 * se reemplazan por consultas con Prisma (ver prisma/schema.prisma).
 */
let requests = structuredClone(SEED_REQUESTS);

export function createApp() {
  const app = express();
  app.use(cors({ origin: ORIGINS }));
  app.use(express.json({ limit: "20kb" }));

  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: "/ws" });

  function broadcast(type, data) {
    const payload = JSON.stringify({ type, data });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) client.send(payload);
    }
  }

  wss.on("connection", (socket) => {
    socket.isAlive = true;
    socket.on("pong", () => (socket.isAlive = true));
    socket.send(JSON.stringify({ type: "snapshot", data: requests }));
  });

  // Detecta conexiones muertas cada 30 s.
  const heartbeat = setInterval(() => {
    for (const socket of wss.clients) {
      if (!socket.isAlive) {
        socket.terminate();
        continue;
      }
      socket.isAlive = false;
      socket.ping();
    }
  }, 30_000);
  heartbeat.unref();
  wss.on("close", () => clearInterval(heartbeat));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, requests: requests.length, clients: wss.clients.size });
  });

  app.get("/api/requests", (req, res) => {
    const { studentId } = req.query;
    res.json(studentId ? requests.filter((r) => r.studentId === studentId) : requests);
  });

  app.post("/api/requests", (req, res) => {
    const { title, description, category, student } = req.body ?? {};
    if (!student?.id || !student?.name) return res.status(400).json({ error: "Falta el estudiante." });
    const errors = validateNewRequest({ title, description, category });
    if (Object.keys(errors).length) return res.status(422).json({ error: "Datos no válidos.", fields: errors });

    const created = buildRequest({ title, description, category }, student, requests);
    requests = [created, ...requests];
    broadcast("request:created", created);
    res.status(201).json(created);
  });

  app.patch("/api/requests/:id/status", (req, res) => {
    const { status, message, author } = req.body ?? {};
    // Control de acceso SIMULADO: la autenticación real llega en una fase posterior.
    if (author?.role !== "ADMIN") return res.status(403).json({ error: "Solo un responsable puede cambiar el estado." });

    const current = requests.find((r) => r.id === req.params.id);
    if (!current) return res.status(404).json({ error: "Solicitud no encontrada." });
    const error = validateUpdate(current, { status, message });
    if (error) return res.status(422).json({ error });

    const updated = applyUpdate(current, { status, message }, author);
    requests = requests.map((r) => (r.id === updated.id ? updated : r));
    broadcast("request:updated", updated);
    res.json(updated);
  });

  // Solo para demostraciones: restaura los datos simulados.
  app.post("/api/reset", (_req, res) => {
    requests = structuredClone(SEED_REQUESTS);
    broadcast("snapshot", requests);
    res.json({ ok: true });
  });

  return { app, server, wss };
}

// Arranca el servidor solo si se ejecuta directamente (no al importarlo en pruebas).
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const { server } = createApp();
  server.listen(PORT, () => {
    console.log(`TrazaUni API  → http://localhost:${PORT}/api/health`);
    console.log(`TrazaUni WS   → ws://localhost:${PORT}/ws`);
  });
}
