import React, { useState, useEffect, useCallback } from 'react';
import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit, onSnapshot } from './firebase';
import { categoryIcons, categories, conditions, locations, conditionColors, conditionEmojis } from './utils/categories';
import { formatDate, formatCurrency, generateItemId, generateEventId, todayStr } from './utils/helpers';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import ItemDetail from './components/ItemDetail';
import Events from './components/Events';
import EventDetail from './components/EventDetail';
import Scanner from './components/Scanner';
import Reports from './components/Reports';
import AddEditItem from './components/AddEditItem';
import CheckoutModal from './components/CheckoutModal';
import CheckinModal from './components/CheckinModal';
import FlagModal from './components/FlagModal';
import NewEventModal from './components/NewEventModal';
import Toast from './components/Toast';

// Demo data for when Firebase isn't configured
const DEMO_ITEMS = [
  { id: 'demo1', itemId: 'DEC-001', name: 'Crystal Chandelier (Large)', category: 'Lighting', subcategory: 'Chandeliers', color: 'Clear/Gold', qtyOwned: 4, qtyOut: 1, condition: 'Excellent', unitValue: 450, location: 'Unit A', bin: 'A-1', vendor: 'Crystal Palace Decor', vendorUrl: 'https://crystalpalace.com', dimensions: '24" diameter x 30" height', notes: 'Premium crystal, handle with extreme care', purchaseDate: '2024-03-15', lastUsed: '2025-12-20', flag: null, image: '' },
  { id: 'demo2', itemId: 'DEC-002', name: 'Gold Charger Plates', category: 'Tableware', subcategory: 'Chargers', color: 'Antique Gold', qtyOwned: 200, qtyOut: 50, condition: 'Good', unitValue: 8.50, location: 'Unit B', bin: 'B-3', vendor: 'TableTop Wholesale', vendorUrl: '', dimensions: '13" round', notes: 'Sets of 25', purchaseDate: '2024-01-10', lastUsed: '2026-01-15', flag: null, image: '' },
  { id: 'demo3', itemId: 'DEC-003', name: 'Ivory Satin Table Runners', category: 'Linens', subcategory: 'Runners', color: 'Ivory', qtyOwned: 60, qtyOut: 0, condition: 'Good', unitValue: 12, location: 'Unit A', bin: 'A-5', vendor: 'LinenWorks', vendorUrl: '', dimensions: '14" x 108"', notes: '', purchaseDate: '2024-06-01', lastUsed: '2026-01-05', flag: null, image: '' },
  { id: 'demo4', itemId: 'DEC-004', name: 'LED String Lights (Warm)', category: 'Lighting', subcategory: 'String Lights', color: 'Warm White', qtyOwned: 30, qtyOut: 10, condition: 'Fair', unitValue: 25, location: 'Unit C', bin: 'C-2', vendor: 'BrightEvents', vendorUrl: '', dimensions: '100ft per strand', notes: '3 strands have intermittent flicker', purchaseDate: '2023-11-20', lastUsed: '2026-02-01', flag: { type: 'repair', priority: 'medium', description: '3 strands flickering', cost: 45, date: '2026-02-01' }, image: '' },
  { id: 'demo5', itemId: 'DEC-005', name: 'Blush Silk Flower Arrangements', category: 'Florals', subcategory: 'Silk', color: 'Blush Pink', qtyOwned: 24, qtyOut: 0, condition: 'Excellent', unitValue: 85, location: 'Unit A', bin: 'A-8', vendor: 'ForeverBlooms', vendorUrl: 'https://foreverblooms.com', dimensions: '18" tall centerpiece', notes: 'Premium silk, very realistic', purchaseDate: '2024-08-15', lastUsed: '2026-01-28', flag: null, image: '' },
  { id: 'demo6', itemId: 'DEC-006', name: 'White Tulle Draping (Bolts)', category: 'Draping', subcategory: '', color: 'White', qtyOwned: 15, qtyOut: 3, condition: 'Good', unitValue: 35, location: 'Unit D', bin: 'D-1', vendor: 'FabricWorld', vendorUrl: '', dimensions: '54" x 40 yards per bolt', notes: '', purchaseDate: '2024-02-28', lastUsed: '2026-01-20', flag: null, image: '' },
  { id: 'demo7', itemId: 'DEC-007', name: 'Acrylic Sign Holders', category: 'Signage', subcategory: '', color: 'Clear', qtyOwned: 40, qtyOut: 0, condition: 'Good', unitValue: 15, location: 'Unit B', bin: 'B-7', vendor: 'SignPro', vendorUrl: '', dimensions: '5x7" table top', notes: '', purchaseDate: '2024-04-10', lastUsed: '2025-12-15', flag: null, image: '' },
  { id: 'demo8', itemId: 'DEC-008', name: 'Gold Chiavari Chairs', category: 'Furniture', subcategory: 'Chairs', color: 'Gold', qtyOwned: 100, qtyOut: 40, condition: 'Good', unitValue: 45, location: 'Unit D', bin: 'D-4', vendor: 'EventFurniture Co', vendorUrl: '', dimensions: 'Standard', notes: 'Includes ivory cushions', purchaseDate: '2023-06-01', lastUsed: '2026-02-10', flag: null, image: '' },
];

