// ─── Date formatting ──────────────────────────────────────────────────────────
export const formatDateDisplay = (raw) => {
  if (!raw) return '–';
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  } catch { return raw; }
};

// ─── Currency formatting ──────────────────────────────────────────────────────
export const formatINR = (val, decimals = 0) => {
  const n = Number(val);
  if (isNaN(n)) return '–';
  return new Intl.NumberFormat('en-IN', {
    style:                 'currency',
    currency:              'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
};

// ─── String truncation ────────────────────────────────────────────────────────
export const truncateWithMore = (
  text,
  limit = 50,
  moreLabel = "...more",
  onClick
) => {
  if (!text) return "–";
  if (text.length <= limit) return text;

  return (
    <>
      {text.substring(0, limit)}
      <span
        className="text-blue-600 cursor-pointer hover:underline ml-1 font-semibold"
        onClick={() => onClick?.(text)}
      >
        {moreLabel}
      </span>
    </>
  );
};

// ─── Convert ISO date → YYYY-MM-DD for <input type="date"> ───────────────────
export const isoToInputDate = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  } catch { return ''; }
};

// ─── Build ISO datetime string for date range params ─────────────────────────
export const toStartOfDayISO = (dateStr) => {
  if (!dateStr) return '';
  return `${dateStr}T00:00:00.000Z`;
};
export const toEndOfDayISO = (dateStr) => {
  if (!dateStr) return '';
  return `${dateStr}T23:59:59.999Z`;
};