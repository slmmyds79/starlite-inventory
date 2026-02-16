import React from 'react';
import { formatDate } from '../utils/helpers';

export default function Events({ events, navigate, openNewEvent }) {
  const upcoming = events.filter(e => e.status === 'upcoming').sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const completed = events.filter(e => e.status === 'completed').sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const pendingReturns = (event) => (event.items || []).filter(i => !i.returned).length;

  return (
    <div className="page">
      {/* Header with New Event button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div className="section-header" style={{ margin: 0 }}>Upcoming Events</div>
        <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={openNewEvent}>
          + New Event
        </button>
      </div>

      {upcoming.length === 0 ? (
        <div className="empty-state" style={{ padding: 20 }}>
          <p>No upcoming events</p>
        </div>
      ) : (
        upcoming.map(e => (
          <div key={e.id} className="event-card" onClick={() => navigate('eventDetail', { event: e })}>
            <div className="event-card-title">{e.name}</div>
            <div className="event-card-meta">{formatDate(e.date)} · {e.venue}</div>
            <div className="event-card-footer">
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>📦 {e.items?.length || 0} items</span>
              {pendingReturns(e) > 0 && (
                <span style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600 }}>
                  ⏳ {pendingReturns(e)} pending return
                </span>
              )}
              <span className="badge badge-blue">Upcoming</span>
            </div>
          </div>
        ))
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <>
          <div className="section-header" style={{ marginTop: 24 }}>Completed Events</div>
          {completed.map(e => (
            <div key={e.id} className="event-card" onClick={() => navigate('eventDetail', { event: e })}>
              <div className="event-card-title">{e.name}</div>
              <div className="event-card-meta">{formatDate(e.date)} · {e.venue}</div>
              <div className="event-card-footer">
                <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>📦 {e.items?.length || 0} items</span>
                <span className="badge badge-green">Done</span>
              </div>
            </div>
          ))}
        </>
      )}

      {/* FAB (keep as secondary) */}
      <button className="fab" onClick={openNewEvent} title="New Event">+</button>
    </div>
  );
}
