import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../constants/ip';
import { Modal, TouchableOpacity, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const alertVisible = useRef(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (user && user._id && pathname !== '/setup/verify') {
          setUserId(user._id);
          const res = await axios.get(`${BASE_URL}/users/${user._id}`);
          if (res.data && res.data['2faInProgress'] && !alertVisible.current) {
            alertVisible.current = true;
            setShow2FAModal(true);
          }
        }
      } catch (err) {
        // Po želji logiraj napako
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [pathname]);

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="verify" />
      </Stack>
      <StatusBar style="auto" />

      {/* Custom 2FA Modal */}
      <Modal
        visible={show2FAModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Approve login</Text>
            <Text style={styles.modalText}>
              Are you trying to log in on web?
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#2196F3', flex: 1 }]}
                disabled={modalLoading}
                onPress={() => {
                  setShow2FAModal(false);
                  alertVisible.current = false;
                  router.push('/setup/verify');
                }}
              >
                <Text style={styles.buttonText}>Verify face</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#f44336', flex: 1 }]}
                disabled={modalLoading}
                onPress={async () => {
                  setModalLoading(true);
                  if (userId) {
                    await axios.post(`${BASE_URL}/users/decline-login`, { userId });
                  }
                  setShow2FAModal(false);
                  alertVisible.current = false;
                  setModalLoading(false);
                }}
              >
                {modalLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Decline</Text>
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.modalButton, styles.approveButton]}
              disabled={modalLoading}
              onPress={async () => {
                setModalLoading(true);
                if (userId) {
                  await axios.post(`${BASE_URL}/users/confirm-login`, { userId });
                }
                setShow2FAModal(false);
                alertVisible.current = false;
                setModalLoading(false);
              }}
            >
              {modalLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Approve</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 300,
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center'
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 8
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  approveButton: {
  backgroundColor: '#888',
  alignSelf: 'stretch',
  marginHorizontal: 0,
  marginTop: 16,
},
});