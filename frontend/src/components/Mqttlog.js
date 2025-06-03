import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import '../styles/Mqtt.css'

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
    <div className="mqtt_logs">
      <h2>MQTT Log</h2>
      <div>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
}