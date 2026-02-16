import React from 'react';
import { categoryIcons, conditionColors } from '../utils/categories';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function Dashboard({ items, events, activityLog, navigate, openReport }) {
  const totalItems = items.length;
  const totalPieces = items.reduce((s, i) => s + (i.qtyOwned || 0), 0);
  const totalOut = items.reduce((s, i) => s + (i.qtyOut || 0), 0);
  const totalValue = items.reduce((s, i) => s + ((i.qtyOwned || 0) * (i.unitValue || 0)), 0);

  const flagged = items.filter(i => i.flag);
  const needsAttention = items.filter(i => ['Fair', 'Poor', 'Needs Repair'].includes(i.condition));
  const upcomingEvents = events.filter(e => e.status === 'upcoming').sort((a, b) => a.date?.localeCompare(b.date));
  const recentLog = activityLog.slice(0, 5);

  const logDotColor = (type) => {
    if (type === 'checkout') return 'var(--red)';
    if (type === 'checkin') return 'var(--green)';
    return 'var(--orange)';
  };

  return (
    <div className="page">
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('inventory')}>
          <div className="stat-number">{totalItems}</div>
          <div className="stat-label">Total Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalPieces}</div>
          <div className="stat-label">Total Pieces</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: totalOut > 0 ? 'var(--orange)' : undefined }}>{totalOut}</div>
          <div className="stat-label">Checked Out</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{formatCurrency(totalValue)}</div>
          <div className="stat-label">Total Value</div>
        </div>
      </div>

      {/* Quick Report Buttons */}
      {openReport && (
        <div className="quick-actions">
          <button className="quick-action-btn" onClick={() => openReport('full')}>
            <span className="icon">📋</span>Full Report
          </button>
          <button className="quick-action-btn" onClick={() => openReport('flags')}>
            <span className="icon">🚩</span>Flags Report
          </button>
          <button className="quick-action-btn" onClick={() => openReport('value')}>
            <span className="icon">💰</span>Value Report
          </button>
          <button className="quick-action-btn" onClick={() => openReport('checkedout')}>
            <span className="icon">📤</span>Checked Out
          </button>
          <button className="quick-action-btn" onClick={() => openReport('events')}>
            <span className="icon">📅</span>Events Report
          </button>
          <button className="quick-action-btn" onClick={() => openReport('upcoming')}>
            <span className="icon">🔜</span>Upcoming
          </button>
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="card">
          <div className="card-header">📅 Upcoming Events</div>
          {upcomingEvents.slice(0, 3).map(e => (
            <div key={e.id} className="item-row" onClick={() => navigate('eventDetail', { event: e })}>
              <div className="item-icon" style={{ background: '#dbeafe' }}>📅</div>
              <div className="item-info">
                <div className="item-name">{e.name}</div>
                <div className="item-meta">{formatDate(e.date)} · {e.venue} · 📦 {e.items?.length || 0} items</div>
              </div>
              <span className="badge badge-blue">Upcoming</span>
            </div>
          ))}
        </div>
      )}

      {/* Flagged Items */}
      {flagged.length > 0 && (
        <div className="card">
          <div className="card-header">🚩 Flagged Items ({flagged.length})</div>
          {flagged.sort((a, b) => {
            const p = { high: 0, medium: 1, low: 2 };
            return (p[a.flag?.priority] || 2) - (p[b.flag?.priority] || 2);
          }).map(item => (
            <div key={item.id} className={`flag-bar ${item.flag?.type === 'replace' ? 'replace' : 'repair'}`} style={{ cursor: 'pointer', marginBottom: 8 }} onClick={() => navigate('itemDetail', { item })}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy)' }}>
                  {item.name} — {item.flag?.type === 'repair' ? 'Repair' : 'Replace'} · {(item.flag?.priority || 'medium').charAt(0).toUpperCase() + (item.flag?.priority || 'medium').slice(1)}
                </div>
                <div style={{ fontWeight: 400, fontSize: 12, marginTop: 2, color: 'var(--gray-700)' }}>{item.flag?.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Activity */}
      {recentLog.length > 0 && (
        <div className="card">
          <div className="card-header">📋 Recent Activity</div>
          {recentLog.map(log => (
            <div key={log.id} className="log-entry">
              <div className="log-dot" style={{ background: logDotColor(log.type) }} />
              <div>
                <div className="log-text">{log.text}</div>
                <div className="log-date">{formatDate(log.date)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Needs Attention */}
      {needsAttention.length > 0 && (
        <div className="card">
          <div className="card-header">⚠️ Needs Attention</div>
          {needsAttention.map(item => (
            <div key={item.id} className="item-row" onClick={() => navigate('itemDetail', { item })}>
              <div className="item-icon">{categoryIcons[item.category] || '📦'}</div>
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-meta">{item.category} · {item.condition}</div>
              </div>
              <span className="badge badge-orange">{item.condition}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
