import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/ip'; 
const router = useRouter();

const URL = `${BASE_URL}/users`;

export default function Profile() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${URL}/login`, { username, password }, { withCredentials: true });
      const loggedInUser = res.data;
      await AsyncStorage.setItem('userId', loggedInUser._id);
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
      const res = await axios.post(`${BASE_URL}/`, { username, password, email });
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
  const check2FAStatus = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User ID not found');
        return;
      }
      const res = await axios.get(`${BASE_URL}/${userId}/check-2fa`);
      if (res.data.twoFAInProgress) {
        router.push({ pathname: '/setup/verify', params: { userId } });
      } else {
        Alert.alert('No 2FA in progress');
      }
    } catch (error) {
      Alert.alert('Failed to check 2FA status');
    }
  };

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
          <Button title="Check 2FA" onPress={check2FAStatus} />
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
