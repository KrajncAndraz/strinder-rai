import React, { useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';
import '../styles/Mqtt.css'
import { MQTT_BROKER } from '../constants/mqtt_ip'; // Assuming you have a config file for the broker URL

//const MQTT_BROKER = 'ws://172.20.10.2:9001';

export default function MqttLog() {
  const [logs, setLogs] = useState([]);
  const [aliveCount, setAliveCount] = useState(0);
  const lastAliveRef = useRef({}); // { id: timestamp }

  useEffect(() => {

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
    <div className="mqtt_logs">
      <h2>MQTT Log</h2>
       <div>
        Aktivnih (zadnjih 5s): {aliveCount}
      </div>
      <div>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
}