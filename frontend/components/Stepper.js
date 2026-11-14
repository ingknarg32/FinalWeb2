import { STATUS_META, STATUS_ORDER, statusIndex } from "@/lib/domain";

/** Barra de progreso de 3 pasos: Nueva → En proceso → Resuelta. */
export default function Stepper({ status }) {
  const current = statusIndex(status);
  return (
    <ol className="stepper" aria-label={`Progreso: ${STATUS_META[status].label}`}>
      {STATUS_ORDER.map((s, i) => (
        <li
          key={s}
          className={i < current ? "is-done" : i === current ? "is-current" : ""}
          aria-current={i === current ? "step" : undefined}
        >
          <span className="stepper__dot" />
          <span className="stepper__label">{STATUS_META[s].label}</span>
        </li>
      ))}
    </ol>
  );
}
