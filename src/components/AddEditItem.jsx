import React, { useState, useRef } from 'react';
import { categories, conditions, locations } from '../utils/categories';
import { todayStr } from '../utils/helpers';

export default function AddEditItem({ item, onSave, onClose }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    name: item?.name || '',
    category: item?.category || 'Lighting',
    subcategory: item?.subcategory || '',
    color: item?.color || '',
    qtyOwned: item?.qtyOwned || 1,
    condition: item?.condition || 'Excellent',
    unitValue: item?.unitValue || '',
    location: item?.location || 'Unit A',
    bin: item?.bin || '',
    purchaseDate: item?.purchaseDate || todayStr(),
    vendor: item?.vendor || '',
    vendorUrl: item?.vendorUrl || '',
    dimensions: item?.dimensions || '',
    notes: item?.notes || '',
  });
  const [imagePreview, setImagePreview] = useState(item?.image || '');
  const fileInputRef = useRef(null);

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = h * maxDim / w; w = maxDim; }
          else { w = w * maxDim / h; h = maxDim; }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        setImagePreview(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const clearImage = (e) => {
    e.stopPropagation();
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      ...form,
      qtyOwned: parseInt(form.qtyOwned) || 1,
      unitValue: parseFloat(form.unitValue) || 0,
      image: imagePreview || '',
    });
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-handle" />
        <div className="modal-title">{isEdit ? 'Edit Item' : 'Add New Item'}</div>

        <form onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">Photo</label>
            <div
              className={`img-upload-area ${imagePreview ? 'has-image' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="img-preview" />
                  <button type="button" className="img-clear-btn" onClick={clearImage}>✕</button>
                </>
              ) : (
                <div className="img-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <span>Tap to add photo</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input className="form-input" value={form.name} onChange={e => update('name', e.target.value)} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" value={form.category} onChange={e => update('category', e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subcategory</label>
              <input className="form-input" value={form.subcategory} onChange={e => update('subcategory', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Color / Variant</label>
              <input className="form-input" value={form.color} onChange={e => update('color', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input className="form-input" type="number" min="1" value={form.qtyOwned} onChange={e => update('qtyOwned', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select className="form-select" value={form.condition} onChange={e => update('condition', e.target.value)}>
                {conditions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unit Value ($)</label>
              <input className="form-input" type="number" step="0.01" min="0" value={form.unitValue} onChange={e => update('unitValue', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Storage Location</label>
              <select className="form-select" value={form.location} onChange={e => update('location', e.target.value)}>
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Bin / Shelf #</label>
              <input className="form-input" value={form.bin} onChange={e => update('bin', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Purchase Date</label>
            <input className="form-input" type="date" value={form.purchaseDate} onChange={e => update('purchaseDate', e.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Vendor Name</label>
              <input className="form-input" value={form.vendor} onChange={e => update('vendor', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Vendor Website</label>
              <input className="form-input" value={form.vendorUrl} onChange={e => update('vendorUrl', e.target.value)} placeholder="https://" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Dimensions / Size</label>
            <input className="form-input" value={form.dimensions} onChange={e => update('dimensions', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" value={form.notes} onChange={e => update('notes', e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary">{isEdit ? 'Save Changes' : 'Add Item'}</button>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
