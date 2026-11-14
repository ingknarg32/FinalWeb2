/**
 * Datos simulados de TrazaUni (primera fase del prototipo, sin base de datos).
 *
 * IMPORTANTE: este archivo se copia tal cual en backend/src/seed.js.
 * Las fechas son fijas (no relativas) para que el render del servidor y del
 * navegador coincidan y no haya errores de hidratación.
 */

export const USERS = {
  STUDENT: { id: "u-est-1", name: "Laura Gómez", role: "STUDENT", email: "laura.gomez@universidad.edu.co" },
  ADMIN: { id: "u-adm-1", name: "Andrés Martínez", role: "ADMIN", email: "andres.martinez@universidad.edu.co" },
};

const OTHER_STUDENTS = [
  { id: "u-est-2", name: "Camilo Rojas" },
  { id: "u-est-3", name: "Valentina Parra" },
];

const student = (i) => (i === 1 ? USERS.STUDENT : OTHER_STUDENTS[i - 2]);

function make(n, studentIdx, title, category, description, steps) {
  const owner = student(studentIdx);
  const history = steps.map(([status, message, createdAt, authorName], k) => ({
    id: `obs-${n}-${k}`,
    status,
    message,
    authorName: authorName ?? owner.name,
    authorRole: authorName ? "ADMIN" : "STUDENT",
    createdAt,
  }));
  const last = history[history.length - 1];
  return {
    id: `req-seed-${n}`,
    code: `SOL-${String(n).padStart(4, "0")}`,
    title,
    description,
    category,
    status: last.status,
    studentId: owner.id,
    studentName: owner.name,
    createdAt: history[0].createdAt,
    updatedAt: last.createdAt,
    history,
  };
}

const RADICADA = "Solicitud radicada por el estudiante.";

export const SEED_REQUESTS = [
  make(8, 2, "Estado de mi solicitud de beca de alimentación", "Bienestar",
    "Radiqué los documentos de la beca hace dos semanas y no he recibido respuesta sobre el resultado.",
    [["NUEVA", RADICADA, "2026-11-09T14:05:00Z"],
     ["EN_PROCESO", "Documentos recibidos. Pasan a comité de Bienestar Universitario.", "2026-11-11T16:20:00Z", "Andrés Martínez"]]),
  make(7, 3, "Revisión de nota del parcial de Física II", "Académica",
    "Considero que la pregunta 3 del segundo parcial fue calificada incorrectamente. Adjunto mi procedimiento.",
    [["NUEVA", RADICADA, "2026-11-12T09:40:00Z"]]),
  make(6, 3, "Constancia de estudio para la EPS", "Certificados",
    "Necesito una constancia de estudio vigente para afiliación a la EPS como beneficiaria.",
    [["NUEVA", RADICADA, "2026-11-03T11:00:00Z"],
     ["EN_PROCESO", "Constancia en elaboración por Registro Académico.", "2026-11-03T15:30:00Z", "Andrés Martínez"],
     ["RESUELTA", "Constancia enviada al correo institucional de la estudiante.", "2026-11-04T10:10:00Z", "Andrés Martínez"]]),
  make(5, 2, "No puedo ingresar a la plataforma virtual", "Soporte técnico",
    "Desde el lunes la plataforma me muestra 'credenciales inválidas' aunque la contraseña es correcta.",
    [["NUEVA", RADICADA, "2026-11-12T18:15:00Z"]]),
  make(4, 2, "Aire acondicionado dañado en el laboratorio 3", "Infraestructura",
    "El aire acondicionado del laboratorio 3 lleva una semana sin funcionar y las prácticas son inviables por el calor.",
    [["NUEVA", RADICADA, "2026-11-05T08:30:00Z"],
     ["EN_PROCESO", "Reporte enviado a Mantenimiento. Visita técnica programada para esta semana.", "2026-11-06T13:00:00Z", "Andrés Martínez"]]),
  make(3, 1, "Solicitud de cupo en tutoría de Cálculo II", "Académica",
    "Quisiera un cupo en las tutorías de refuerzo de Cálculo II de los jueves en la tarde.",
    [["NUEVA", RADICADA, "2026-11-12T20:05:00Z"]]),
  make(2, 1, "Error en el cobro de la matrícula 2026-2", "Financiera",
    "Me cobraron el valor sin aplicar el descuento por promedio académico que me fue aprobado.",
    [["NUEVA", RADICADA, "2026-11-07T10:20:00Z"],
     ["EN_PROCESO", "Caso escalado a Tesorería para verificar la aplicación del descuento.", "2026-11-10T09:00:00Z", "Andrés Martínez"]]),
  make(1, 1, "Certificado de notas del semestre 2026-1", "Certificados",
    "Requiero el certificado oficial de notas del primer semestre de 2026 para una convocatoria de intercambio.",
    [["NUEVA", RADICADA, "2026-11-02T09:00:00Z"],
     ["EN_PROCESO", "Certificado en proceso de firma digital.", "2026-11-02T14:45:00Z", "Andrés Martínez"],
     ["RESUELTA", "Certificado enviado al correo institucional. Verifica que lo hayas recibido.", "2026-11-03T08:30:00Z", "Andrés Martínez"]]),
];
