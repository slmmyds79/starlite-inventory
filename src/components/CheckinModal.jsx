import React, { useState, useMemo } from 'react';
import { conditionEmojis } from '../utils/categories';

export default function CheckinModal({ items, events, preselectedItemId, selectedEvent, onCheckin, onClose }) {
  const [selectedItemId, setSelectedItemId] = useState(preselectedItemId || '');
  const [returnQty, setReturnQty] = useState(1);
  const [condition, setCondition] = useState('');
  const [returnBy, setReturnBy] = useState('Stephanie');
  const [returnNotes, setReturnNotes] = useState('');

  // Find events with this item checked out
  const itemEvents = useMemo(() => {
    return events.filter(e =>
      e.items?.some(ei => ei.itemId === selectedItemId && !ei.returned)
    );
  }, [events, selectedItemId]);

  const [eventId, setEventId] = useState(selectedEvent?.id || '');

  const checkedOutItems = useMemo(() => {
    const ids = new Set();
    events.forEach(e => {
      (e.items || []).forEach(ei => {
        if (!ei.returned) ids.add(ei.itemId);
      });
    });
    return items.filter(i => ids.has(i.itemId));
  }, [items, events]);

  const selectedEvItem = useMemo(() => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return null;
    return ev.items?.find(ei => ei.itemId === selectedItemId && !ei.returned);
  }, [events, eventId, selectedItemId]);

  const maxReturn = selectedEvItem?.qty || 1;

  const handleSubmit = () => {
    if (!eventId || !selectedItemId || !condition || returnQty < 1) return;
    onCheckin(eventId, selectedItemId, parseInt(returnQty), condition, returnBy.trim(), returnNotes.trim());
  };

  const conditionsList = ['Excellent', 'Good', 'Fair', 'Poor', 'Needs Repair', 'Damaged'];

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-handle" />
        <div className="modal-title">📥 Return / Check In</div>

        {/* Select Item */}
        <div className="form-group">
          <label className="form-label">Select Item *</label>
          <select className="form-select" value={selectedItemId} onChange={e => { setSelectedItemId(e.target.value); setEventId(''); }}>
            <option value="">— Choose item —</option>
            {checkedOutItems.map(i => (
              <option key={i.id} value={i.itemId}>{i.name} ({i.qtyOut} out)</option>
            ))}
          </select>
        </div>

        {/* Select Event */}
        {selectedItemId && itemEvents.length > 0 && (
          <div className="form-group">
            <label className="form-label">From Event *</label>
            <select className="form-select" value={eventId} onChange={e => setEventId(e.target.value)}>
              <option value="">— Choose event —</option>
              {itemEvents.map(e => {
                const ei = e.items.find(ei => ei.itemId === selectedItemId && !ei.returned);
                return <option key={e.id} value={e.id}>{e.name} (qty: {ei?.qty})</option>;
              })}
            </select>
          </div>
        )}

        {/* Quantity */}
        {selectedEvItem && (
          <div className="form-group">
            <label className="form-label">Quantity Returning (max: {maxReturn})</label>
            <input className="form-input" type="number" min="1" max={maxReturn} value={returnQty} onChange={e => setReturnQty(e.target.value)} />
          </div>
        )}

        {/* Return Condition */}
        <div className="form-group">
          <label className="form-label">Return Condition *</label>
          <div className="condition-options">
            {conditionsList.map(c => (
              <button
                key={c}
                type="button"
                className={`condition-opt ${condition === c ? 'selected' : ''}`}
                onClick={() => setCondition(c)}
              >
                <span className="emoji">{conditionEmojis[c]}</span>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Return By */}
        <div className="form-group">
          <label className="form-label">Returned By</label>
          <input className="form-input" value={returnBy} onChange={e => setReturnBy(e.target.value)} />
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="form-label">Return Notes</label>
          <textarea className="form-textarea" value={returnNotes} onChange={e => setReturnNotes(e.target.value)} placeholder="Describe any damage or issues..." />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn btn-green" onClick={handleSubmit} disabled={!selectedItemId || !condition || !eventId}>
            Return Item
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
