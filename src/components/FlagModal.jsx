import React, { useState } from 'react';
import { todayStr } from '../utils/helpers';

export default function FlagModal({ itemId, items, onSave, onClose }) {
  const item = items.find(i => i.id === itemId);
  const [flagType, setFlagType] = useState('repair');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');

  const handleSubmit = () => {
    if (!description.trim()) return;
    onSave(itemId, {
      type: flagType,
      priority,
      description: description.trim(),
      cost: parseFloat(cost) || 0,
      date: todayStr()
    });
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-handle" />
        <div className="modal-title">🚩 Flag Item</div>
        {item && <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--gray-500)', marginBottom: 16 }}>{item.name}</p>}

        {/* Flag Type */}
        <div className="form-group">
          <label className="form-label">Flag Type *</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`condition-opt ${flagType === 'repair' ? 'selected' : ''}`}
              style={{ flex: 1, borderColor: flagType === 'repair' ? 'var(--orange)' : undefined, background: flagType === 'repair' ? 'var(--orange)' : undefined }}
              onClick={() => setFlagType('repair')}
            >
              <span className="emoji">🔧</span>
              Needs Repair
            </button>
            <button
              type="button"
              className={`condition-opt ${flagType === 'replace' ? 'selected' : ''}`}
              style={{ flex: 1, borderColor: flagType === 'replace' ? 'var(--red)' : undefined, background: flagType === 'replace' ? 'var(--red)' : undefined }}
              onClick={() => setFlagType('replace')}
            >
              <span className="emoji">🔴</span>
              Needs Replacing
            </button>
          </div>
        </div>

        {/* Priority */}
        <div className="form-group">
          <label className="form-label">Priority *</label>
          <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the issue..." />
        </div>

        {/* Estimated Cost */}
        <div className="form-group">
          <label className="form-label">Estimated Cost ($)</label>
          <input className="form-input" type="number" step="0.01" min="0" value={cost} onChange={e => setCost(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn btn-gold" onClick={handleSubmit} disabled={!description.trim()}>Save Flag</button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
