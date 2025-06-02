import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Alert } from 'react-native';
import { BASE_URL } from '../../constants/ip';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const workoutTypes = [
  { label: 'Run', value: 'run' },
  { label: 'Walk', value: 'walk' },
  { label: 'Bike', value: 'bike' },
  { label: 'Fitness', value: 'fitness' },
];

export default function WorkoutScreen() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check for active workout on mount
  useEffect(() => {
    const checkActiveWorkout = async () => {
      const workoutStr = await AsyncStorage.getItem('activeWorkout');
      if (workoutStr) {
        const workout = JSON.parse(workoutStr);
        if (workout.workoutId && workout.startTime && !workout.stopped) {
          router.replace({
            pathname: '/workoutActiveScreen',
            params: {
              workoutId: workout.workoutId,
              startTime: workout.startTime,
            },
          });
        }
      }
    };
    checkActiveWorkout();
  }, []);

  const startWorkout = async () => {
    if (!selectedType) {
      Alert.alert('Please select a workout type');
      return;
    }
    setLoading(true);
    try {
      const workoutData = {
        name: selectedType,
        description: `${selectedType} workout`,
      };
      const response = await fetch(`${BASE_URL}/workouts/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(workoutData),
      });
      const data = await response.json();
      if (response.ok && data.workout && data.workout._id && data.workout.startTime) {
        await AsyncStorage.setItem('activeWorkout', JSON.stringify({
          workoutId: data.workout._id,
          startTime: data.workout.startTime,
          stopped: false,
        }));
        router.replace({
          pathname: '/workoutActiveScreen',
          params: {
            workoutId: data.workout._id,
            startTime: data.workout.startTime,
          },
        });
      } else {
        Alert.alert('Error', data.message || 'Could not start workout. Make sure you are logged in.');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Workout Type</Text>
      <View style={styles.typeContainer}>
        {workoutTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeButton,
              selectedType === type.value && styles.selectedTypeButton,
            ]}
            onPress={() => setSelectedType(type.value)}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedType === type.value && styles.selectedTypeButtonText,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button
        title={loading ? 'Starting...' : 'Start Workout'}
        onPress={startWorkout}
        disabled={!selectedType || loading}
        color="green"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 24 },
  typeContainer: { flexDirection: 'row', marginBottom: 32 },
  typeButton: {
    padding: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  selectedTypeButton: {
    backgroundColor: '#0a7ea4',
  },
  typeButtonText: {
    fontSize: 18,
    color: '#333',
  },
  selectedTypeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});