import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, MQTT_BROKER } from '../../constants/ip';
import * as Device from 'expo-device';
import mqtt from 'mqtt';
import { useEffect } from 'react';

const router = useRouter();

const URL = `${BASE_URL}/users`;

export default function Profile() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${URL}/login`, { username, password }, { withCredentials: true });
      const loggedInUser = res.data;
      await AsyncStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      // --- MQTT: Pošlji podatke o napravi ---
      const client = mqtt.connect(MQTT_BROKER);
      client.on('connect', () => {
        const deviceData = {
          loginTime: new Date().toISOString(),
          device: {
            brand: Device.brand,
            modelName: Device.modelName,
            osName: Device.osName,
            osVersion: Device.osVersion,
            manufacturer: Device.manufacturer,
          },
        };
        client.publish('statistics/login', JSON.stringify(deviceData), () => {
          client.end();
        });
      });

      if (!loggedInUser.has2FA) {
        router.push({
          pathname: '/setup/face',
          params: { userId: loggedInUser._id }
        });
      }
    } catch (error: any) {
      console.log(error.response?.data || error.message);
      Alert.alert('Login failed', error.response?.data?.message || 'Check credentials');
    }
  };

  const handleRegister = async () => {
    try {
      const res = await axios.post(`${URL}`, { username, password, email });
      Alert.alert('Success', 'Registered successfully. You can now log in.');
      setIsLogin(true);
    } catch (error: any) {
      console.log(error.response?.data || error.message);
      Alert.alert('Register failed', error.response?.data?.message || 'Error occurred');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${URL}/logout`, { withCredentials: true });
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      Alert.alert('Logout failed');
    }
  };

  const check2FAStatus = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User ID not found');
        return;
      }
      const res = await axios.get(`${BASE_URL}/users/${user._id}`);
      if (res.data && res.data['2faInProgress']) {
        router.push({ pathname: '/setup/verify', params: { userId } });
      } else {
        Alert.alert('No 2FA in progress');
      }
    } catch (error) {
      Alert.alert('Failed to check 2FA status');
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    };
    loadUser();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!user ? (
        <>
          <Text style={styles.title}>{isLogin ? 'Login' : 'Register'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          )}

          <Button
            title={isLogin ? 'Login' : 'Register'}
            onPress={isLogin ? handleLogin : handleRegister}
          />

          <View style={{ marginTop: 10 }}>
            <Button
              title={isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
              onPress={() => setIsLogin(!isLogin)}
            />
          </View>
        </>
      ) : (
        <View style={styles.profile}>
          <Text style={styles.title}>Welcome, {user.username}!</Text>
          <Text>Email: {user.email}</Text>
          <Button title="Logout" onPress={handleLogout} />
          <View style={styles.statusRow}>
            <View style={styles.greenDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
          <Text style={styles.deviceLabel}>Current device:</Text>
          <Text style={styles.deviceModel}>{ Device.brand + ' ' + Device.deviceName || 'Unknown device'}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 100,
    flexGrow: 1,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#fff'
  },
  profile: {
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  greenDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34c759',
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#34c759',
    fontWeight: 'bold',
  },
  deviceLabel: {
    marginTop: 24,
    fontSize: 15,
    color: '#888',
    fontWeight: 'bold',
  },
  deviceModel: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
  },
});
