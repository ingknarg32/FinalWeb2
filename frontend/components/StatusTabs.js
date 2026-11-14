import { STATUS_META, STATUS_ORDER } from "@/lib/domain";

/** Filtro por estado con contadores. value: "ALL" | "NUEVA" | "EN_PROCESO" | "RESUELTA". */
export default function StatusTabs({ value, onChange, counts }) {
  const tabs = [["ALL", "Todas"], ...STATUS_ORDER.map((s) => [s, STATUS_META[s].label])];
  return (
    <div className="tabs" role="group" aria-label="Filtrar por estado">
      {tabs.map(([key, label]) => (
        <button
          key={key}
          type="button"
          className={`tab ${value === key ? "is-active" : ""}`}
          aria-pressed={value === key}
          onClick={() => onChange(key)}
        >
          {label} <span className="tab__count">{counts[key] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

export function countByStatus(list) {
  const counts = { ALL: list.length, NUEVA: 0, EN_PROCESO: 0, RESUELTA: 0 };
  for (const r of list) counts[r.status] += 1;
  return counts;
}
