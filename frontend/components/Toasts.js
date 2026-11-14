"use client";

import { useApp } from "@/lib/store";
import { IconClose } from "./Icons";

/** Avisos en vivo. La región aria-live permite que lectores de pantalla los anuncien. */
export default function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.tone}`}>
          <div>
            <strong>{t.title}</strong>
            {t.text && <p>{t.text}</p>}
          </div>
          <button type="button" className="icon-btn" aria-label="Cerrar aviso" onClick={() => dismissToast(t.id)}>
            <IconClose width={16} height={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
