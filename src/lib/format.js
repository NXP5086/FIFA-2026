export function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    weekday: 'long', month: 'long', day: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

export function fmtDateShort(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

export function fmtTime(iso) {
  const d = new Date(iso);
  const t = d.toLocaleTimeString('en-IN', {
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: 'Asia/Kolkata',
  });
  return `${t} IST`;
}

export function dayKey(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

export function fmtLock(ms) {
  if (ms == null) return '—';
  const d = new Date(ms);
  const date = d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short',
  });
  const time = d.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true,
  });
  return `${date}, ${time} IST`;
}
