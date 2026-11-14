// Zona horaria fija para que servidor y navegador rendericen exactamente el mismo texto.
const dateTime = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Bogota",
});
const dateOnly = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeZone: "America/Bogota" });

export const formatDateTime = (iso) => dateTime.format(new Date(iso));
export const formatDate = (iso) => dateOnly.format(new Date(iso));
