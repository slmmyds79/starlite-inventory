import React, { useState, useMemo } from 'react';
import { categoryIcons, categories, conditionColors, conditionEmojis } from '../utils/categories';
import { formatDate, formatCurrency } from '../utils/helpers';

const REPORT_TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'categories', label: 'Categories', icon: '📁' },
  { id: 'conditions', label: 'Conditions', icon: '🔍' },
  { id: 'events', label: 'Events', icon: '📅' },
  { id: 'flagged', label: 'Flagged', icon: '⚠️' },
  { id: 'activity', label: 'Activity', icon: '📋' },
];

export default function Reports({ items, events, activityLog, openReport }) {
  const [tab, setTab] = useState('overview');

  // ─── Computed Data ───
  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalQty = items.reduce((s, i) => s + (i.qtyOwned || 0), 0);
    const totalOut = items.reduce((s, i) => s + (i.qtyOut || 0), 0);
    const totalValue = items.reduce((s, i) => s + (i.qtyOwned || 0) * (i.unitValue || 0), 0);
    const checkedOutValue = items.reduce((s, i) => s + (i.qtyOut || 0) * (i.unitValue || 0), 0);
    const flaggedCount = items.filter(i => i.flag).length;
    const attentionCount = items.filter(i => ['Fair', 'Poor', 'Needs Repair', 'Damaged'].includes(i.condition)).length;
    const upcomingEvents = events.filter(e => e.status === 'upcoming').length;
    const completedEvents = events.filter(e => e.status === 'completed').length;
    return { totalItems, totalQty, totalOut, totalValue, checkedOutValue, flaggedCount, attentionCount, upcomingEvents, completedEvents };
  }, [items, events]);

  const categoryData = useMemo(() => {
    const map = {};
    items.forEach(item => {
      const cat = item.category || 'Uncategorized';
      if (!map[cat]) map[cat] = { count: 0, qty: 0, value: 0, out: 0 };
      map[cat].count++;
      map[cat].qty += (item.qtyOwned || 0);
      map[cat].value += (item.qtyOwned || 0) * (item.unitValue || 0);
      map[cat].out += (item.qtyOut || 0);
    });
    return Object.entries(map).sort((a, b) => b[1].value - a[1].value);
  }, [items]);

  const conditionData = useMemo(() => {
    const map = {};
    items.forEach(item => {
      const cond = item.condition || 'Unknown';
      if (!map[cond]) map[cond] = { count: 0, qty: 0, value: 0 };
      map[cond].count++;
      map[cond].qty += (item.qtyOwned || 0);
      map[cond].value += (item.qtyOwned || 0) * (item.unitValue || 0);
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [items]);

  const flaggedItems = useMemo(() => items.filter(i => i.flag), [items]);

  const locationData = useMemo(() => {
    const map = {};
    items.forEach(item => {
      const loc = item.location || 'Unknown';
      if (!map[loc]) map[loc] = { count: 0, qty: 0 };
      map[loc].count++;
      map[loc].qty += (item.qtyOwned || 0);
    });
    return Object.entries(map).sort((a, b) => b[1].qty - a[1].qty);
  }, [items]);

  // ─── Export Functions ───
  const exportInventoryCSV = () => {
    const headers = ['Item ID', 'Name', 'Category', 'Subcategory', 'Color', 'Qty Owned', 'Qty Out', 'Available', 'Condition', 'Unit Value', 'Total Value', 'Location', 'Bin', 'Vendor', 'Purchase Date', 'Last Used', 'Flag Status', 'Notes'];
    const rows = items.map(i => [
      i.itemId, i.name, i.category, i.subcategory || '', i.color || '',
      i.qtyOwned || 0, i.qtyOut || 0, (i.qtyOwned || 0) - (i.qtyOut || 0),
      i.condition, i.unitValue || 0, ((i.qtyOwned || 0) * (i.unitValue || 0)).toFixed(2),
      i.location, i.bin || '', i.vendor || '', i.purchaseDate || '', i.lastUsed || '',
      i.flag ? i.flag.type + ': ' + i.flag.description : 'None', i.notes || ''
    ]);
    downloadCSV('starlite_inventory_export.csv', headers, rows);
  };

  const exportEventsCSV = () => {
    const headers = ['Event ID', 'Name', 'Date', 'Venue', 'Status', 'Total Items', 'Items Returned', 'Notes'];
    const rows = events.map(e => [
      e.eventId, e.name, e.date, e.venue || '', e.status,
      e.items?.length || 0,
      e.items?.filter(i => i.returned).length || 0,
      e.notes || ''
    ]);
    downloadCSV('starlite_events_export.csv', headers, rows);
  };

  const exportActivityCSV = () => {
    const headers = ['Date', 'Type', 'Description'];
    const rows = activityLog.map(l => [l.date, l.type, l.text]);
    downloadCSV('starlite_activity_log.csv', headers, rows);
  };

  const downloadCSV = (filename, headers, rows) => {
    const escape = (val) => {
      const str = String(val ?? '');
      return str.includes(',') || str.includes('"') || str.includes('\n') ? '"' + str.replace(/"/g, '""') + '"' : str;
    };
    const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Bar Chart Helper ───
  const BarChart = ({ data, maxVal, colorFn }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map(([label, val], idx) => (
        <div key={idx}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
            <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{label}</span>
            <span style={{ color: 'var(--gray-500)' }}>{typeof val === 'number' && val >= 1 ? formatCurrency(val) : val}</span>
          </div>
          <div style={{ background: 'var(--gray-100)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
            <div style={{
              width: maxVal > 0 ? Math.max(2, (typeof val === 'number' ? val : 0) / maxVal * 100) + '%' : '0%',
              height: '100%',
              borderRadius: 6,
              background: colorFn ? colorFn(label, idx) : 'var(--navy)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      ))}
    </div>
  );

  // ─── Render Sections ───
  const renderOverview = () => (
    <>
      {/* Print Report Buttons */}
      {openReport && (
        <div className="card">
          <div className="card-header">📊 Print Reports</div>
          <div className="quick-actions" style={{ marginBottom: 0 }}>
            <button className="quick-action-btn" onClick={() => openReport('full')}><span className="icon">📋</span>Full Report</button>
            <button className="quick-action-btn" onClick={() => openReport('flags')}><span className="icon">🚩</span>Flags</button>
            <button className="quick-action-btn" onClick={() => openReport('value')}><span className="icon">💰</span>Value</button>
            <button className="quick-action-btn" onClick={() => openReport('checkedout')}><span className="icon">📤</span>Checked Out</button>
            <button className="quick-action-btn" onClick={() => openReport('events')}><span className="icon">📅</span>Events</button>
            <button className="quick-action-btn" onClick={() => openReport('upcoming')}><span className="icon">🔜</span>Upcoming</button>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="card">
        <div className="card-header">📊 Inventory Summary</div>
        <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          <div className="stat-card" style={{ cursor: 'default' }}>
            <div className="stat-number">{stats.totalItems}</div>
            <div className="stat-label">Unique Items</div>
          </div>
          <div className="stat-card" style={{ cursor: 'default' }}>
            <div className="stat-number">{stats.totalQty}</div>
            <div className="stat-label">Total Qty</div>
          </div>
          <div className="stat-card" style={{ cursor: 'default' }}>
            <div className="stat-number">{stats.totalOut}</div>
            <div className="stat-label">Checked Out</div>
          </div>
        </div>
      </div>

      {/* Value Summary */}
      <div className="card">
        <div className="card-header">💰 Value Summary</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
            <span style={{ fontSize: 14, color: 'var(--gray-500)' }}>Total Inventory Value</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', fontFamily: "'Cormorant Garamond', serif" }}>{formatCurrency(stats.totalValue)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
            <span style={{ fontSize: 14, color: 'var(--gray-500)' }}>Value Currently Out</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--orange)' }}>{formatCurrency(stats.checkedOutValue)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
            <span style={{ fontSize: 14, color: 'var(--gray-500)' }}>Value In Storage</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>{formatCurrency(stats.totalValue - stats.checkedOutValue)}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card">
        <div className="card-header">📅 Events & Maintenance</div>
        <div className="stats-grid">
          <div className="stat-card" style={{ cursor: 'default', background: 'var(--blue-bg)', border: '1px solid var(--blue-border)' }}>
            <div className="stat-number" style={{ color: '#1e40af' }}>{stats.upcomingEvents}</div>
            <div className="stat-label">Upcoming Events</div>
          </div>
          <div className="stat-card" style={{ cursor: 'default', background: 'var(--green-bg)', border: '1px solid var(--green-border)' }}>
            <div className="stat-number" style={{ color: '#166534' }}>{stats.completedEvents}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card" style={{ cursor: 'default', background: 'var(--orange-bg)', border: '1px solid var(--orange-border)' }}>
            <div className="stat-number" style={{ color: '#92400e' }}>{stats.flaggedCount}</div>
            <div className="stat-label">Flagged Items</div>
          </div>
          <div className="stat-card" style={{ cursor: 'default', background: 'var(--red-bg)', border: '1px solid var(--red-border)' }}>
            <div className="stat-number" style={{ color: '#991b1b' }}>{stats.attentionCount}</div>
            <div className="stat-label">Need Attention</div>
          </div>
        </div>
      </div>

      {/* Location Breakdown */}
      <div className="card">
        <div className="card-header">📍 Items by Location</div>
        <BarChart
          data={locationData.map(([loc, d]) => [loc, d.qty])}
          maxVal={Math.max(...locationData.map(([, d]) => d.qty), 1)}
          colorFn={(_, i) => ['var(--navy)', 'var(--gold)', 'var(--blue)', 'var(--green)', 'var(--orange)', 'var(--red)'][i % 6]}
        />
      </div>

      {/* Export Buttons */}
      <div className="card">
        <div className="card-header">📥 Export Data</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={exportInventoryCSV} style={{ width: '100%' }}>📦 Export Full Inventory (CSV)</button>
          <button className="btn btn-outline btn-sm" onClick={exportEventsCSV} style={{ width: '100%' }}>📅 Export Events (CSV)</button>
          <button className="btn btn-outline btn-sm" onClick={exportActivityCSV} style={{ width: '100%' }}>📋 Export Activity Log (CSV)</button>
        </div>
      </div>
    </>
  );

  const renderCategories = () => {
    const maxVal = Math.max(...categoryData.map(([, d]) => d.value), 1);
    return (
      <>
        <div className="card">
          <div className="card-header">📁 Inventory by Category</div>
          <BarChart
            data={categoryData.map(([cat, d]) => [(categoryIcons[cat] || '📦') + ' ' + cat, d.value])}
            maxVal={maxVal}
            colorFn={(_, i) => {
              const colors = ['#1B2A4A', '#D4A84B', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6'];
              return colors[i % colors.length];
            }}
          />
        </div>
        <div className="card">
          <div className="card-header">📋 Category Details</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 6px', color: 'var(--gray-500)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '8px 6px', color: 'var(--gray-500)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>Items</th>
                  <th style={{ padding: '8px 6px', color: 'var(--gray-500)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>Qty</th>
                  <th style={{ padding: '8px 6px', color: 'var(--gray-500)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>Out</th>
                  <th style={{ padding: '8px 6px', color: 'var(--gray-500)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map(([cat, d]) => (
                  <tr key={cat} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '10px 6px', fontWeight: 600, color: 'var(--navy)' }}>{categoryIcons[cat] || '📦'} {cat}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right' }}>{d.count}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right' }}>{d.qty}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', color: d.out > 0 ? 'var(--orange)' : 'inherit' }}>{d.out}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(d.value)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--navy)' }}>
                  <td style={{ padding: '10px 6px', fontWeight: 700, color: 'var(--navy)' }}>Total</td>
                  <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 700 }}>{stats.totalItems}</td>
                  <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 700 }}>{stats.totalQty}</td>
                  <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 700, color: 'var(--orange)' }}>{stats.totalOut}</td>
                  <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(stats.totalValue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  const renderConditions = () => (
    <>
      <div className="card">
        <div className="card-header">🔍 Condition Breakdown</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {conditionData.map(([cond, d]) => {
            const colors = conditionColors[cond] || { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
            return (
              <div key={cond} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: colors.bg, borderRadius: 10, border: '1px solid ' + colors.border }}>
                <span style={{ fontSize: 24 }}>{conditionEmojis[cond] || '❓'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: colors.text, fontSize: 14 }}>{cond}</div>
                  <div style={{ fontSize: 12, color: colors.text, opacity: 0.8 }}>{d.count} items · {d.qty} total qty · {formatCurrency(d.value)}</div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: colors.text, fontFamily: "'Cormorant Garamond', serif" }}>{d.count}</div>
              </div>
            );
          })}
        </div>
      </div>
      {items.filter(i => ['Fair', 'Poor', 'Needs Repair', 'Damaged'].includes(i.condition)).length > 0 && (
        <div className="card">
          <div className="card-header">🚨 Items Needing Attention</div>
          {items.filter(i => ['Fair', 'Poor', 'Needs Repair', 'Damaged'].includes(i.condition)).map(item => (
            <div key={item.id} className="item-row" style={{ cursor: 'default' }}>
              <div className="item-icon">{categoryIcons[item.category] || '📦'}</div>
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-meta">{item.category} · {item.location} {item.bin}</div>
              </div>
              <span className="badge badge-red">{item.condition}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderEvents = () => {
    const upcoming = events.filter(e => e.status === 'upcoming').sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const completed = events.filter(e => e.status === 'completed').sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return (
      <>
        <div className="card">
          <div className="card-header">📅 Event Summary</div>
          <div className="stats-grid">
            <div className="stat-card" style={{ cursor: 'default' }}><div className="stat-number">{events.length}</div><div className="stat-label">Total Events</div></div>
            <div className="stat-card" style={{ cursor: 'default' }}><div className="stat-number">{upcoming.length}</div><div className="stat-label">Upcoming</div></div>
          </div>
        </div>
        {upcoming.length > 0 && (
          <div className="card">
            <div className="card-header">🔜 Upcoming Events</div>
            {upcoming.map(evt => {
              const totalItems = evt.items?.reduce((s, i) => s + (i.qty || 0), 0) || 0;
              const returnedItems = evt.items?.filter(i => i.returned).reduce((s, i) => s + (i.returnQty || 0), 0) || 0;
              return (
                <div key={evt.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 14 }}>{evt.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{formatDate(evt.date)} · {evt.venue}</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    <span className="badge badge-blue">{totalItems} items out</span>
                    {returnedItems > 0 && <span className="badge badge-green" style={{ marginLeft: 4 }}>{returnedItems} returned</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {completed.length > 0 && (
          <div className="card">
            <div className="card-header">✅ Completed Events</div>
            {completed.map(evt => {
              const totalItems = evt.items?.reduce((s, i) => s + (i.qty || 0), 0) || 0;
              return (
                <div key={evt.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: 14 }}>{evt.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{formatDate(evt.date)} · {evt.venue} · {totalItems} items</div>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  const renderFlagged = () => (
    <>
      <div className="card">
        <div className="card-header">⚠️ Flagged Items ({flaggedItems.length})</div>
        {flaggedItems.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 0' }}><p>No flagged items — everything looks good!</p></div>
        ) : (
          <>
            <div className="stats-grid" style={{ marginBottom: 12 }}>
              <div className="stat-card" style={{ cursor: 'default', background: 'var(--orange-bg)', border: '1px solid var(--orange-border)' }}>
                <div className="stat-number" style={{ color: '#92400e' }}>{flaggedItems.filter(i => i.flag?.type === 'repair').length}</div>
                <div className="stat-label">Repairs</div>
              </div>
              <div className="stat-card" style={{ cursor: 'default', background: 'var(--red-bg)', border: '1px solid var(--red-border)' }}>
                <div className="stat-number" style={{ color: '#991b1b' }}>{flaggedItems.filter(i => i.flag?.type === 'replace').length}</div>
                <div className="stat-label">Replacements</div>
              </div>
            </div>
            {(() => {
              const totalCost = flaggedItems.reduce((s, i) => s + (i.flag?.cost || 0), 0);
              return totalCost > 0 ? (
                <div style={{ padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 10, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>Estimated Maintenance Cost</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>{formatCurrency(totalCost)}</span>
                </div>
              ) : null;
            })()}
            {flaggedItems.map(item => (
              <div key={item.id} className={'flag-bar ' + (item.flag?.type || 'repair')} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 24 }}>{item.flag?.type === 'replace' ? '🔄' : '🔧'}</div>
                <div className="flag-bar-content">
                  <div className="flag-bar-type">{item.name}</div>
                  <div className="flag-bar-desc">
                    {item.flag?.type === 'repair' ? 'Repair' : 'Replace'} · Priority: {item.flag?.priority || 'medium'}
                    {item.flag?.cost ? ' · Est: ' + formatCurrency(item.flag.cost) : ''}
                  </div>
                  <div className="flag-bar-desc">{item.flag?.description}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );

  const renderActivity = () => (
    <>
      <div className="card">
        <div className="card-header">📋 Full Activity Log ({activityLog.length} entries)</div>
        <div style={{ marginBottom: 12 }}>
          <button className="btn btn-outline btn-sm" onClick={exportActivityCSV} style={{ width: '100%' }}>📥 Export Activity Log (CSV)</button>
        </div>
        {activityLog.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 0' }}><p>No activity recorded yet</p></div>
        ) : (
          activityLog.map((entry, idx) => {
            const dotColor = entry.type === 'checkout' ? 'var(--orange)' : entry.type === 'checkin' ? 'var(--green)' : 'var(--blue)';
            return (
              <div key={entry.id || idx} className="log-entry">
                <div className="log-dot" style={{ background: dotColor }} />
                <div>
                  <div className="log-text">{entry.text}</div>
                  <div className="log-date">{formatDate(entry.date)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );

  return (
    <div className="page">
      <div className="report-tabs">
        {REPORT_TABS.map(t => (
          <button key={t.id} className={'report-tab-btn ' + (tab === t.id ? 'active' : '')} onClick={() => setTab(t.id)}>
            <span className="report-tab-icon">{t.icon}</span>
            <span className="report-tab-label">{t.label}</span>
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'categories' && renderCategories()}
      {tab === 'conditions' && renderConditions()}
      {tab === 'events' && renderEvents()}
      {tab === 'flagged' && renderFlagged()}
      {tab === 'activity' && renderActivity()}
    </div>
  );
}
