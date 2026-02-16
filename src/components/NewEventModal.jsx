import React, { useState } from 'react';
import { todayStr } from '../utils/helpers';

export default function NewEventModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: '',
    date: todayStr(),
    venue: '',
    notes: '',
  });

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-handle" />
        <div className="modal-title">📅 New Event</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Event Name *</label>
            <input className="form-input" value={form.name} onChange={e => update('name', e.target.value)} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Event Date</label>
              <input className="form-input" type="date" value={form.date} onChange={e => update('date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Venue</label>
              <input className="form-input" value={form.venue} onChange={e => update('venue', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" value={form.notes} onChange={e => update('notes', e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary">Create Event</button>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
