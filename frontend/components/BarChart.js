/** Gráfica de barras horizontales en HTML/CSS (sin librerías). items: [{ label, value, tone }] */
export default function BarChart({ title, items }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <section className="card chart" aria-label={title}>
      <h2 className="h3">{title}</h2>
      <ul className="chart__list">
        {items.map((i) => (
          <li key={i.label}>
            <span className="chart__label">{i.label}</span>
            <span className="chart__track" aria-hidden="true">
              <span className={`chart__bar chart__bar--${i.tone ?? "brand"}`} style={{ width: `${(i.value / max) * 100}%` }} />
            </span>
            <span className="chart__value">{i.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
