import React, { useState } from 'react';
import { formatDate, formatCurrency } from '../utils/helpers';
import { conditionColors } from '../utils/categories';

export default function EventDetail({ event, items, goBack, openCheckout, openCheckin }) {
  const [viewFilter, setViewFilter] = useState('all');

  if (!event) return null;

  const eventItems = event.items || [];
  const pendingItems = eventItems.filter(i => !i.returned);
  const returnedItems = eventItems.filter(i => i.returned);
  const uniqueItemIds = [...new Set(eventItems.map(i => i.itemId))];

  const totalOut = eventItems.reduce((s, i) => s + (i.returned ? 0 : i.qty), 0);

  const filteredItems = viewFilter === 'pending' ? pendingItems
    : viewFilter === 'returned' ? returnedItems
    : viewFilter === 'unique' ? uniqueItemIds.map(id => eventItems.find(i => i.itemId === id))
    : eventItems;

  // Look up full inventory details for pull list
  const getPullListItems = () => {
    return eventItems.map(ei => {
      const invItem = items.find(i => i.itemId === ei.itemId);
      return {
        ...ei,
        category: invItem?.category || '',
        location: invItem?.location || '',
        bin: invItem?.bin || '',
        unitValue: invItem?.unitValue || 0,
        color: invItem?.color || '',
      };
    });
  };

  const printPullList = () => {
    const pullItems = getPullListItems();
    const totalQty = pullItems.reduce((s, i) => s + (i.qty || 0), 0);
    const totalValue = pullItems.reduce((s, i) => s + ((i.qty || 0) * (i.unitValue || 0)), 0);

    // Group items by storage location for easier pulling
    const byLocation = {};
    pullItems.forEach(pi => {
      const loc = pi.location || 'Unassigned';
      if (!byLocation[loc]) byLocation[loc] = [];
      byLocation[loc].push(pi);
    });

    const locationSections = Object.entries(byLocation).sort(([a], [b]) => a.localeCompare(b)).map(([loc, locItems]) => `
      <div class="loc-group">
        <div class="loc-header">📍 ${loc}</div>
        <table>
          <thead>
            <tr>
              <th style="width:30px;">☐</th>
              <th>Item</th>
              <th>ID</th>
              <th>Bin</th>
              <th style="text-align:center;">Qty</th>
              <th>Color</th>
            </tr>
          </thead>
          <tbody>
            ${locItems.map(pi => `
              <tr>
                <td style="text-align:center;">☐</td>
                <td style="font-weight:600;">${pi.itemName}</td>
                <td style="font-family:monospace;font-size:11px;">${pi.itemId}</td>
                <td>${pi.bin || '—'}</td>
                <td style="text-align:center;font-weight:700;">${pi.qty}</td>
                <td>${pi.color || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('');

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Pull List - ${event.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', Arial, sans-serif; padding: 32px; color: #1B2A4A; }
        .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #D4A84B; }
        .brand { font-size: 11px; color: #888; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
        .title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 700; color: #1B2A4A; margin-bottom: 6px; }
        .subtitle { font-size: 13px; color: #666; }
        .meta { display: flex; justify-content: space-between; margin: 16px 0; padding: 12px 16px; background: #f8f6f1; border-radius: 8px; font-size: 13px; }
        .meta-item { text-align: center; }
        .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 2px; }
        .meta-value { font-weight: 700; font-size: 15px; }
        .notes { font-size: 12px; font-style: italic; color: #666; margin-bottom: 16px; padding: 8px 12px; background: #fffbf0; border-left: 3px solid #D4A84B; border-radius: 0 6px 6px 0; }
        .loc-group { margin-bottom: 20px; }
        .loc-header { font-weight: 700; font-size: 14px; color: #1B2A4A; margin-bottom: 6px; padding: 6px 10px; background: #EBE2CF; border-radius: 6px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        th { padding: 8px 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; border-bottom: 2px solid #ddd; }
        td { padding: 8px 8px; border-bottom: 1px solid #eee; font-size: 12px; }
        tr:hover { background: #fafafa; }
        .footer { margin-top: 24px; padding-top: 16px; border-top: 2px solid #eee; display: flex; justify-content: space-between; font-size: 11px; color: #888; }
        .sign-line { margin-top: 32px; display: flex; gap: 40px; }
        .sign-block { flex: 1; }
        .sign-label { font-size: 10px; text-transform: uppercase; color: #888; margin-bottom: 4px; }
        .sign-field { border-bottom: 1px solid #ccc; height: 24px; }
        @media print {
          body { padding: 16px; }
          .no-print { display: none !important; }
        }
      </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">✨ Starlite Events</div>
          <div class="title">Event Pull List</div>
          <div class="subtitle">${event.name}</div>
        </div>

        <div class="meta">
          <div class="meta-item">
            <div class="meta-label">Event Date</div>
            <div class="meta-value">${formatDate(event.date)}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Venue</div>
            <div class="meta-value">${event.venue || '—'}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Total Items</div>
            <div class="meta-value">${totalQty}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Total Value</div>
            <div class="meta-value">$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Event ID</div>
            <div class="meta-value">${event.eventId}</div>
          </div>
        </div>

        ${event.notes ? `<div class="notes">${event.notes}</div>` : ''}

        ${locationSections}

        <div class="sign-line">
          <div class="sign-block">
            <div class="sign-label">Pulled By</div>
            <div class="sign-field"></div>
          </div>
          <div class="sign-block">
            <div class="sign-label">Date</div>
            <div class="sign-field"></div>
          </div>
          <div class="sign-block">
            <div class="sign-label">Verified By</div>
            <div class="sign-field"></div>
          </div>
        </div>

        <div class="footer">
          <div>Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
          <div>Starlite Events Inventory System</div>
        </div>

        <div class="no-print" style="text-align:center;margin-top:24px;">
          <button onclick="window.print()" style="padding:10px 24px;background:#1B2A4A;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">🖨️ Print Pull List</button>
        </div>

        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={goBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
        Back to Events
      </button>

      {/* Header */}
      <div className="detail-header">
        <div className="detail-icon">{event.status === 'completed' ? '✅' : '📅'}</div>
        <div className="detail-name">{event.name}</div>
        <div className="detail-id">{event.eventId}</div>
        <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>
          {formatDate(event.date)} · {event.venue}
        </div>
        {event.notes && (
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4, fontStyle: 'italic' }}>
            {event.notes}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className={`summary-card ${viewFilter === 'all' ? 'active' : ''}`} onClick={() => setViewFilter('all')}>
          <div className="summary-card-num">{totalOut}</div>
          <div className="summary-card-label">Total Out</div>
        </div>
        <div className={`summary-card ${viewFilter === 'pending' ? 'active' : ''}`} onClick={() => setViewFilter('pending')}>
          <div className="summary-card-num" style={{ color: pendingItems.length > 0 ? 'var(--orange)' : undefined }}>{pendingItems.length}</div>
          <div className="summary-card-label">Pending</div>
        </div>
        <div className={`summary-card ${viewFilter === 'returned' ? 'active' : ''}`} onClick={() => setViewFilter('returned')}>
          <div className="summary-card-num" style={{ color: returnedItems.length > 0 ? 'var(--green)' : undefined }}>{returnedItems.length}</div>
          <div className="summary-card-label">Returned</div>
        </div>
        <div className={`summary-card ${viewFilter === 'unique' ? 'active' : ''}`} onClick={() => setViewFilter('unique')}>
          <div className="summary-card-num">{uniqueItemIds.length}</div>
          <div className="summary-card-label">Unique</div>
        </div>
      </div>

      {/* Print Pull List Button */}
      {eventItems.length > 0 && (
        <button className="btn btn-gold" style={{ width: '100%', marginBottom: 12 }} onClick={printPullList}>
          📋 Print Pull List
        </button>
      )}

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="empty-state" style={{ padding: 20 }}>
          <p>No items in this view</p>
        </div>
      ) : (
        filteredItems.map((ei, idx) => {
          const cc = conditionColors[ei.returnCondition] || {};
          return (
            <div key={idx} className={`event-item-row ${ei.returned ? 'returned' : 'pending'}`}>
              <div className="event-item-info">
                <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{ei.itemName}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>
                  Qty: {ei.qty} · {ei.returned ? `Returned ${formatDate(ei.returnDate)}` : `Out since ${formatDate(ei.date)}`}
                  {ei.checkedOutBy && ` · By ${ei.checkedOutBy}`}
                </div>
                {ei.returned && ei.returnCondition && (
                  <span className="badge" style={{ background: cc.bg, color: cc.text, marginTop: 4 }}>
                    {ei.returnCondition}
                  </span>
                )}
                {ei.returnNotes && (
                  <div style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--gray-500)', marginTop: 2 }}>{ei.returnNotes}</div>
                )}
              </div>
              <span className={`badge ${ei.returned ? 'badge-green' : 'badge-orange'}`}>
                {ei.returned ? 'Returned' : 'Out'}
              </span>
            </div>
          );
        })
      )}

      {/* Action Buttons */}
      {event.status === 'upcoming' && (
        <div className="action-bar" style={{ marginTop: 16 }}>
          <button className="btn btn-primary" onClick={() => openCheckout(null, event.id)}>
            📤 Check Out Items
          </button>
          {pendingItems.length > 0 && (
            <button className="btn btn-green" onClick={() => openCheckin(pendingItems[0]?.itemId)}>
              📥 Return Items
            </button>
          )}
        </div>
      )}
    </div>
  );
}
