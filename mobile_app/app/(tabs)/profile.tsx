import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
const router = useRouter();

const BASE_URL = 'http://10.0.2.2:3001/users'; 

export default function Profile() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/login`, { username, password }, { withCredentials: true });
      const loggedInUser = res.data;
      setUser(loggedInUser);
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
      const res = await axios.post(`${BASE_URL}`, { username, password, email });
      Alert.alert('Success', 'Registered successfully. You can now log in.');
      setIsLogin(true);
    } catch (error: any) {
      console.log(error.response?.data || error.message);
      Alert.alert('Register failed', error.response?.data?.message || 'Error occurred');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${BASE_URL}/logout`, { withCredentials: true });
      setUser(null);
    } catch (error) {
      Alert.alert('Logout failed');
    }
  };
  async function registerPushToken(userId: string) {
    if (!Constants.isDevice) {
      Alert.alert('Error', 'Push notifications only work on physical devices.');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Error', 'Failed to get push notification permissions!');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    // Send the token to your backend
    await axios.post(`${BASE_URL}/savePushToken`, {
      userId,
      token,
    });
  }

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
});
