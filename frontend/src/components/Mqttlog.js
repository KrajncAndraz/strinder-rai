import React, { useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';

const MQTT_BROKER = 'ws://172.20.10.2:9001';

export default function MqttLog() {
  const [logs, setLogs] = useState([]);
  const [aliveCount, setAliveCount] = useState(0);
  const lastAliveRef = useRef({}); // { id: timestamp }

  useEffect(() => {
    // Inicializiraj client ZNOTRAJ useEffect!
    const client = mqtt.connect(MQTT_BROKER);

    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      client.subscribe('#');
    });

    client.on('message', (topic, message) => {
      const logEntry = `[${new Date().toLocaleTimeString()}] ${topic}: ${message.toString()}`;
      setLogs(prev => [logEntry, ...prev.slice(0, 100)]);

      if (topic === 'status/iAmAlive') {
        try {
          const data = JSON.parse(message.toString());
          if (data.id) {
            lastAliveRef.current[data.id] = Date.now();
          }
        } catch {}
      }
    });

    client.on('error', (err) => {
      console.error('MQTT Error:', err);
    });

    const pingInterval = setInterval(() => {
      client.publish('status/areYouAlive', JSON.stringify({ time: Date.now() }));
    }, 5000);

    const aliveInterval = setInterval(() => {
      const now = Date.now();
      const activeIds = Object.values(lastAliveRef.current).filter(
        t => now - t < 5000
      );
      setAliveCount(activeIds.length);

      // Po želji: odstrani stare id-je (več kot 15 sekund)
      Object.keys(lastAliveRef.current).forEach(id => {
        if (now - lastAliveRef.current[id] > 15000) {
          delete lastAliveRef.current[id];
        }
      });
    }, 1000);

    return () => {
      client.end();
      clearInterval(pingInterval);
      clearInterval(aliveInterval);
    };
  }, []);

  return (
    <div style={{ padding: 16, backgroundColor: '#fff', height: '100%' }}>
      <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: 'red' }}>MQTT Log</h2>
       <div style={{ marginBottom: 8, color: 'green' }}>
        Aktivnih (zadnjih 5s): {aliveCount}
      </div>
      <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
        {logs.map((log, index) => (
          <div key={index} style={{ fontSize: 14, margin: '2px 0', color: 'black' }}>{log}</div>
        ))}
      </div>
    </div>
  );
}