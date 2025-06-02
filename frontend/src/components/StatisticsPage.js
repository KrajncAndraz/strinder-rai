import { useEffect, useState } from 'react';

export default function StatisticsPage() {
  const [devices, setDevices] = useState([]);
  const [trackers, setTrackers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/statistics/devices')
      .then(res => res.json())
      .then(data => setDevices(Array.isArray(data) ? data : []))
      .catch(() => setDevices([]));

    fetch('http://localhost:3001/statistics/trackers')
      .then(res => res.json())
      .then(data => setTrackers(Array.isArray(data) ? data : []))
      .catch(() => setTrackers([]));
  }, []);

  return (
    <div style={{ display: 'flex', gap: 32, padding: 32 }}>
      {/* Leva stran: Statistika naprav */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2>Statistika naprav</h2>
        <div style={{
          maxHeight: 500,
          overflowY: 'auto',
          border: '1px solid #ccc',
          borderRadius: 8,
          padding: 12,
          background: '#fafafa'
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {devices.map((stat, i) => (
              <li key={stat._id || i} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                <div><b>Čas prijave:</b> {new Date(stat.loginTime).toLocaleString()}</div>
                <div><b>Brand:</b> {stat.device?.brand || '-'}</div>
                <div><b>Model:</b> {stat.device?.modelName || '-'}</div>
                <div><b>OS:</b> {stat.device?.osName || '-'} {stat.device?.osVersion || ''}</div>
                <div><b>Manufacturer:</b> {stat.device?.manufacturer || '-'}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Desna stran: Trackerji */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2>Vsi trackerji (workouti)</h2>
        <div style={{
          maxHeight: 500,
          overflowY: 'auto',
          border: '1px solid #ccc',
          borderRadius: 8,
          padding: 12,
          background: '#fafafa'
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {trackers.map((tracker, i) => (
                <li key={i} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                <div><b>Opis workouta:</b> {tracker.workoutDescription}</div>
                <div><b>Lat:</b> {tracker.lat} <b>Long:</b> {tracker.long}</div>
                <div><b>Ping čas:</b> {tracker.pingTime ? new Date(tracker.pingTime).toLocaleString() : '-'}</div>
                </li>
            ))}
            </ul>
        </div>
      </div>
    </div>
  );
}