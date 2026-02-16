import React, { useState, useRef, useEffect } from 'react';
import { categoryIcons } from '../utils/categories';

export default function Scanner({ items, navigate, openCheckout, openCheckin }) {
  const [lookupId, setLookupId] = useState('');
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef(null);
  const scannerInstance = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerInstance.current) {
        try { scannerInstance.current.stop(); } catch(e) {}
      }
    };
  }, []);

  const startScanner = async () => {
    setCameraError('');
    setScanning(true);
    try {
      // Dynamically load html5-qrcode
      if (!window.Html5Qrcode) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      const scanner = new window.Html5Qrcode('scanner-container');
      scannerInstance.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 120 }, aspectRatio: 1.5 },
        (decodedText) => {
          stopScanner();
          lookupItem(decodedText.toUpperCase().trim());
        },
        () => {}
      );
    } catch (err) {
      setCameraError('Camera not available. Use manual lookup below.');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerInstance.current) {
      try {
        scannerInstance.current.stop().then(() => {
          scannerInstance.current.clear();
        }).catch(() => {});
      } catch(e) {}
      scannerInstance.current = null;
    }
    setScanning(false);
  };

  const doLookup = () => {
    if (!lookupId.trim()) return;
    lookupItem(lookupId.trim());
  };

  const lookupItem = (code) => {
    const s = code.toLowerCase();
    const found = items.find(i =>
      (i.itemId || '').toLowerCase() === s ||
      (i.name || '').toLowerCase().includes(s)
    );
    if (found) {
      setResult(found);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
    setLookupId(code);
  };

  return (
    <div className="page">
      <div className="card">
        <div className="card-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 012-2h2"/><path d="M17 3h2a2 2 0 012 2v2"/><path d="M21 17v2a2 2 0 01-2 2h-2"/><path d="M7 21H5a2 2 0 01-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>
          Barcode Scanner
        </div>

        {/* Camera Scanner Area */}
        <div style={{ marginBottom: 14 }}>
          {!scanning ? (
            <div style={{ textAlign: 'center', padding: '20px 16px', background: 'var(--gray-100)', borderRadius: 'var(--radius)', border: '2px dashed var(--gray-300)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5">
                <path d="M3 7V5a2 2 0 012-2h2"/><path d="M17 3h2a2 2 0 012 2v2"/><path d="M21 17v2a2 2 0 01-2 2h-2"/><path d="M7 21H5a2 2 0 01-2-2v-2"/>
                <line x1="7" y1="12" x2="17" y2="12"/>
              </svg>
              {cameraError ? (
                <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 8 }}>{cameraError}</p>
              ) : (
                <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 8 }}>Tap to scan barcode</p>
              )}
              <button className="btn btn-primary btn-sm" style={{ marginTop: 10, width: 'auto' }} onClick={startScanner}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                Start Scanner
              </button>
            </div>
          ) : (
            <div>
              <div id="scanner-container" style={{ minHeight: 280, borderRadius: 'var(--radius)', overflow: 'hidden' }} />
              <button className="btn btn-outline btn-sm" style={{ marginTop: 8, width: '100%' }} onClick={stopScanner}>
                Stop Scanner
              </button>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Manual Lookup</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              placeholder="Enter Item ID or name..."
              value={lookupId}
              onChange={e => setLookupId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doLookup()}
            />
            <button className="btn btn-primary btn-sm" style={{ minWidth: 80 }} onClick={doLookup}>Search</button>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="card" style={{ border: '2px solid var(--green-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            {result.image ? (
              <img src={result.image} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />
            ) : (
              <div className="item-icon" style={{ background: 'var(--green-bg)', fontSize: 24 }}>
                {categoryIcons[result.category] || '📦'}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 16 }}>{result.name}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', fontFamily: 'monospace' }}>{result.itemId}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>
            {result.category} · Available: {(result.qtyOwned || 0) - (result.qtyOut || 0)}/{result.qtyOwned || 0} · {result.location} {result.bin}
          </div>
          <div className="action-bar">
            <button className="btn btn-outline btn-sm" onClick={() => navigate('itemDetail', { item: result })}>View Details</button>
            {((result.qtyOwned || 0) - (result.qtyOut || 0)) > 0 && (
              <button className="btn btn-primary btn-sm" onClick={() => openCheckout(result.id)}>📤 Check Out</button>
            )}
            {(result.qtyOut || 0) > 0 && (
              <button className="btn btn-green btn-sm" onClick={() => openCheckin(result.itemId)}>📥 Check In</button>
            )}
          </div>
        </div>
      )}

      {notFound && (
        <div className="card" style={{ border: '2px solid var(--red-border)', textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>❌</div>
          <div style={{ fontWeight: 600, color: '#991b1b' }}>Item not found</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>Try searching by ID (e.g. DEC-001) or item name</div>
        </div>
      )}
    </div>
  );
}
