import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL, MQTT_BROKER } from '../constants/ip';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import mqtt from 'mqtt';



export default function WorkoutActiveScreen() {
  const { workoutId, startTime } = useLocalSearchParams<{ workoutId: string; startTime: string }>();
  const [elapsed, setElapsed] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mqttStatus, setMqttStatus] = useState<string>('Connecting...');
  const router = useRouter();

  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const mqttClient = mqtt.connect(MQTT_BROKER);

    mqttClient.on('connect', () => {
      setMqttStatus('Connected');
      console.log('MQTT connected');
    });
    mqttClient.on('error', (err: any) => {
      setMqttStatus('Error');
      console.log('MQTT error:', err);
    });
    mqttClient.on('close', () => {
      setMqttStatus('Disconnected');
      console.log('MQTT disconnected');
    });

    setClient(mqttClient);

    return () => {
      mqttClient.end();
    };
  }, []);

  // Timer for elapsed time
  useEffect(() => {
    if (stopped) return;
    const start = new Date(startTime).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, stopped]);

  // Location permission and periodic sending
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startLocationWatch = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required.');
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // 10 seconds
          distanceInterval: 0, // or set to e.g. 5 for 5 meters
        },
        (loc) => {
          setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          if (client && client.connected && !stopped) {
            const payload = JSON.stringify({
              workoutId,
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
            console.log('Publishing to MQTT:', payload);
            client.publish('workouts/location', payload);
          }
        }
      );
    };

    startLocationWatch();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [client, workoutId, stopped]);

  const formatElapsed = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const stopWorkout = async () => {
    try {
      const response = await fetch(`${BASE_URL}/workouts/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ workoutId, totalTime: elapsed }),
      });
      const data = await response.json();
      if (response.ok) {
        setStopped(true);
        await AsyncStorage.setItem('activeWorkout', JSON.stringify({
          workoutId,
          startTime,
          stopped: true,
        }));
        await AsyncStorage.removeItem('activeWorkout');
        Alert.alert('Workout Stopped', `Total time: ${formatElapsed(elapsed)}`);
        router.replace('/workout'); 
      } else {
        Alert.alert('Error', data.message || 'Could not stop workout');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error');
    }
  };


  const testMqttPublish = () => {
    if (client && client.connected) {
      const payload = JSON.stringify({ test: true, workoutId });
      console.log('Test publish:', payload);
      client.publish('workouts/location', payload);
    } else {
      console.log('MQTT client not connected');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout in Progress</Text>
      <Text>MQTT status: {mqttStatus}</Text>
      <Text>Workout ID: {workoutId}</Text>
      <Text>Started at: {new Date(startTime).toLocaleTimeString()}</Text>
      <Text style={styles.timer}>Time elapsed: {formatElapsed(elapsed)}</Text>
      {location && (
        <Text>Current location: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</Text>
      )}
      <Button title="Test MQTT Publish" onPress={testMqttPublish} color="#0a7ea4" />
      {!stopped && (
        <Button title="Stop Workout" onPress={stopWorkout} color="red" />
      )}
      {stopped && (
        <Text style={{ marginTop: 20, color: 'green', fontSize: 18 }}>
          Workout stopped! Total time: {formatElapsed(elapsed)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 24 },
  timer: { fontSize: 32, marginTop: 24, color: '#0a7ea4' },
});