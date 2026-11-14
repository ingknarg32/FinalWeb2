/**
 * Dominio compartido de TrazaUni (reglas de negocio puras, sin dependencias).
 *
 * IMPORTANTE: este archivo se copia tal cual en backend/src/domain.js.
 * Si lo modificas, mantén ambas copias sincronizadas (ver README, sección "Estructura").
 */

export const STATUS_ORDER = ["NUEVA", "EN_PROCESO", "RESUELTA"];

export const STATUS_META = {
  NUEVA: { label: "Nueva", hint: "Recibida, pendiente de revisión" },
  EN_PROCESO: { label: "En proceso", hint: "Un responsable la está atendiendo" },
  RESUELTA: { label: "Resuelta", hint: "Atendida y cerrada" },
};

export const CATEGORIES = [
  "Certificados",
  "Académica",
  "Financiera",
  "Bienestar",
  "Infraestructura",
  "Soporte técnico",
];

export const LIMITS = { title: 80, description: 400, message: 300, minText: 5 };

export function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function statusIndex(status) {
  return STATUS_ORDER.indexOf(status);
}

/** Devuelve un objeto { campo: mensaje } con los errores; vacío si todo es válido. */
export function validateNewRequest({ title, description, category }) {
  const errors = {};
  const t = (title ?? "").trim();
  const d = (description ?? "").trim();
  if (t.length < LIMITS.minText) errors.title = `El asunto debe tener al menos ${LIMITS.minText} caracteres.`;
  else if (t.length > LIMITS.title) errors.title = `El asunto admite máximo ${LIMITS.title} caracteres.`;
  if (!CATEGORIES.includes(category)) errors.category = "Selecciona una categoría.";
  if (d.length < 15) errors.description = "Describe tu solicitud con al menos 15 caracteres.";
  else if (d.length > LIMITS.description) errors.description = `La descripción admite máximo ${LIMITS.description} caracteres.`;
  return errors;
}

export function nextCode(list) {
  const max = list.reduce((m, r) => Math.max(m, parseInt(String(r.code).split("-")[1], 10) || 0), 0);
  return `SOL-${String(max + 1).padStart(4, "0")}`;
}

export function buildRequest(input, student, list, now = new Date().toISOString()) {
  return {
    id: uid("req"),
    code: nextCode(list),
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    status: "NUEVA",
    studentId: student.id,
    studentName: student.name,
    createdAt: now,
    updatedAt: now,
    history: [
      {
        id: uid("obs"),
        status: "NUEVA",
        message: "Solicitud radicada por el estudiante.",
        authorName: student.name,
        authorRole: "STUDENT",
        createdAt: now,
      },
    ],
  };
}

/** Devuelve un mensaje de error o null si el cambio es válido. */
export function validateUpdate(request, { status, message }) {
  if (!STATUS_ORDER.includes(status)) return "Estado no válido.";
  if (request.status === "RESUELTA") return "La solicitud ya fue resuelta y no admite más cambios.";
  if (statusIndex(status) < statusIndex(request.status)) return "No es posible retroceder el estado de una solicitud.";
  if ((message ?? "").trim().length < LIMITS.minText) return `La observación debe tener al menos ${LIMITS.minText} caracteres.`;
  if (message.trim().length > LIMITS.message) return `La observación admite máximo ${LIMITS.message} caracteres.`;
  return null;
}

/** Aplica un cambio de estado + observación. Lanza Error si no es válido. */
export function applyUpdate(request, { status, message }, author, now = new Date().toISOString()) {
  const error = validateUpdate(request, { status, message });
  if (error) throw new Error(error);
  return {
    ...request,
    status,
    updatedAt: now,
    history: [
      ...request.history,
      {
        id: uid("obs"),
        status,
        message: message.trim(),
        authorName: author.name,
        authorRole: author.role,
        createdAt: now,
      },
    ],
  };
}

export function computeStats(list) {
  const byStatus = { NUEVA: 0, EN_PROCESO: 0, RESUELTA: 0 };
  const byCategory = {};
  for (const r of list) {
    byStatus[r.status] += 1;
    byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
  }
  const total = list.length;
  const resolutionRate = total ? Math.round((byStatus.RESUELTA / total) * 100) : 0;
  return { total, byStatus, byCategory, resolutionRate };
}
