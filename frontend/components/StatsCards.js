import { IconBolt, IconCheck, IconClock, IconInbox } from "./Icons";

export default function StatsCards({ stats }) {
  const items = [
    ["Nuevas", stats.byStatus.NUEVA, IconInbox, "nueva", "Esperan revisión"],
    ["En proceso", stats.byStatus.EN_PROCESO, IconClock, "en_proceso", "En atención"],
    ["Resueltas", stats.byStatus.RESUELTA, IconCheck, "resuelta", "Cerradas"],
    ["Tasa de resolución", `${stats.resolutionRate}%`, IconBolt, "brand", `${stats.total} solicitudes en total`],
  ];
  return (
    <div className="stats">
      {items.map(([label, value, Icon, tone, note]) => (
        <div key={label} className="card stat">
          <span className={`stat__icon stat__icon--${tone}`}><Icon /></span>
          <div>
            <p className="stat__label">{label}</p>
            <p className="stat__value">{value}</p>
            <p className="small muted">{note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
