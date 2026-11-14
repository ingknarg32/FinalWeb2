import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { WebSocket } from "ws";
import { createApp } from "./server.js";

let server;
let wss;
let base;
let wsUrl;

before(async () => {
  ({ server, wss } = createApp());
  await new Promise((ok) => server.listen(0, ok));
  const { port } = server.address();
  base = `http://localhost:${port}`;
  wsUrl = `ws://localhost:${port}/ws`;
});

after(() => {
  for (const client of wss.clients) client.terminate();
  wss.close();
  server.closeAllConnections?.();
  server.close();
});

const json = (method, path, body) =>
  fetch(base + path, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

/** Abre un socket y devuelve una función para esperar el siguiente mensaje de un tipo. */
function openSocket() {
  const socket = new WebSocket(wsUrl);
  const queue = [];
  const waiters = [];
  socket.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());
    const i = waiters.findIndex((w) => w.type === msg.type);
    if (i >= 0) waiters.splice(i, 1)[0].resolve(msg);
    else queue.push(msg);
  });
  const next = (type) =>
    new Promise((resolve) => {
      const i = queue.findIndex((m) => m.type === type);
      if (i >= 0) resolve(queue.splice(i, 1)[0]);
      else waiters.push({ type, resolve });
    });
  return new Promise((resolve) => socket.on("open", () => resolve({ socket, next })));
}

test("el cliente recibe un snapshot al conectarse", async () => {
  const { socket, next } = await openSocket();
  const msg = await next("snapshot");
  assert.ok(Array.isArray(msg.data) && msg.data.length > 0);
  socket.close();
});

test("crear solicitud: valida, persiste y notifica por WebSocket", async () => {
  const { socket, next } = await openSocket();
  await next("snapshot");

  const bad = await json("POST", "/api/requests", { student: { id: "u1", name: "X" }, title: "a", category: "?", description: "corto" });
  assert.equal(bad.status, 422);

  const res = await json("POST", "/api/requests", {
    student: { id: "u-est-1", name: "Laura Gómez" },
    title: "Prueba automática",
    category: "Académica",
    description: "Esta es una solicitud creada desde la prueba automática.",
  });
  assert.equal(res.status, 201);
  const created = await res.json();
  assert.equal(created.status, "NUEVA");
  assert.match(created.code, /^SOL-\d{4}$/);

  const event = await next("request:created");
  assert.equal(event.data.id, created.id);
  socket.close();
});

test("cambiar estado: solo ADMIN, sin retroceder, y notifica en tiempo real", async () => {
  const { socket, next } = await openSocket();
  await next("snapshot");
  const list = await (await fetch(base + "/api/requests")).json();
  const target = list.find((r) => r.status === "NUEVA");

  const forbidden = await json("PATCH", `/api/requests/${target.id}/status`, {
    status: "EN_PROCESO", message: "Intento de estudiante", author: { name: "Laura", role: "STUDENT" },
  });
  assert.equal(forbidden.status, 403);

  const ok = await json("PATCH", `/api/requests/${target.id}/status`, {
    status: "EN_PROCESO", message: "Tomamos la solicitud para revisión.", author: { name: "Andrés", role: "ADMIN" },
  });
  assert.equal(ok.status, 200);
  const updated = await ok.json();
  assert.equal(updated.status, "EN_PROCESO");
  assert.equal(updated.history.at(-1).message, "Tomamos la solicitud para revisión.");

  const event = await next("request:updated");
  assert.equal(event.data.status, "EN_PROCESO");

  const back = await json("PATCH", `/api/requests/${target.id}/status`, {
    status: "NUEVA", message: "Intento de retroceso", author: { name: "Andrés", role: "ADMIN" },
  });
  assert.equal(back.status, 422);
  socket.close();
});
