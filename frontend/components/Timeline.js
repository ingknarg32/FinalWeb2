import { formatDateTime } from "@/lib/format";
import StatusBadge from "./StatusBadge";

/** Historial de trazabilidad: cada cambio de estado con la observación del responsable. */
export default function Timeline({ history }) {
  return (
    <ol className="timeline">
      {history.map((h) => (
        <li key={h.id} className={`timeline__item timeline__item--${h.status.toLowerCase()}`}>
          <div className="timeline__head">
            <StatusBadge status={h.status} />
            <time dateTime={h.createdAt}>{formatDateTime(h.createdAt)}</time>
          </div>
          <p className="timeline__msg">{h.message}</p>
          <p className="timeline__author">
            {h.authorName} · {h.authorRole === "ADMIN" ? "Responsable" : "Estudiante"}
          </p>
        </li>
      ))}
    </ol>
  );
}
