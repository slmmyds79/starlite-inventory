import React from 'react';

export default function TopBar({ useDemo }) {
  return (
    <div className="top-bar">
      <div style={{ width: 42, height: 42, borderRadius: 8, background: '#1B2A4A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>✨</div>
      <div>
        <h1>STARLITE EVENTS</h1>
        <div className="subtitle">Inventory Management</div>
      </div>
      {useDemo && (
        <span style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 12, fontWeight: 600, marginLeft: 'auto' }}>DEMO</span>
      )}
    </div>
  );
}
