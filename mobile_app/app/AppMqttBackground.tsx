import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mqtt from 'mqtt';
import { MQTT_BROKER } from '../constants/ip';

export default function AppMqttBackground() {
  useEffect(() => {
    let client: mqtt.MqttClient | null = null;

    const connectMqtt = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      client = mqtt.connect(MQTT_BROKER);

      client.on('connect', () => {
        client?.subscribe('status/areYouAlive');
      });

      client.on('message', (topic, message) => {
        if (topic === 'status/areYouAlive') {
          client?.publish('status/iAmAlive', JSON.stringify({ id: userId }));
        }
      });
    };

    connectMqtt();

    return () => {
      client?.end();
    };
  }, []);

  return null;
}