const DEMO_EVENTS = [
  { id: 'evt1', eventId: 'EVT-001', name: 'Johnson Wedding Reception', date: '2026-03-15', venue: 'The Grand Ballroom', notes: 'Gold and ivory theme, 200 guests', status: 'upcoming', items: [
    { itemId: 'DEC-001', itemName: 'Crystal Chandelier (Large)', qty: 1, checkedOutBy: 'Stephanie', date: '2026-02-10', returned: false, returnQty: 0, returnCondition: '', returnDate: '', returnNotes: '' },
    { itemId: 'DEC-002', itemName: 'Gold Charger Plates', qty: 50, checkedOutBy: 'Stephanie', date: '2026-02-10', returned: false, returnQty: 0, returnCondition: '', returnDate: '', returnNotes: '' },
    { itemId: 'DEC-008', itemName: 'Gold Chiavari Chairs', qty: 40, checkedOutBy: 'Stephanie', date: '2026-02-10', returned: false, returnQty: 0, returnCondition: '', returnDate: '', returnNotes: '' },
  ]},
  { id: 'evt2', eventId: 'EVT-002', name: 'Miller Corporate Gala', date: '2026-04-05', venue: 'Riverview Convention Center', notes: 'Modern elegance theme', status: 'upcoming', items: [
    { itemId: 'DEC-004', itemName: 'LED String Lights (Warm)', qty: 10, checkedOutBy: 'Stephanie', date: '2026-02-01', returned: false, returnQty: 0, returnCondition: '', returnDate: '', returnNotes: '' },
    { itemId: 'DEC-006', itemName: 'White Tulle Draping (Bolts)', qty: 3, checkedOutBy: 'Stephanie', date: '2026-02-01', returned: false, returnQty: 0, returnCondition: '', returnDate: '', returnNotes: '' },
  ]},
  { id: 'evt3', eventId: 'EVT-003', name: 'Davis Baby Shower', date: '2026-01-20', venue: 'Garden Terrace', notes: 'Blush and gold theme', status: 'completed', items: [
    { itemId: 'DEC-005', itemName: 'Blush Silk Flower Arrangements', qty: 8, checkedOutBy: 'Stephanie', date: '2026-01-15', returned: true, returnQty: 8, returnCondition: 'Excellent', returnDate: '2026-01-21', returnNotes: 'All in perfect condition' },
  ]},
];

