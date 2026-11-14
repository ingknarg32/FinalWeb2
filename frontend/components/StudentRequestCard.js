"use client";

import { useState } from "react";
import { formatDate } from "@/lib/format";
import { IconChevron, IconHistory } from "./Icons";
import Stepper from "./Stepper";
import StatusBadge from "./StatusBadge";
import Timeline from "./Timeline";

export default function StudentRequestCard({ request, flashing }) {
  const [open, setOpen] = useState(false);
  const panelId = `trace-${request.id}`;
  const last = request.history[request.history.length - 1];

  return (
    <article className={`card request ${flashing ? "is-flash" : ""}`}>
      <header className="request__head">
        <div>
          <p className="request__code">{request.code} · {request.category}</p>
          <h3 className="h3">{request.title}</h3>
        </div>
        <StatusBadge status={request.status} />
      </header>

      <Stepper status={request.status} />

      <p className="request__last">
        <strong>Última observación:</strong> {last.message}
      </p>
      <p className="small muted">Radicada el {formatDate(request.createdAt)}</p>

      <button
        type="button"
        className="btn btn--ghost"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <IconHistory /> {open ? "Ocultar seguimiento" : `Ver seguimiento (${request.history.length})`}
        <IconChevron className={open ? "flip" : ""} />
      </button>

      {open && (
        <div id={panelId} className="request__trace">
          <p className="small muted">{request.description}</p>
          <Timeline history={request.history} />
        </div>
      )}
    </article>
  );
}
