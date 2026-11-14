"use client";

/**
 * Estado global de la aplicación (solicitudes, perfil activo, avisos).
 *
 * Dos modos de funcionamiento:
 *  - "local"  (por defecto): datos simulados en localStorage. Los cambios se
 *    reflejan al instante en otras pestañas gracias al evento `storage`.
 *  - "server" (NEXT_PUBLIC_API_URL definido): REST para mutar y WebSocket
 *    para recibir actualizaciones en tiempo real desde el backend Express.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { applyUpdate, buildRequest, STATUS_META, validateNewRequest } from "./domain";
import { SEED_REQUESTS, USERS } from "./seed";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
export const MODE = API_URL ? "server" : "local";

const REQUESTS_KEY = "trazauni:requests:v1";
const ROLE_KEY = "trazauni:role:v1";

const AppContext = createContext(null);

function readLocal() {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocal(list) {
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(list));
  } catch {
    /* almacenamiento no disponible: la demo sigue funcionando en memoria */
  }
}

async function api(path, options) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "content-type": "application/json" },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "No se pudo completar la operación.");
  return body;
}

export function AppProvider({ children }) {
  const [requests, setRequests] = useState(SEED_REQUESTS);
  const [role, setRoleState] = useState("STUDENT");
  const [ready, setReady] = useState(false);
  const [connection, setConnection] = useState(MODE === "local" ? "local" : "connecting");
  const [toasts, setToasts] = useState([]);
  const [flash, setFlash] = useState({}); // ids de solicitudes recién cambiadas

  const requestsRef = useRef(requests);
  const roleRef = useRef(role);

  const user = USERS[role];

  const pushToast = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, tone: "info", ...toast }].slice(-4));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 6000);
  }, []);

  const dismissToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  /** Reemplaza la lista (sin avisos). Úsalo para cambios hechos por el propio usuario. */
  const commit = useCallback((list) => {
    requestsRef.current = list;
    setRequests(list);
    if (MODE === "local") writeLocal(list);
  }, []);

  /** Recibe una lista externa (otra pestaña / servidor), avisa de los cambios relevantes. */
  const receive = useCallback(
    (next) => {
      const prev = new Map(requestsRef.current.map((r) => [r.id, r]));
      const changed = [];
      for (const r of next) {
        const before = prev.get(r.id);
        if (!before) changed.push({ r, created: true });
        else if (before.updatedAt !== r.updatedAt) changed.push({ r, created: false });
      }

      const me = USERS[roleRef.current];
      for (const { r, created } of changed) {
        if (me.role === "STUDENT" && r.studentId === me.id && !created) {
          const last = r.history[r.history.length - 1];
          pushToast({
            tone: r.status === "RESUELTA" ? "success" : "info",
            title: `${r.code}: ${STATUS_META[r.status].label}`,
            text: last.message,
          });
        } else if (me.role === "ADMIN" && created) {
          pushToast({ title: `Nueva solicitud ${r.code}`, text: `${r.studentName}: ${r.title}` });
        }
      }

      if (changed.length) {
        const ids = Object.fromEntries(changed.map(({ r }) => [r.id, true]));
        setFlash((f) => ({ ...f, ...ids }));
        setTimeout(
          () =>
            setFlash((f) => {
              const copy = { ...f };
              for (const id of Object.keys(ids)) delete copy[id];
              return copy;
            }),
          3500,
        );
      }
      commit(next);
    },
    [commit, pushToast],
  );

  // Hidratación inicial: perfil guardado + solicitudes locales.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ROLE_KEY);
      if (saved === "ADMIN" || saved === "STUDENT") {
        roleRef.current = saved;
        setRoleState(saved);
      }
    } catch {
      /* ignorar */
    }
    if (MODE === "local") {
      const stored = readLocal();
      if (stored) commit(stored);
      else writeLocal(SEED_REQUESTS);
    }
    setReady(true);
  }, [commit]);

  // Modo local: escucha cambios hechos en otras pestañas.
  useEffect(() => {
    if (MODE !== "local") return;
    const onStorage = (e) => {
      // El perfil activo NO se sincroniza: cada pestaña puede actuar con un rol distinto.
      if (e.key === REQUESTS_KEY && e.newValue) receive(JSON.parse(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [receive]);

  // Modo servidor: conexión WebSocket con reconexión automática.
  useEffect(() => {
    if (MODE !== "server") return;
    let socket;
    let retry;
    let closed = false;

    const connect = () => {
      setConnection("connecting");
      socket = new WebSocket(API_URL.replace(/^http/, "ws") + "/ws");
      socket.onopen = () => setConnection("online");
      socket.onmessage = (event) => {
        const { type, data } = JSON.parse(event.data);
        if (type === "snapshot") receive(data);
        else if (type === "request:created") receive([data, ...requestsRef.current.filter((r) => r.id !== data.id)]);
        else if (type === "request:updated") receive(requestsRef.current.map((r) => (r.id === data.id ? data : r)));
      };
      socket.onclose = () => {
        if (closed) return;
        setConnection("offline");
        retry = setTimeout(connect, 2500);
      };
      socket.onerror = () => socket.close();
    };

    connect();
    return () => {
      closed = true;
      clearTimeout(retry);
      socket?.close();
    };
  }, [receive]);

  const setRole = useCallback((next) => {
    roleRef.current = next;
    setRoleState(next);
    try {
      localStorage.setItem(ROLE_KEY, next);
    } catch {
      /* ignorar */
    }
  }, []);

  /** Crea una solicitud como el estudiante activo. Lanza { fields } si hay errores de validación. */
  const createRequest = useCallback(
    async (input) => {
      const errors = validateNewRequest(input);
      if (Object.keys(errors).length) throw Object.assign(new Error("Datos no válidos."), { fields: errors });

      const student = USERS.STUDENT;
      if (MODE === "local") {
        const created = buildRequest(input, student, requestsRef.current);
        commit([created, ...requestsRef.current]);
        return created;
      }
      const created = await api("/api/requests", {
        method: "POST",
        body: JSON.stringify({ ...input, student: { id: student.id, name: student.name } }),
      });
      commit([created, ...requestsRef.current.filter((r) => r.id !== created.id)]);
      return created;
    },
    [commit],
  );

  /** Cambia el estado y registra una observación como el responsable activo. */
  const updateRequest = useCallback(
    async (id, { status, message }) => {
      const author = { name: USERS.ADMIN.name, role: "ADMIN" };
      if (MODE === "local") {
        const current = requestsRef.current.find((r) => r.id === id);
        if (!current) throw new Error("Solicitud no encontrada.");
        const updated = applyUpdate(current, { status, message }, author);
        commit(requestsRef.current.map((r) => (r.id === id ? updated : r)));
        return updated;
      }
      const updated = await api(`/api/requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, message, author }),
      });
      commit(requestsRef.current.map((r) => (r.id === id ? updated : r)));
      return updated;
    },
    [commit],
  );

  const resetDemo = useCallback(async () => {
    if (MODE === "local") commit(SEED_REQUESTS);
    else await api("/api/reset", { method: "POST" });
    pushToast({ title: "Datos restablecidos", text: "Se restauraron las solicitudes de ejemplo." });
  }, [commit, pushToast]);

  const value = useMemo(
    () => ({
      requests, role, user, ready, connection, toasts, flash,
      setRole, createRequest, updateRequest, resetDemo, pushToast, dismissToast,
    }),
    [requests, role, user, ready, connection, toasts, flash, setRole, createRequest, updateRequest, resetDemo, pushToast, dismissToast],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>.");
  return ctx;
}
