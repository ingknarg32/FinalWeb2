"use client";

import { useMemo, useState } from "react";
import BarChart from "@/components/BarChart";
import { IconSearch } from "@/components/Icons";
import ManageDrawer from "@/components/ManageDrawer";
import RoleGate from "@/components/RoleGate";
import StatsCards from "@/components/StatsCards";
import StatusBadge from "@/components/StatusBadge";
import StatusTabs, { countByStatus } from "@/components/StatusTabs";
import { CATEGORIES, STATUS_META, STATUS_ORDER, computeStats } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { useApp } from "@/lib/store";

function AdminView() {
  const { requests, flash, resetDemo } = useApp();
  const [filter, setFilter] = useState("ALL");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const stats = useMemo(() => computeStats(requests), [requests]);
  const selected = requests.find((r) => r.id === selectedId) ?? null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests
      .filter((r) => filter === "ALL" || r.status === filter)
      .filter((r) => !category || r.category === category)
      .filter((r) => !q || `${r.code} ${r.title} ${r.studentName}`.toLowerCase().includes(q))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [requests, filter, category, query]);

  return (
    <div className="container page">
      <header className="page__head">
        <div>
          <h1 className="h1 h1--sm">Panel de gestión</h1>
          <p className="muted">Atiende solicitudes y registra observaciones. Los estudiantes ven los cambios al instante.</p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={resetDemo}>Restablecer datos de ejemplo</button>
      </header>

      <StatsCards stats={stats} />

      <div className="grid grid--2 section--tight">
        <BarChart
          title="Solicitudes por estado"
          items={STATUS_ORDER.map((s) => ({ label: STATUS_META[s].label, value: stats.byStatus[s], tone: s.toLowerCase() }))}
        />
        <BarChart
          title="Solicitudes por categoría"
          items={CATEGORIES.map((c) => ({ label: c, value: stats.byCategory[c] ?? 0 }))}
        />
      </div>

      <section aria-label="Bandeja de solicitudes" className="section--tight">
        <div className="toolbar">
          <StatusTabs value={filter} onChange={setFilter} counts={countByStatus(requests)} />
          <div className="toolbar__filters">
            <label className="search">
              <IconSearch />
              <span className="sr-only">Buscar</span>
              <input
                type="search"
                placeholder="Buscar solicitud o estudiante"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label>
              <span className="sr-only">Categoría</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Todas las categorías</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="card empty"><p>No hay solicitudes que coincidan con los filtros.</p></div>
        ) : (
          <ul className="inbox">
            {visible.map((r) => (
              <li key={r.id} className={`card inbox__row ${flash[r.id] ? "is-flash" : ""}`}>
                <div className="inbox__main">
                  <p className="request__code">{r.code} · {r.category}</p>
                  <p className="inbox__title">{r.title}</p>
                  <p className="small muted">{r.studentName} · Actualizada {formatDate(r.updatedAt)}</p>
                </div>
                <StatusBadge status={r.status} />
                <button type="button" className="btn btn--outline" onClick={() => setSelectedId(r.id)}>
                  Gestionar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selected && <ManageDrawer request={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

export default function AdminPage() {
  return (
    <RoleGate role="ADMIN">
      <AdminView />
    </RoleGate>
  );
}
