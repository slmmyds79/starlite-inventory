import React, { useState } from 'react';

export default function CheckoutModal({ items, events, preselectedItemId, preselectedEventId, onCheckout, onClose, onNewEvent }) {
  const [eventId, setEventId] = useState(preselectedEventId || '');
  const [cart, setCart] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(preselectedItemId || '');
  const [qty, setQty] = useState(1);
  const [checkedOutBy, setCheckedOutBy] = useState('Stephanie');

  const availableItems = items.filter(i => ((i.qtyOwned || 0) - (i.qtyOut || 0)) > 0);
  const selectedItem = items.find(i => i.id === selectedItemId);
  const maxQty = selectedItem ? (selectedItem.qtyOwned || 0) - (selectedItem.qtyOut || 0) - cart.filter(c => c.itemId === selectedItemId).reduce((s, c) => s + c.qty, 0) : 0;

  const addToCart = () => {
    if (!selectedItemId || qty < 1 || qty > maxQty) return;
    const item = items.find(i => i.id === selectedItemId);
    setCart(prev => [...prev, { itemId: selectedItemId, itemName: item.name, qty: parseInt(qty) }]);
    setSelectedItemId('');
    setQty(1);
  };

  const removeFromCart = (idx) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!eventId || cart.length === 0 || !checkedOutBy.trim()) return;
    onCheckout(eventId, cart, checkedOutBy.trim());
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-handle" />
        <div className="modal-title">📤 Check Out Items</div>

        {/* Select Event */}
        <div className="form-group">
          <label className="form-label">Select Event *</label>
          <select className="form-select" value={eventId} onChange={e => setEventId(e.target.value)}>
            <option value="">— Choose event —</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.name} ({e.date})</option>)}
          </select>
          <button type="button" style={{ fontSize: 12, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4, fontFamily: 'inherit' }} onClick={onNewEvent}>
            + Create New Event
          </button>
        </div>

        {/* Add Items */}
        <div className="form-group">
          <label className="form-label">Add Items to Check Out</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 2 }}>
              <select className="form-select" value={selectedItemId} onChange={e => { setSelectedItemId(e.target.value); setQty(1); }}>
                <option value="">— Select item —</option>
                {availableItems.map(i => (
                  <option key={i.id} value={i.id}>{i.name} (avail: {(i.qtyOwned || 0) - (i.qtyOut || 0)})</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 0, minWidth: 70 }}>
              <input className="form-input" type="number" min="1" max={maxQty} value={qty} onChange={e => setQty(e.target.value)} style={{ textAlign: 'center' }} />
            </div>
            <button type="button" className="btn btn-primary btn-sm" style={{ minWidth: 50 }} onClick={addToCart} disabled={!selectedItemId || maxQty <= 0}>
              Add
            </button>
          </div>
        </div>

        {/* Cart */}
        {cart.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Items in Cart ({cart.length})</label>
            {cart.map((c, i) => (
              <div key={i} className="cart-item">
                <span>{c.qty}× {c.itemName}</span>
                <button className="cart-item-remove" onClick={() => removeFromCart(i)}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Checked Out By */}
        <div className="form-group">
          <label className="form-label">Checked Out By *</label>
          <input className="form-input" value={checkedOutBy} onChange={e => setCheckedOutBy(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!eventId || cart.length === 0}>
            Check Out {cart.length} Item{cart.length !== 1 ? 's' : ''}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
