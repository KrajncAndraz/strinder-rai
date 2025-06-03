import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

export default function StatisticsPage() {
  const [devices, setDevices] = useState([]);
  const [trackers, setTrackers] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [pieData, setPieData] = useState({ labels: [], datasets: [] });

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

  useEffect(() => {
    console.log('trackers:', trackers);
    // Pridobi zadnjih 7 dni
    const days = [];
    const counts = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString());
      counts.push(0);
    }
    // Preštej trackerje po dnevih
    trackers.forEach(tracker => {
      if (tracker.pingTime) {
        const date = new Date(tracker.pingTime).toLocaleDateString();
        const idx = days.indexOf(date);
        if (idx !== -1) counts[idx]++;
      }
    });
    setChartData({ 
      labels: days, 
      datasets: [
        {
          label: 'Število trackerjev',
          data: counts,
          backgroundColor: 'rgba(75,192,192,0.6)',
        }
      ]
    });
  }, [trackers]);

  useEffect(() => {
    // Preštej modele naprav
    const brandCounts = {};
    devices.forEach(dev => {
      const brand = dev.device?.brand || 'Neznano';
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });
    const labels = Object.keys(brandCounts);
    const data = Object.values(brandCounts);
    setPieData({
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'
          ],
        },
      ],
    });
  }, [devices]);

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
          <div style={{ marginTop: 32, height: '50%' }}>
          <h3>Razmerje modelov naprav</h3>
          {pieData.labels.length > 0 && (
            <Pie
              data={pieData}
              options={{
                plugins: {
                  legend: { position: 'bottom' },
                },
              }}
              height={200}
            />
          )}
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
        {chartData.labels.length > 0 && chartData.datasets.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3>Število trackerjev po dnevih (zadnjih 7 dni)</h3>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: { beginAtZero: true, precision: 0 },
              },
            }}
            height={200}
          />
        </div>
      )}
      </div>
    </div>
  );
}