"use client";

import { useApp } from "@/lib/store";

const NAMES = { STUDENT: "estudiantes", ADMIN: "responsables" };

/** Muestra la vista solo para el perfil indicado; si no, ofrece cambiar de perfil. */
export default function RoleGate({ role, children }) {
  const { role: current, setRole, ready } = useApp();
  if (!ready) return <div className="container page"><p className="muted">Cargando…</p></div>;
  if (current === role) return children;
  return (
    <div className="container page">
      <div className="card empty">
        <h1 className="h2">Esta vista es para {NAMES[role]}</h1>
        <p className="muted">Estás usando el perfil {current === "ADMIN" ? "de responsable" : "de estudiante"}.</p>
        <button type="button" className="btn btn--primary" onClick={() => setRole(role)}>
          Cambiar a perfil {role === "ADMIN" ? "Responsable" : "Estudiante"}
        </button>
      </div>
    </div>
  );
}
