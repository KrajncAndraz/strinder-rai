import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function FaceSetupScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [permissionStatus, requestPermission] = ImagePicker.useMediaLibraryPermissions();
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();

  useEffect(() => {
    if (!permissionStatus?.granted) {
      requestPermission();
    }
  }, []);

  const pickImage = async () => {
    if (images.length >= 5) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0].base64) {
      setImages([...images, result.assets[0].base64]);
    }
  };

  const submitImages = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:3001/users/${userId}/set-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', '2FA setup completed');
        router.replace('/');
      } else {
        console.warn('Backend error:', data);
        Alert.alert('Error', data.message || 'Failed to submit images');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Network error');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Select 5 face images:</Text>
      <View style={styles.previewContainer}>
        {images.map((base64, idx) => (
          <Image
            key={idx}
            source={{ uri: `data:image/jpeg;base64,${base64}` }}
            style={styles.image}
          />
        ))}
      </View>

      <Button
        title={`Pick Image (${images.length}/5)`}
        onPress={pickImage}
        disabled={images.length >= 5}
      />

      {images.length === 5 && (
        <Button title="Submit Photos" onPress={submitImages} color="green" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  image: {
    width: 70,
    height: 70,
    margin: 5,
    borderRadius: 6,
  },
});
