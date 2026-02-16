import React, { useState, useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { categoryIcons, conditionColors } from '../utils/categories';
import { formatDate, formatCurrency } from '../utils/helpers';

export default function ItemDetail({ item, goBack, openEditItem, openCheckout, openCheckin, openFlag, clearFlag, removeItem, onImageUpdate }) {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const photoInputRef = useRef(null);
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && item?.itemId) {
      try {
        JsBarcode(barcodeRef.current, item.itemId, {
          format: 'CODE128',
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 14,
          font: 'monospace',
          fontOptions: 'bold',
          textMargin: 6,
          margin: 10,
          background: '#ffffff',
          lineColor: '#1B2A4A',
        });
      } catch (e) {
        console.warn('Barcode generation failed:', e);
      }
    }
  }, [item?.itemId]);

  if (!item) return null;

  const available = (item.qtyOwned || 0) - (item.qtyOut || 0);
  const totalValue = (item.qtyOwned || 0) * (item.unitValue || 0);
  const cc = conditionColors[item.condition] || {};

  const handleQuickPhoto = (e) => {
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
        if (onImageUpdate) onImageUpdate(item.id, canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const printBarcodeLabel = () => {
    if (!barcodeRef.current) return;
    const svgData = barcodeRef.current.outerHTML;
    const printWindow = window.open('', '_blank', 'width=400,height=300');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Barcode Label - ${item.itemId}</title>
      <style>
        body { margin: 0; padding: 20px; text-align: center; font-family: 'Inter', Arial, sans-serif; }
        .label { display: inline-block; border: 1px dashed #ccc; padding: 16px 24px; border-radius: 8px; }
        .label-brand { font-size: 10px; color: #888; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
        .label-name { font-size: 14px; font-weight: 700; color: #1B2A4A; margin-bottom: 8px; }
        .label-barcode svg { display: block; margin: 0 auto; }
        @media print { body { padding: 8px; } .label { border: none; padding: 8px; } }
      </style>
      </head>
      <body>
        <div class="label">
          <div class="label-brand">✨ Starlite Events</div>
          <div class="label-name">${item.name}</div>
          <div class="label-barcode">${svgData}</div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={goBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
        Back to Inventory
      </button>

      {/* Header */}
      <div className="detail-header">
        {item.image ? (
          <img src={item.image} alt={item.name} className="detail-photo" />
        ) : (
          <div className="detail-icon">{categoryIcons[item.category] || '📦'}</div>
        )}
        <div className="detail-name">{item.name}</div>
        <div className="detail-id">{item.itemId}</div>
        {item.condition && (
          <span className="badge" style={{ background: cc.bg, color: cc.text, marginTop: 8, display: 'inline-block' }}>
            {item.condition}
          </span>
        )}
        {!item.image && onImageUpdate && (
          <>
            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: 8, width: 'auto', display: 'inline-flex' }}
              onClick={() => photoInputRef.current?.click()}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Add Photo
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleQuickPhoto}
              style={{ display: 'none' }}
            />
          </>
        )}

        {/* Real Scannable Barcode */}
        <div className="barcode-display">
          <svg ref={barcodeRef}></svg>
          <button className="barcode-print-btn" onClick={printBarcodeLabel} title="Print barcode label">
            🖨️ Print Label
          </button>
        </div>
      </div>

      {/* Flag Bar */}
      {item.flag && (
        <div className={`flag-bar ${item.flag.type}`}>
          <div className="flag-bar-content">
            <div className="flag-bar-type">
              {item.flag.type === 'replace' ? '🔴 Needs Replacing' : '🟠 Needs Repair'} — Priority: {item.flag.priority}
            </div>
            <div className="flag-bar-desc">{item.flag.description}</div>
            {item.flag.cost > 0 && <div className="flag-bar-desc">Est. cost: {formatCurrency(item.flag.cost)}</div>}
          </div>
          <button className="flag-dismiss" onClick={() => clearFlag(item)}>✕</button>
        </div>
      )}

      {/* Detail Grid */}
      <div className="detail-grid">
        <div className="detail-cell">
          <div className="detail-cell-label">Category</div>
          <div className="detail-cell-value">{item.category || '—'}</div>
        </div>
        <div className="detail-cell">
          <div className="detail-cell-label">Subcategory</div>
          <div className="detail-cell-value">{item.subcategory || '—'}</div>
        </div>
        <div className="detail-cell">
          <div className="detail-cell-label">Color</div>
          <div className="detail-cell-value">{item.color || '—'}</div>
        </div>
        <div className="detail-cell">
          <div className="detail-cell-label">Condition</div>
          <div className="detail-cell-value">{item.condition || '—'}</div>
        </div>
        <div className="detail-cell">
          <div className="detail-cell-label">Qty Owned</div>
          <div className="detail-cell-value">{item.qtyOwned || 0}</div>
        </div>
        <div className="detail-cell">
          <div className="detail-cell-label">Available</div>
          <div className="detail-cell-value" style={{ color: available > 0 ? '#166534' : '#991b1b' }}>{available}</div>
        </div>
        <div className="detail-cell">
          <div className="detail-cell-label">Checked Out</div>
          <div className="detail-cell-value" style={{ color: item.qtyOut > 0 ? '#92400e' : undefined }}>{item.qtyOut || 0}</div>
        </div>
        <div className="detail-cell">
          <div className="detail-cell-label">Unit Value</div>
          <div className="detail-cell-value">{formatCurrency(item.unitValue)}</div>
        </div>
        <div className="detail-cell full">
          <div className="detail-cell-label">Total Value</div>
          <div className="detail-cell-value">{formatCurrency(totalValue)}</div>
        </div>
        <div className="detail-cell">
          <div className="detail-cell-label">Storage</div>
          <div className="detail-cell-value">{item.location || '—'} {item.bin || ''}</div>
        </div>
        <div className="detail-cell">
          <div className="detail-cell-label">Dimensions</div>
          <div className="detail-cell-value">{item.dimensions || '—'}</div>
        </div>
        <div className="detail-cell">
          <div className="detail-cell-label">Purchased</div>
          <div className="detail-cell-value">{formatDate(item.purchaseDate)}</div>
        </div>
        <div className="detail-cell">
          <div className="detail-cell-label">Last Used</div>
          <div className="detail-cell-value">{formatDate(item.lastUsed)}</div>
        </div>
        {item.vendor && (
          <div className="detail-cell full">
            <div className="detail-cell-label">Vendor</div>
            <div className="detail-cell-value">
              {item.vendorUrl ? (
                <a href={item.vendorUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', textDecoration: 'underline' }}>{item.vendor}</a>
              ) : item.vendor}
            </div>
          </div>
        )}
        {item.notes && (
          <div className="detail-cell full">
            <div className="detail-cell-label">Notes</div>
            <div className="detail-cell-value" style={{ fontWeight: 400, fontSize: 13 }}>{item.notes}</div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-bar">
        {available > 0 && (
          <button className="btn btn-primary btn-sm" onClick={() => openCheckout(item.id)}>
            📤 Check Out
          </button>
        )}
        {(item.qtyOut || 0) > 0 && (
          <button className="btn btn-green btn-sm" onClick={() => openCheckin(item.itemId)}>
            📥 Check In
          </button>
        )}
        <button className="btn btn-outline btn-sm" onClick={() => openEditItem(item)}>✏️ Edit</button>
        <button className="btn btn-gold btn-sm" onClick={() => openFlag(item.id)}>🚩 Flag</button>
      </div>
      <div style={{ marginTop: 8 }}>
        {!showRemoveConfirm ? (
          <button className="btn btn-sm" style={{ background: 'var(--gray-100)', color: 'var(--red)' }} onClick={() => setShowRemoveConfirm(true)}>
            🗑️ Remove Item
          </button>
        ) : (
          <div className="card" style={{ border: '2px solid var(--red)', padding: 16 }}>
            <p style={{ fontSize: 14, marginBottom: 12, fontWeight: 600 }}>
              Remove "{item.name}" ({item.itemId})?
            </p>
            <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 12 }}>
              Qty: {item.qtyOwned} · Value: {formatCurrency(totalValue)}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-red btn-sm" onClick={() => removeItem(item)}>Yes, Remove</button>
              <button className="btn btn-outline btn-sm" onClick={() => setShowRemoveConfirm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
