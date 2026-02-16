import React, { useState, useMemo } from 'react';
import { categoryIcons } from '../utils/categories';

export default function Inventory({ items, navigate, openAddItem }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    let list = [...items];

    // Filter
    if (filter === 'available') list = list.filter(i => (i.qtyOut || 0) === 0);
    else if (filter === 'out') list = list.filter(i => (i.qtyOut || 0) > 0);
    else if (filter === 'attention') list = list.filter(i => ['Fair', 'Poor', 'Needs Repair'].includes(i.condition));

    // Search
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(i =>
        (i.name || '').toLowerCase().includes(s) ||
        (i.itemId || '').toLowerCase().includes(s) ||
        (i.category || '').toLowerCase().includes(s) ||
        (i.color || '').toLowerCase().includes(s) ||
        (i.location || '').toLowerCase().includes(s)
      );
    }

    return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [items, search, filter]);

  const getBadge = (item) => {
    if (item.qtyOut > 0) return <span className="badge badge-orange">{item.qtyOut} out</span>;
    if (['Fair', 'Poor', 'Needs Repair'].includes(item.condition)) return <span className="badge badge-red">{item.condition}</span>;
    return <span className="badge badge-green">In Stock</span>;
  };

  return (
    <div className="page">
      {/* Search */}
      <div className="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
          className="search-input"
          placeholder="Search by name, ID, category, color..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filter Tabs */}
      <div className="tabs">
        {[
          { id: 'all', label: `All (${items.length})` },
          { id: 'available', label: `Available` },
          { id: 'out', label: `Checked Out` },
          { id: 'attention', label: `Attention` },
        ].map(t => (
          <button key={t.id} className={`tab-btn ${filter === t.id ? 'active' : ''}`} onClick={() => setFilter(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Item List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
          <p>No items found</p>
        </div>
      ) : (
        filtered.map(item => (
          <div key={item.id} className="item-row" onClick={() => navigate('itemDetail', { item })}>
            <div className="item-icon">{categoryIcons[item.category] || '📦'}</div>
            <div className="item-info">
              <div className="item-name">{item.name}</div>
              <div className="item-meta">
                {item.category} · Qty: {(item.qtyOwned || 0) - (item.qtyOut || 0)}/{item.qtyOwned || 0} · {item.location} {item.bin}
              </div>
            </div>
            {getBadge(item)}
          </div>
        ))
      )}

      {/* FAB */}
      <button className="fab" onClick={openAddItem} title="Add Item">+</button>
    </div>
  );
}
