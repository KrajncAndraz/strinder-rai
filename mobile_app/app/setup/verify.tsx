import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BASE_URL } from '../../constants/ip'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Verify2FAScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  //const { userId } = useLocalSearchParams<{ userId: string }>();

  useEffect(() => {
    const fetchUserId = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserId(user._id); // ali user.id, odvisno od tvoje strukture
      }
    };
    fetchUserId();
  }, []);

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission required');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0].base64) {
      setImage(result.assets[0].base64);
    }
  };

  const submitPhoto = async () => {
    if (!image) {
      Alert.alert('Please take a photo first');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('2FA Success', data.message || 'Verification successful');
        router.replace('/(tabs)/profile');
      } else {
        Alert.alert('2FA Failed', data.message || 'Verification failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not verify 2FA');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>2FA Verification</Text>
      {image ? (
        <Image
          source={{ uri: `data:image/jpeg;base64,${image}` }}
          style={styles.image}
        />
      ) : (
        <Text>No photo taken yet.</Text>
      )}
      <Button title="Take Photo" onPress={takePhoto} />
      <Button title="Submit" onPress={submitPhoto} disabled={!image || loading} />
      {loading && <ActivityIndicator size="large" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 22, marginBottom: 16 },
  image: { width: 200, height: 200, marginVertical: 16, borderRadius: 8 },
});