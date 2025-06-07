import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../constants/ip'; // ali tvoj URL
import { Alert } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const alertVisible = useRef(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (user && user._id) {
          const res = await axios.get(`${BASE_URL}/users/${user._id}`);
          if (res.data && res.data['2faInProgress'] && !alertVisible.current) {
            alertVisible.current = true;
            Alert.alert(
              'Approve login',
              'Are you trying to log in on web?',
              [
                {
                  text: 'Approve',
                  onPress: async () => {
                    await axios.post(`${BASE_URL}/users/confirm-login`, { userId: user._id });
                    Alert.alert('Login approved!');
                    alertVisible.current = false;
                  }
                },
                {
                  text: 'Decline',
                  style: 'cancel',
                  onPress: async() => {
                    await axios.post(`${BASE_URL}/users/decline-login`, { userId: user._id });
                    alertVisible.current = false;
                  }
                }
              ],
              { cancelable: false }
            );
          }
        }
      } catch (err) {
        // Po želji logiraj napako
      }
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  /*useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      if (notification.request.content.data?.type === 'login_confirmation') {
        Alert.alert(
          'Potrditev prijave',
          'Ali želite potrditi prijavo?',
          [
            {
              text: 'Potrdi',
              onPress: async () => {
                // Pošlji potrditev na backend
                const userStr = await AsyncStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;
                if (user && user._id) {
                  await axios.post(`${BASE_URL}/users/confirm-login`, { userId: user._id });
                  Alert.alert('Prijava potrjena!');
                }
              }
            },
            { text: 'Prekliči', style: 'cancel' }
          ]
        );
      }
    });
    return () => subscription.remove();
  }, []);*/

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="verify" /> {/* Make sure verify.tsx exists */}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
