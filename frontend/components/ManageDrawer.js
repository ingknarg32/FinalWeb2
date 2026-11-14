"use client";

import { useEffect, useRef, useState } from "react";
import { LIMITS, STATUS_META, STATUS_ORDER, statusIndex } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { useApp } from "@/lib/store";
import { IconClose } from "./Icons";
import Stepper from "./Stepper";
import StatusBadge from "./StatusBadge";
import Timeline from "./Timeline";

/** Panel lateral para que el responsable cambie el estado y registre una observación. */
export default function ManageDrawer({ request, onClose }) {
  const { updateRequest, pushToast } = useApp();
  const closeRef = useRef(null);
  const [status, setStatus] = useState(request.status);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const closed = request.status === "RESUELTA";
  const options = STATUS_ORDER.filter((s) => statusIndex(s) >= statusIndex(request.status));

  // Al cambiar la solicitud (o llegar un cambio en vivo) se reinicia el formulario.
  useEffect(() => {
    const next = STATUS_ORDER[Math.min(statusIndex(request.status) + 1, STATUS_ORDER.length - 1)];
    setStatus(request.status === "RESUELTA" ? "RESUELTA" : next);
    setMessage("");
    setError("");
  }, [request.id, request.status]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await updateRequest(request.id, { status, message });
      pushToast({
        tone: "success",
        title: `${request.code} actualizada`,
        text: `Estado: ${STATUS_META[status].label}. El estudiante ya puede verlo.`,
      });
      setMessage("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="overlay" onClick={onClose} aria-hidden="true" />
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <header className="drawer__head">
          <div>
            <p className="request__code">{request.code} · {request.category}</p>
            <h2 id="drawer-title" className="h3">{request.title}</h2>
          </div>
          <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar panel">
            <IconClose />
          </button>
        </header>

        <div className="drawer__body">
          <div className="drawer__meta">
            <StatusBadge status={request.status} />
            <span className="small muted">{request.studentName} · {formatDate(request.createdAt)}</span>
          </div>
          <Stepper status={request.status} />
          <p>{request.description}</p>

          <form onSubmit={onSubmit} className="manage" noValidate>
            <h3 className="h4">Gestionar solicitud</h3>
            {closed ? (
              <p className="notice">Esta solicitud ya fue resuelta y no admite más cambios.</p>
            ) : (
              <>
                <div className="field">
                  <label htmlFor="new-status">Nuevo estado</label>
                  <select id="new-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                    {options.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_META[s].label}{s === request.status ? " (mantener)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="message">Observación para el estudiante</label>
                  <textarea
                    id="message"
                    rows={3}
                    maxLength={LIMITS.message}
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); setError(""); }}
                    placeholder="Ej. Documentos verificados, pasa a Tesorería."
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "manage-err" : undefined}
                  />
                  {error && <p id="manage-err" className="field__error">{error}</p>}
                </div>
                <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
                  {busy ? "Guardando…" : "Guardar y notificar"}
                </button>
              </>
            )}
          </form>

          <h3 className="h4">Historial de trazabilidad</h3>
          <Timeline history={request.history} />
        </div>
      </aside>
    </>
  );
}
