"use client";

import { useState } from "react";
import { CATEGORIES, LIMITS } from "@/lib/domain";
import { useApp } from "@/lib/store";

const EMPTY = { title: "", category: "", description: "" };

export default function NewRequestForm() {
  const { createRequest, pushToast } = useApp();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const created = await createRequest(form);
      pushToast({ tone: "success", title: `Solicitud ${created.code} radicada`, text: "Podrás ver su avance en tiempo real." });
      setForm(EMPTY);
      setErrors({});
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      else pushToast({ tone: "error", title: "No se pudo radicar", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card form" onSubmit={onSubmit} noValidate>
      <h2 className="h3">Nueva solicitud</h2>
      <p className="muted small">Cuéntanos qué necesitas; un responsable la atenderá y verás cada avance aquí.</p>

      <div className="field">
        <label htmlFor="title">Asunto</label>
        <input
          id="title"
          value={form.title}
          onChange={set("title")}
          maxLength={LIMITS.title}
          placeholder="Ej. Certificado de notas 2026-2"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "title-err" : undefined}
        />
        {errors.title && <p id="title-err" className="field__error">{errors.title}</p>}
      </div>

      <div className="field">
        <label htmlFor="category">Categoría</label>
        <select
          id="category"
          value={form.category}
          onChange={set("category")}
          aria-invalid={Boolean(errors.category)}
          aria-describedby={errors.category ? "category-err" : undefined}
        >
          <option value="">Selecciona…</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.category && <p id="category-err" className="field__error">{errors.category}</p>}
      </div>

      <div className="field">
        <label htmlFor="description">Descripción</label>
        <textarea
          id="description"
          rows={5}
          value={form.description}
          onChange={set("description")}
          maxLength={LIMITS.description}
          placeholder="Explica tu solicitud con el mayor detalle posible."
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "description-err" : "description-count"}
        />
        <div className="field__row">
          {errors.description ? <p id="description-err" className="field__error">{errors.description}</p> : <span />}
          <span id="description-count" className="small muted">{form.description.length}/{LIMITS.description}</span>
        </div>
      </div>

      <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
        {busy ? "Radicando…" : "Radicar solicitud"}
      </button>
    </form>
  );
}
