import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as Video from 'expo-av';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BASE_URL } from '../../constants/ip'; 

export default function FaceSetupScreen() {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [frames, setFrames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const recordVideo = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission required');
      return;
    }
    Alert.alert(
      'Navodila',
      'Obraz drži v sredini zaslona, posnemi video svojega obraza v dobri svetlobi. Video naj bo dolg vsaj 5 sekund.',
      [
        {
          text: 'OK',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Videos,
              quality: 0.7,
            });
            if (!result.canceled && result.assets?.[0].uri) {
              setVideoUri(result.assets[0].uri);
              extractFrames(result.assets[0].uri);
            }
          },
        },
      ]
    );
  };

  const extractFrames = async (uri: string) => {
    setLoading(true);
    try {
      // Get video duration using expo-av
      const { sound, status } = await Video.Audio.Sound.createAsync({ uri });
      let duration = 5; // fallback to 5s if duration not available
      if (status.isLoaded && 'durationMillis' in status && typeof status.durationMillis === 'number') {
        duration = status.durationMillis / 1000;
      }
      await sound.unloadAsync();
      const fps = 3;
      const frameTimes: number[] = [];
      for (let t = 0; t < duration; t += 1 / fps) {
        frameTimes.push(t * 1000); // milliseconds
      }
      const extractedFrames: string[] = [];
      for (const time of frameTimes) {
        const { uri: frameUri } = await VideoThumbnails.getThumbnailAsync(uri, { time });
        // Convert frameUri to base64
        const base64 = await uriToBase64(frameUri);
        extractedFrames.push(base64);
      }
      setFrames(extractedFrames);
    } catch (e) {
      Alert.alert('Error extracting frames');
    }
    setLoading(false);
  };

  // Helper to convert image uri to base64
  const uriToBase64 = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const submitFrames = async () => {
    if (frames.length === 0) {
      Alert.alert('No frames to submit');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}/set-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: frames }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', '2FA setup completed');
        router.replace('/');
      } else {
        Alert.alert('Error', data.message || 'Failed to submit frames');
      }
    } catch (err) {
      Alert.alert('Network error');
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={{ marginBottom: 10, fontWeight: 'bold', textAlign: 'center' }}>
        Snemaj video svojega obraza za nastavitev 2FA
      </Text>
      
      <Button title="Začni snemanje" onPress={recordVideo} />
      {frames.length > 0 && (
        <>
          <View style={{ marginVertical: 16 }}>
            <Button title="Pošlji slike" onPress={submitFrames} color="green" />
          </View>
          <Text>Izvlečeni okvirji:</Text>
          <View style={styles.previewContainer}>
            {frames.map((base64, idx) => (
              <Image
                key={idx}
                source={{ uri: `data:image/jpeg;base64,${base64}` }}
                style={styles.image}
              />
            ))}
          </View>
          
        </>
      )}
      {loading && <Text>Obdelujem...</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  overlayContainer: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    backgroundColor: '#eee',
    borderRadius: 16,
  },
  greenSquare: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderColor: 'green',
    borderRadius: 10,
    backgroundColor: 'transparent',
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