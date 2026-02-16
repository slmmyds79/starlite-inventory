import React, { useMemo } from 'react';
import { categoryIcons } from '../utils/categories';
import { formatDate, formatCurrency } from '../utils/helpers';

export default function ReportOverlay({ type, items, events, activityLog, onClose }) {
  if (!type) return null;

  const titles = {
    full: 'Full Inventory Report',
    flags: 'Flags & Maintenance Report',
    value: 'Inventory Value Report',
    checkedout: 'Checked Out Items Report',
    events: 'Events Report',
    upcoming: 'Upcoming Events & Reservations',
    pulllist: 'Pull List',
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const renderContent = () => {
    let html = [];

    // ─── FULL / VALUE REPORT ───
    if (type === 'full' || type === 'value') {
      const totalItems = items.length;
      const totalQty = items.reduce((s, i) => s + (i.qtyOwned || 0), 0);
      const totalOut = items.reduce((s, i) => s + (i.qtyOut || 0), 0);
      const totalValue = items.reduce((s, i) => s + (i.qtyOwned || 0) * (i.unitValue || 0), 0);
      const avgValue = totalItems > 0 ? totalValue / totalItems : 0;

      html.push(
        <div key="summary">
          <div className="rpt-section-title">Inventory Summary</div>
          <table className="rpt-table">
            <thead><tr><th>Metric</th><th>Value</th></tr></thead>
            <tbody>
              <tr><td>Unique Items</td><td>{totalItems}</td></tr>
              <tr><td>Total Pieces</td><td>{totalQty.toLocaleString()}</td></tr>
              <tr><td>Currently Checked Out</td><td>{totalOut}</td></tr>
              <tr><td>Total Inventory Value</td><td>{formatCurrency(totalValue)}</td></tr>
              <tr><td>Average Value per Item Type</td><td>{formatCurrency(avgValue)}</td></tr>
            </tbody>
          </table>
        </div>
      );

      // Category breakdown
      const cats = {};
      items.forEach(i => {
        const c = i.category || 'Other';
        if (!cats[c]) cats[c] = { count: 0, qty: 0, value: 0 };
        cats[c].count++;
        cats[c].qty += (i.qtyOwned || 0);
        cats[c].value += (i.qtyOwned || 0) * (i.unitValue || 0);
      });
      const totalVal = items.reduce((s, i) => s + (i.qtyOwned || 0) * (i.unitValue || 0), 0);

      html.push(
        <div key="cats">
          <div className="rpt-section-title">Value by Category</div>
          <table className="rpt-table">
            <thead><tr><th>Category</th><th>Items</th><th>Total Qty</th><th>Total Value</th><th>% of Value</th></tr></thead>
            <tbody>
              {Object.entries(cats).sort((a,b) => b[1].value - a[1].value).map(([cat, d]) => (
                <tr key={cat}><td>{cat}</td><td>{d.count}</td><td>{d.qty}</td><td>{formatCurrency(d.value)}</td><td>{totalVal > 0 ? (d.value/totalVal*100).toFixed(1) : 0}%</td></tr>
              ))}
              <tr style={{fontWeight:700}}><td>Total</td><td>{totalItems}</td><td>{totalQty}</td><td>{formatCurrency(totalVal)}</td><td>100%</td></tr>
            </tbody>
          </table>
        </div>
      );

      // Location breakdown
      const locs = {};
      items.forEach(i => {
        const l = i.location || 'Unknown';
        if (!locs[l]) locs[l] = { count: 0, qty: 0, value: 0 };
        locs[l].count++;
        locs[l].qty += (i.qtyOwned || 0);
        locs[l].value += (i.qtyOwned || 0) * (i.unitValue || 0);
      });
      html.push(
        <div key="locs">
          <div className="rpt-section-title">Value by Storage Location</div>
          <table className="rpt-table">
            <thead><tr><th>Location</th><th>Items</th><th>Total Qty</th><th>Total Value</th></tr></thead>
            <tbody>
              {Object.entries(locs).sort((a,b) => b[1].value - a[1].value).map(([loc, d]) => (
                <tr key={loc}><td>{loc}</td><td>{d.count}</td><td>{d.qty}</td><td>{formatCurrency(d.value)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // ─── FULL: complete item list ───
    if (type === 'full') {
      html.push(
        <div key="fulllist">
          <div className="rpt-section-title">Complete Item List</div>
          <table className="rpt-table rpt-table-sm">
            <thead><tr><th>ID</th><th>Item</th><th>Category</th><th>Color</th><th>Qty</th><th>Avail</th><th>Condition</th><th>Location</th><th>Unit $</th><th>Total $</th></tr></thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id}>
                  <td>{i.itemId}</td>
                  <td>{i.name}{i.flag ? (i.flag.type === 'repair' ? ' 🔧' : ' 🔄') : ''}</td>
                  <td>{i.category}</td>
                  <td>{i.color || '—'}</td>
                  <td>{i.qtyOwned || 0}</td>
                  <td>{(i.qtyOwned || 0) - (i.qtyOut || 0)}</td>
                  <td>{i.condition}</td>
                  <td>{i.location} {i.bin}</td>
                  <td>{formatCurrency(i.unitValue)}</td>
                  <td>{formatCurrency((i.qtyOwned || 0) * (i.unitValue || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // ─── FLAGS REPORT ───
    if (type === 'full' || type === 'flags') {
      const flagged = items.filter(i => i.flag);
      const totalFlagCost = flagged.reduce((s, i) => s + (i.flag?.cost || 0), 0);
      html.push(
        <div key="flags">
          <div className="rpt-section-title">Flagged Items — Repair & Replacement</div>
          {flagged.length === 0 ? (
            <p style={{color:'var(--green)',fontWeight:600}}>No items currently flagged.</p>
          ) : (
            <>
              <p style={{fontSize:13,color:'var(--gray-500)',marginBottom:10}}>{flagged.length} items flagged · Estimated total cost: {formatCurrency(totalFlagCost)}</p>
              <table className="rpt-table">
                <thead><tr><th>ID</th><th>Item</th><th>Flag</th><th>Priority</th><th>Issue</th><th>Est. Cost</th></tr></thead>
                <tbody>
                  {flagged.sort((a,b) => {
                    const p = {high:0,medium:1,low:2};
                    return (p[a.flag?.priority]||2) - (p[b.flag?.priority]||2);
                  }).map(i => (
                    <tr key={i.id}>
                      <td>{i.itemId}</td>
                      <td>{i.name}</td>
                      <td style={{color:i.flag?.type==='repair'?'#92400e':'#991b1b',fontWeight:600}}>{i.flag?.type==='repair'?'Repair':'Replace'}</td>
                      <td>{(i.flag?.priority||'medium').charAt(0).toUpperCase()+(i.flag?.priority||'medium').slice(1)}</td>
                      <td>{i.flag?.description}</td>
                      <td>{formatCurrency(i.flag?.cost || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      );
    }

    // ─── CHECKED OUT REPORT ───
    if (type === 'checkedout') {
      const checkedOutItems = items.filter(i => (i.qtyOut || 0) > 0);
      const totalOut = checkedOutItems.reduce((s, i) => s + (i.qtyOut || 0), 0);
      const outValue = checkedOutItems.reduce((s, i) => s + (i.qtyOut || 0) * (i.unitValue || 0), 0);

      html.push(
        <div key="co-summary">
          <div className="rpt-section-title">Currently Checked Out — Summary</div>
          <table className="rpt-table">
            <thead><tr><th>Metric</th><th>Value</th></tr></thead>
            <tbody>
              <tr><td>Items Currently Out</td><td>{checkedOutItems.length} items ({totalOut} pieces)</td></tr>
              <tr><td>Value at Risk</td><td>{formatCurrency(outValue)}</td></tr>
            </tbody>
          </table>
        </div>
      );

      // Group by event
      const eventGroups = {};
      events.forEach(evt => {
        const pending = (evt.items || []).filter(i => !i.returned);
        if (pending.length > 0) {
          eventGroups[evt.id] = { event: evt, items: pending };
        }
      });
      if (Object.keys(eventGroups).length > 0) {
        html.push(
          <div key="co-events">
            <div className="rpt-section-title">Checked Out by Event</div>
            {Object.values(eventGroups).map(group => {
              const evt = group.event;
              return (
                <div key={evt.id}>
                  <div style={{fontWeight:700,color:'#1B2A4A',fontSize:14,margin:'12px 0 6px'}}>{evt.name} — {formatDate(evt.date)} · {evt.venue}</div>
                  <table className="rpt-table">
                    <thead><tr><th>ID</th><th>Item</th><th>Qty Out</th><th>Checked Out By</th><th>Date Out</th><th>Value</th></tr></thead>
                    <tbody>
                      {group.items.map((ei, idx) => {
                        const invItem = items.find(inv => inv.itemId === ei.itemId);
                        return (
                          <tr key={idx}>
                            <td>{ei.itemId}</td>
                            <td>{ei.itemName}</td>
                            <td>{ei.qty}</td>
                            <td>{ei.checkedOutBy}</td>
                            <td>{formatDate(ei.date)}</td>
                            <td>{formatCurrency((invItem?.unitValue || 0) * ei.qty)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        );
      }

      if (checkedOutItems.length === 0) {
        html.push(<div key="co-empty" style={{textAlign:'center',padding:24,color:'#22c55e',fontWeight:600,fontSize:15}}>All items are currently in stock!</div>);
      }
    }

    // ─── EVENTS REPORT ───
    if (type === 'events') {
      const upcoming = events.filter(e => e.status === 'upcoming').sort((a,b) => (a.date||'').localeCompare(b.date||''));
      const completed = events.filter(e => e.status === 'completed').sort((a,b) => (b.date||'').localeCompare(a.date||''));

      html.push(
        <div key="evt-summary">
          <div className="rpt-section-title">Events Overview</div>
          <table className="rpt-table">
            <thead><tr><th>Metric</th><th>Value</th></tr></thead>
            <tbody>
              <tr><td>Total Events</td><td>{events.length}</td></tr>
              <tr><td>Upcoming Events</td><td>{upcoming.length}</td></tr>
              <tr><td>Completed Events</td><td>{completed.length}</td></tr>
            </tbody>
          </table>
        </div>
      );

      if (upcoming.length > 0) {
        html.push(
          <div key="evt-upcoming">
            <div className="rpt-section-title">Upcoming Events</div>
            <table className="rpt-table">
              <thead><tr><th>Event</th><th>Date</th><th>Venue</th><th>Items</th><th>Notes</th></tr></thead>
              <tbody>
                {upcoming.map(e => (
                  <tr key={e.id}>
                    <td style={{fontWeight:600}}>{e.name}</td>
                    <td>{formatDate(e.date)}</td>
                    <td>{e.venue}</td>
                    <td>{e.items?.length || 0} items ({e.items?.reduce((s,i) => s + (i.qty || 0), 0) || 0} pcs)</td>
                    <td>{e.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      if (completed.length > 0) {
        html.push(
          <div key="evt-completed">
            <div className="rpt-section-title">Completed Events</div>
            <table className="rpt-table">
              <thead><tr><th>Event</th><th>Date</th><th>Venue</th><th>Items Used</th><th>All Returned</th></tr></thead>
              <tbody>
                {completed.map(e => {
                  const allRet = e.items && e.items.length > 0 ? e.items.every(i => i.returned) : true;
                  return (
                    <tr key={e.id}>
                      <td style={{fontWeight:600}}>{e.name}</td>
                      <td>{formatDate(e.date)}</td>
                      <td>{e.venue}</td>
                      <td>{e.items?.length || 0} items</td>
                      <td style={{color:allRet?'#22c55e':'#f59e0b',fontWeight:600}}>{allRet?'Yes':'No'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // ─── UPCOMING REPORT ───
    if (type === 'upcoming') {
      const upcoming = events.filter(e => e.status === 'upcoming').sort((a,b) => (a.date||'').localeCompare(b.date||''));
      html.push(
        <div key="upc">
          <div className="rpt-section-title">Upcoming Events & Reserved Items</div>
          {upcoming.length === 0 ? (
            <div style={{textAlign:'center',padding:24,color:'#6b7280'}}>No upcoming events scheduled.</div>
          ) : (
            <>
              <table className="rpt-table">
                <thead><tr><th>Event</th><th>Date</th><th>Venue</th><th>Items Out</th></tr></thead>
                <tbody>
                  {upcoming.map(e => (
                    <tr key={e.id}>
                      <td style={{fontWeight:600}}>{e.name}</td>
                      <td>{formatDate(e.date)}</td>
                      <td>{e.venue}</td>
                      <td>{e.items?.reduce((s,i) => s + (i.qty || 0), 0) || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {upcoming.map(e => (
                e.items && e.items.length > 0 ? (
                  <div key={e.id + '-detail'}>
                    <div style={{fontWeight:700,color:'#1B2A4A',fontSize:14,margin:'16px 0 6px',paddingTop:8,borderTop:'2px solid #e2e4e8'}}>{e.name}</div>
                    <div style={{fontSize:12,color:'#6b7280',marginBottom:8}}>{formatDate(e.date)} · {e.venue}</div>
                    <table className="rpt-table">
                      <thead><tr><th>ID</th><th>Item</th><th>Qty</th><th>Status</th><th>By</th></tr></thead>
                      <tbody>
                        {e.items.map((i, idx) => (
                          <tr key={idx}>
                            <td>{i.itemId}</td>
                            <td>{i.itemName}</td>
                            <td>{i.qty}</td>
                            <td style={{color:i.returned?'#22c55e':'#f59e0b',fontWeight:600}}>{i.returned?'Returned':'Out'}</td>
                            <td>{i.checkedOutBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null
              ))}
            </>
          )}
        </div>
      );
    }

    // ─── ACTIVITY LOG (full report only) ───
    if (type === 'full') {
      html.push(
        <div key="activity">
          <div className="rpt-section-title">Recent Activity (Last 20)</div>
          <table className="rpt-table">
            <thead><tr><th>Date</th><th>Type</th><th>Details</th></tr></thead>
            <tbody>
              {(activityLog || []).slice(0, 20).map((a, idx) => (
                <tr key={idx}>
                  <td>{formatDate(a.date)}</td>
                  <td style={{textTransform:'capitalize'}}>{a.type}</td>
                  <td>{a.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return html;
  };

  return (
    <div className="report-overlay">
      <div className="report-overlay-inner">
        {/* Header */}
        <div className="report-header">
          <div className="report-logo">✨ Starlite Events</div>
          <div className="report-title-text">{titles[type] || 'Report'}</div>
          <div className="report-date">Generated: {today}</div>
        </div>

        {/* Actions */}
        <div className="report-actions no-print">
          <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print
          </button>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>

        {/* Content */}
        <div className="report-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
