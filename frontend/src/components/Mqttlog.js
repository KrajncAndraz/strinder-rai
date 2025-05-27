import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import { MQTT_IP } from '../constants/mqtt_ip'; 


const MQTT_BROKER = `ws://${MQTT_IP}:9001`;

export default function MqttLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
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
      <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>MQTT Log</h2>
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {logs.map((log, index) => (
          <div key={index} style={{ fontSize: 14, margin: '2px 0' }}>{log}</div>
        ))}
      </div>
    </div>
  );
}