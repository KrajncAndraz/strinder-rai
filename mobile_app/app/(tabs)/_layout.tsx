import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppMqttBackground from '../AppMqttBackground';

export default function Layout() {
  return (
    <>
      <AppMqttBackground />
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#ccc',
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            if (route.name === 'index') {
              iconName = 'home';
            } else if (route.name === 'workout') {
              iconName = 'barbell';
            } else if (route.name === 'profile') {
              iconName = 'person';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="workout" options={{ title: 'Workout' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    </>
  );
}
