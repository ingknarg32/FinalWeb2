import { STATUS_META } from "@/lib/domain";
import { IconCheck, IconClock, IconInbox } from "./Icons";

const ICONS = { NUEVA: IconInbox, EN_PROCESO: IconClock, RESUELTA: IconCheck };

/** El estado se comunica con color + icono + texto (no solo color). */
export default function StatusBadge({ status }) {
  const Icon = ICONS[status];
  return (
    <span className={`badge badge--${status.toLowerCase()}`}>
      <Icon width={14} height={14} />
      {STATUS_META[status].label}
    </span>
  );
}
