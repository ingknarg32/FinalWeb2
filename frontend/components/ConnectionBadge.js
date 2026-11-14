"use client";

import { useApp } from "@/lib/store";

const COPY = {
  local: ["is-local", "Demo local", "Los datos son simulados y se sincronizan entre pestañas del navegador."],
  connecting: ["is-wait", "Conectando…", "Conectando con el servidor en tiempo real."],
  online: ["is-online", "En vivo", "Conectado por WebSocket: los cambios llegan sin recargar."],
  offline: ["is-off", "Sin conexión", "Reintentando conectar con el servidor…"],
};

export default function ConnectionBadge() {
  const { connection } = useApp();
  const [cls, label, title] = COPY[connection];
  return (
    <span className={`live ${cls}`} title={title}>
      <span className="live__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
