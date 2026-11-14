"use client";

import { useMemo, useState } from "react";
import NewRequestForm from "@/components/NewRequestForm";
import RoleGate from "@/components/RoleGate";
import StatusTabs, { countByStatus } from "@/components/StatusTabs";
import StudentRequestCard from "@/components/StudentRequestCard";
import { useApp } from "@/lib/store";

function StudentView() {
  const { requests, user, flash } = useApp();
  const [filter, setFilter] = useState("ALL");

  const mine = useMemo(
    () => requests.filter((r) => r.studentId === user.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [requests, user.id],
  );
  const visible = filter === "ALL" ? mine : mine.filter((r) => r.status === filter);

  return (
    <div className="container page">
      <header className="page__head">
        <div>
          <h1 className="h1 h1--sm">Mis solicitudes</h1>
          <p className="muted">Hola, {user.name.split(" ")[0]}. Aquí ves el avance de cada solicitud en tiempo real.</p>
        </div>
      </header>

      <div className="layout-2col">
        <div className="layout-2col__side">
          <NewRequestForm />
        </div>

        <section aria-label="Listado de solicitudes">
          <StatusTabs value={filter} onChange={setFilter} counts={countByStatus(mine)} />
          {visible.length === 0 ? (
            <div className="card empty">
              <p>No tienes solicitudes {filter === "ALL" ? "todavía" : "en este estado"}.</p>
            </div>
          ) : (
            <div className="stack">
              {visible.map((r) => (
                <StudentRequestCard key={r.id} request={r} flashing={Boolean(flash[r.id])} />
              ))}
            </div>
          )}
          <p className="hint small muted">
            Prueba el tiempo real: abre el panel de <strong>Responsable</strong> en otra pestaña, cambia el estado de
            una solicitud y mira cómo se actualiza aquí sin recargar.
          </p>
        </section>
      </div>
    </div>
  );
}

export default function StudentPage() {
  return (
    <RoleGate role="STUDENT">
      <StudentView />
    </RoleGate>
  );
}
