"use client";

import Link from "next/link";
import { IconBolt, IconHistory, IconShield } from "@/components/Icons";
import StatusBadge from "@/components/StatusBadge";
import { computeStats } from "@/lib/domain";
import { useApp } from "@/lib/store";

const STEPS = [
  ["1", "Radica", "El estudiante registra su solicitud con asunto, categoría y descripción."],
  ["2", "Se gestiona", "Un responsable la toma, cambia su estado y deja observaciones."],
  ["3", "Sigues el avance", "Cada cambio aparece al instante en tu pantalla, sin recargar la página."],
];

const FEATURES = [
  [IconBolt, "Tiempo real", "Los cambios de estado se transmiten por WebSocket y llegan en segundos."],
  [IconHistory, "Historial completo", "Cada solicitud conserva quién la atendió, cuándo y qué observó."],
  [IconShield, "Perfiles claros", "Vistas separadas para estudiantes y responsables, con reglas de gestión."],
];

export default function HomePage() {
  const { requests, setRole } = useApp();
  const stats = computeStats(requests);

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div>
            <p className="eyebrow">Sistema de trazabilidad de solicitudes</p>
            <h1 className="h1">Cada solicitud, con seguimiento en tiempo real.</h1>
            <p className="lead">
              Radica tu solicitud y mira cómo avanza de <strong>Nueva</strong> a <strong>En proceso</strong> y{" "}
              <strong>Resuelta</strong>, con las observaciones de quien la atiende.
            </p>
            <div className="hero__cta">
              <Link href="/estudiante" className="btn btn--primary btn--lg" onClick={() => setRole("STUDENT")}>
                Soy estudiante
              </Link>
              <Link href="/admin" className="btn btn--outline btn--lg" onClick={() => setRole("ADMIN")}>
                Soy responsable
              </Link>
            </div>
          </div>

          <div className="card preview" aria-label="Ejemplo de seguimiento">
            <p className="request__code">SOL-0002 · Financiera</p>
            <h2 className="h3">Error en el cobro de la matrícula</h2>
            <ol className="preview__steps">
              <li><StatusBadge status="NUEVA" /><span>Radicada el 7 nov.</span></li>
              <li><StatusBadge status="EN_PROCESO" /><span>Escalada a Tesorería</span></li>
              <li className="is-pending"><StatusBadge status="RESUELTA" /><span>Pendiente</span></li>
            </ol>
          </div>
        </div>
      </section>

      <section className="container section" aria-label="Indicadores en vivo">
        <div className="kpis">
          <div><strong>{stats.total}</strong><span>Solicitudes</span></div>
          <div><strong>{stats.byStatus.NUEVA}</strong><span>Nuevas</span></div>
          <div><strong>{stats.byStatus.EN_PROCESO}</strong><span>En proceso</span></div>
          <div><strong>{stats.resolutionRate}%</strong><span>Resueltas</span></div>
        </div>
      </section>

      <section className="container section">
        <h2 className="h2">¿Cómo funciona?</h2>
        <ol className="grid grid--3 steps">
          {STEPS.map(([n, title, text]) => (
            <li key={n} className="card">
              <span className="steps__n">{n}</span>
              <h3 className="h3">{title}</h3>
              <p className="muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container section">
        <h2 className="h2">Qué incluye este prototipo</h2>
        <div className="grid grid--3">
          {FEATURES.map(([Icon, title, text]) => (
            <div key={title} className="card">
              <span className="stat__icon stat__icon--brand"><Icon /></span>
              <h3 className="h3">{title}</h3>
              <p className="muted">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
