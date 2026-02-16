import React, { useState } from 'react';
import { formatDate } from '../utils/helpers';
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
