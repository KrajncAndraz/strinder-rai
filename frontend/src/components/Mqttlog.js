import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';

const MQTT_BROKER = 'ws://172.20.10.2:9001';

export default function MqttLog() {
  const [logs, setLogs] = useState([]);

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
    });

    client.on('error', (err) => {
      console.error('MQTT Error:', err);
    });

    return () => {
      client.end();
    };
  }, []);

  return (
    <div style={{ padding: 16, backgroundColor: '#fff', height: '100%' }}>
      <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: 'red' }}>MQTT Log</h2>
      <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
        {logs.map((log, index) => (
          <div key={index} style={{ fontSize: 14, margin: '2px 0', color: 'black' }}>{log}</div>
        ))}
      </div>
    </div>
  );
}