export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatCurrency(val) {
  if (val == null || isNaN(val)) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
}

export function generateItemId(items) {
  const nums = items.map(i => {
    const m = (i.itemId || '').match(/DEC-(\d+)/);
    return m ? parseInt(m[1]) : 0;
  });
  const next = Math.max(0, ...nums) + 1;
  return `DEC-${String(next).padStart(3, '0')}`;
}

export function generateEventId(events) {
  const nums = events.map(e => {
    const m = (e.eventId || '').match(/EVT-(\d+)/);
    return m ? parseInt(m[1]) : 0;
  });
  const next = Math.max(0, ...nums) + 1;
  return `EVT-${String(next).padStart(3, '0')}`;
}

export function todayStr() {
  return new Date().toISOString().split('T')[0];
}