const DEMO_LOG = [
  { id: 'log1', date: '2026-02-10', type: 'checkout', text: 'Checked out 1× Crystal Chandelier (Large) for Johnson Wedding Reception by Stephanie' },
  { id: 'log2', date: '2026-02-10', type: 'checkout', text: 'Checked out 50× Gold Charger Plates for Johnson Wedding Reception by Stephanie' },
  { id: 'log3', date: '2026-02-01', type: 'checkout', text: 'Checked out 10× LED String Lights (Warm) for Miller Corporate Gala by Stephanie' },
  { id: 'log4', date: '2026-02-01', type: 'maintenance', text: '⚠️ LED String Lights (Warm) flagged for maintenance: 3 strands flickering' },
  { id: 'log5', date: '2026-01-21', type: 'checkin', text: 'Returned 8× Blush Silk Flower Arrangements — Excellent condition' },
  { id: 'log6', date: '2026-01-15', type: 'checkout', text: 'Checked out 8× Blush Silk Flower Arrangements for Davis Baby Shower by Stephanie' },
];

function App() {
  const [page, setPage] = useState('dashboard');
  const [prevPage, setPrevPage] = useState(null);
  const [items, setItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [useDemo, setUseDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modals
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutItemId, setCheckoutItemId] = useState(null);
  const [checkoutEventId, setCheckoutEventId] = useState(null);
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinItemId, setCheckinItemId] = useState(null);
  const [showFlag, setShowFlag] = useState(false);
  const [flagItemId, setFlagItemId] = useState(null);
  const [showNewEvent, setShowNewEvent] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        if (!import.meta.env.VITE_FIREBASE_API_KEY) throw new Error('No Firebase config');
        const [itemSnap, eventSnap, logSnap] = await Promise.all([
          getDocs(query(collection(db, 'inventoryItems'))),
          getDocs(query(collection(db, 'events'))),
          getDocs(query(collection(db, 'activityLog'), orderBy('date', 'desc'), limit(50)))
        ]);
        setItems(itemSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setEvents(eventSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setActivityLog(logSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.log('Using demo data:', e.message);
        setUseDemo(true);
        setItems(DEMO_ITEMS);
        setEvents(DEMO_EVENTS);
        setActivityLog(DEMO_LOG);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // ─── Data Operations ───
  const addLogEntry = async (type, text) => {
    const entry = { date: todayStr(), type, text };
    if (!useDemo) {
      const ref = await addDoc(collection(db, 'activityLog'), entry);
      entry.id = ref.id;
    } else {
      entry.id = 'log' + Date.now();
    }
    setActivityLog(prev => [entry, ...prev]);
  };

  const saveItem = async (itemData) => {
    if (editingItem) {
      if (!useDemo) {
        await updateDoc(doc(db, 'inventoryItems', editingItem.id), itemData);
      }
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...itemData } : i));
      addLogEntry('maintenance', `Updated item details: ${itemData.name}`);
      showToast('Item updated successfully!');
    } else {
      const newId = generateItemId(items);
      const newItem = { ...itemData, itemId: newId, qtyOut: 0, flag: null, image: '', lastUsed: '' };
      if (!useDemo) {
        const ref = await addDoc(collection(db, 'inventoryItems'), newItem);
        newItem.id = ref.id;
      } else {
        newItem.id = 'item' + Date.now();
      }
      setItems(prev => [...prev, newItem]);
      addLogEntry('maintenance', `Added new item: ${newItem.qtyOwned}× ${newItem.name} to ${newItem.location}`);
      showToast('Item added successfully!');
    }
    setShowAddEdit(false);
    setEditingItem(null);
  };

  const removeItem = async (item) => {
    if (item.qtyOut > 0) {
      showToast('Cannot remove — items are checked out!');
      return;
    }
    if (!useDemo) {
      await deleteDoc(doc(db, 'inventoryItems', item.id));
    }
    setItems(prev => prev.filter(i => i.id !== item.id));
    addLogEntry('maintenance', `Removed from inventory: ${item.name}`);
    showToast('Item removed');
    setSelectedItem(null);
    setPage('inventory');
  };

  const saveEvent = async (eventData) => {
    const newId = generateEventId(events);
    const newEvent = { ...eventData, eventId: newId, status: 'upcoming', items: [] };
    if (!useDemo) {
      const ref = await addDoc(collection(db, 'events'), newEvent);
      newEvent.id = ref.id;
    } else {
      newEvent.id = 'evt' + Date.now();
    }
    setEvents(prev => [...prev, newEvent]);
    addLogEntry('maintenance', `Created event: ${newEvent.name}`);
    showToast('Event created!');
    setShowNewEvent(false);
    return newEvent;
  };

  const processCheckout = async (eventId, cartItems, checkedOutBy) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const updatedEventItems = [...event.items];
    const updatedInventory = [...items];

    for (const ci of cartItems) {
      const item = updatedInventory.find(i => i.id === ci.itemId);
      if (!item) continue;

      updatedEventItems.push({
        itemId: item.itemId,
        itemName: item.name,
        qty: ci.qty,
        checkedOutBy,
        date: todayStr(),
        returned: false,
        returnQty: 0,
        returnCondition: '',
        returnDate: '',
        returnNotes: ''
      });

      item.qtyOut = (item.qtyOut || 0) + ci.qty;

      if (!useDemo) {
        await updateDoc(doc(db, 'inventoryItems', item.id), { qtyOut: item.qtyOut });
      }
      addLogEntry('checkout', `Checked out ${ci.qty}× ${item.name} for ${event.name} by ${checkedOutBy}`);
    }

    const updatedEvent = { ...event, items: updatedEventItems };
    if (!useDemo) {
      await updateDoc(doc(db, 'events', event.id), { items: updatedEventItems });
    }
    setEvents(prev => prev.map(e => e.id === event.id ? updatedEvent : e));
    setItems(updatedInventory);
    showToast('Items checked out!');
    setShowCheckout(false);
  };

  const processCheckin = async (eventId, itemId, returnQty, returnCondition, returnBy, returnNotes) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const updatedItems = event.items.map(ei => {
      if (ei.itemId === itemId && !ei.returned) {
        return {
          ...ei,
          returned: returnQty >= ei.qty,
          returnQty,
          returnCondition,
          returnDate: todayStr(),
          returnNotes
        };
      }
      return ei;
    });

    // Update inventory
    const invItem = items.find(i => i.itemId === itemId);
    if (invItem) {
      const newQtyOut = Math.max(0, invItem.qtyOut - returnQty);
      const updatedInv = { qtyOut: newQtyOut, condition: returnCondition, lastUsed: todayStr() };
      if (!useDemo) {
        await updateDoc(doc(db, 'inventoryItems', invItem.id), updatedInv);
      }
      setItems(prev => prev.map(i => i.id === invItem.id ? { ...i, ...updatedInv } : i));
    }

    // Check if all items returned → mark event completed
    const allReturned = updatedItems.every(ei => ei.returned);
    const updatedEvent = { ...event, items: updatedItems, status: allReturned ? 'completed' : event.status };
    if (!useDemo) {
      await updateDoc(doc(db, 'events', event.id), { items: updatedItems, status: updatedEvent.status });
    }
    setEvents(prev => prev.map(e => e.id === event.id ? updatedEvent : e));
    setSelectedEvent(updatedEvent);

    addLogEntry('checkin', `Returned ${returnQty}× ${invItem?.name || itemId} — ${returnCondition} condition`);
    if (['Poor', 'Needs Repair', 'Damaged'].includes(returnCondition)) {
      addLogEntry('maintenance', `⚠️ ${invItem?.name} flagged for maintenance: ${returnCondition}`);
    }
    showToast('Item returned!');
    setShowCheckin(false);
  };

  const saveFlag = async (itemId, flagData) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    if (!useDemo) {
      await updateDoc(doc(db, 'inventoryItems', item.id), { flag: flagData });
    }
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, flag: flagData } : i));
    addLogEntry('maintenance', `Flagged ${item.name} for ${flagData.type}: ${flagData.description}`);
    showToast('Item flagged');
    setShowFlag(false);
  };

  const clearFlag = async (item) => {
    if (!useDemo) {
      await updateDoc(doc(db, 'inventoryItems', item.id), { flag: null });
    }
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, flag: null } : i));
    addLogEntry('maintenance', `Cleared flag on ${item.name}`);
    showToast('Flag cleared');
  };

  // ─── Navigation ───
  const navigate = (p, data) => {
    setPrevPage(page);
    setPage(p);
    if (data?.item) setSelectedItem(data.item);
    if (data?.event) setSelectedEvent(data.event);
  };

  const goBack = () => {
    if (page === 'itemDetail') { setPage('inventory'); setSelectedItem(null); }
    else if (page === 'eventDetail') { setPage('events'); setSelectedEvent(null); }
    else setPage('dashboard');
  };

  const openAddItem = () => { setEditingItem(null); setShowAddEdit(true); };
  const openEditItem = (item) => { setEditingItem(item); setShowAddEdit(true); };
  const openCheckout = (itemId, eventId) => { setCheckoutItemId(itemId); setCheckoutEventId(eventId); setShowCheckout(true); };
  const openCheckin = (itemId) => { setCheckinItemId(itemId); setShowCheckin(true); };
  const openFlag = (itemId) => { setFlagItemId(itemId); setShowFlag(true); };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 48 }}>✨</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: 'var(--navy)' }}>Starlite Events</div>
        <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>Loading inventory...</div>
      </div>
    );
  }

  return (
    <>
      <TopBar useDemo={useDemo} />

      {page === 'dashboard' && (
        <Dashboard items={items} events={events} activityLog={activityLog} navigate={navigate} />
      )}
      {page === 'inventory' && (
        <Inventory items={items} navigate={navigate} openAddItem={openAddItem} />
      )}
      {page === 'itemDetail' && selectedItem && (
        <ItemDetail
          item={items.find(i => i.id === selectedItem.id) || selectedItem}
          goBack={goBack}
          openEditItem={openEditItem}
          openCheckout={openCheckout}
          openCheckin={openCheckin}
          openFlag={openFlag}
          clearFlag={clearFlag}
          removeItem={removeItem}
        />
      )}
      {page === 'events' && (
        <Events events={events} navigate={navigate} openNewEvent={() => setShowNewEvent(true)} openCheckout={openCheckout} />
      )}
      {page === 'eventDetail' && selectedEvent && (
        <EventDetail
          event={events.find(e => e.id === selectedEvent.id) || selectedEvent}
          items={items}
          goBack={goBack}
          openCheckout={openCheckout}
          openCheckin={openCheckin}
        />
      )}
      {page === 'scanner' && (
        <Scanner items={items} navigate={navigate} openCheckout={openCheckout} openCheckin={openCheckin} />
      )}
      {page === 'reports' && (
        <Reports items={items} events={events} activityLog={activityLog} />
      )}

      <BottomNav page={page} setPage={(p) => { setPrevPage(page); setPage(p); }} />

      {/* Modals */}
      {showAddEdit && (
        <AddEditItem item={editingItem} onSave={saveItem} onClose={() => { setShowAddEdit(false); setEditingItem(null); }} />
      )}
      {showCheckout && (
        <CheckoutModal
          items={items}
          events={events.filter(e => e.status === 'upcoming')}
          preselectedItemId={checkoutItemId}
          preselectedEventId={checkoutEventId}
          onCheckout={processCheckout}
          onClose={() => setShowCheckout(false)}
          onNewEvent={() => { setShowCheckout(false); setShowNewEvent(true); }}
        />
      )}
      {showCheckin && (
        <CheckinModal
          items={items}
          events={events}
          preselectedItemId={checkinItemId}
          selectedEvent={selectedEvent}
          onCheckin={processCheckin}
          onClose={() => setShowCheckin(false)}
        />
      )}
      {showFlag && (
        <FlagModal itemId={flagItemId} items={items} onSave={saveFlag} onClose={() => setShowFlag(false)} />
      )}
      {showNewEvent && (
        <NewEventModal onSave={saveEvent} onClose={() => setShowNewEvent(false)} />
      )}

      {toast && <Toast message={toast} />}
    </>
  );
}

export default App;
