import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Naslov */}
      <Text style={styles.title}>Welcome to Strinder!</Text>
      <Text style={styles.subtitle}>Track your workouts. Meet new friends. Stay secure.</Text>

      {/* Glavne funkcionalnosti */}
      <Text style={styles.sectionTitle}>Main Features</Text>
      <View style={styles.featuresContainer}>
        <View style={styles.featureCard}>
          <Image source={require('../../assets/images/GPS.jpg')} style={styles.featureImg} resizeMode="contain" />
          <Text style={styles.featureTitle}>GPS Workout Tracking</Text>
          <Text style={styles.featureDesc}>
            Track your runs, hikes, and rides in real time using your phone's GPS. Never miss a step or a turn!
          </Text>
        </View>
        <View style={styles.featureCard}>
          <Image source={require('../../assets/images/Map.png')} style={styles.featureImg} resizeMode="contain" />
          <Text style={styles.featureTitle}>Path Tracing with OpenStreetMap</Text>
          <Text style={styles.featureDesc}>
            See your workout path traced on a beautiful map. Analyze your route and share it with friends.
          </Text>
        </View>
        <View style={styles.featureCard}>
          <Image source={require('../../assets/images/Friends.png')} style={styles.featureImg} resizeMode="contain" />
          <Text style={styles.featureTitle}>Add & Message Friends</Text>
          <Text style={styles.featureDesc}>
            Connect with classmates and new friends. Send messages, share workouts, and motivate each other!
          </Text>
        </View>
        <View style={styles.featureCard}>
          <Image source={require('../../assets/images/2FA.png')} style={styles.featureImg} resizeMode="contain" />
          <Text style={styles.featureTitle}>Face 2FA Security</Text>
          <Text style={styles.featureDesc}>
            Keep your account safe with face-based two-factor authentication. Your face is your key!
          </Text>
        </View>
      </View>

      {/* Galerija */}
      <Text style={styles.sectionTitle}>Get Inspired</Text>
      <View style={styles.galleryRow}>
        <Image source={require('../../assets/images/run.jpg')} style={styles.galleryImg} />
        <Image source={require('../../assets/images/hike.png')} style={styles.galleryImg} />
        <Image source={require('../../assets/images/cycle.webp')} style={styles.galleryImg} />
      </View>

      {/* Promo/Stats */}
      <Text style={styles.sectionTitle}>Why Strinder?</Text>
      <View style={styles.statsList}>
        <Text style={styles.statItem}>🏃 Over <Text style={styles.bold}>500km</Text> tracked by students this semester!</Text>
        <Text style={styles.statItem}>🤝 <Text style={styles.bold}>100+</Text> new friendships made through the app!</Text>
        <Text style={styles.statItem}>🔒 <Text style={styles.bold}>Face 2FA</Text> keeps your data secure.</Text>
        <Text style={styles.statItem}>🌍 Join a growing community of active students!</Text>
      </View>

      {/* Testimonials */}
      <Text style={styles.sectionTitle}>What our users say</Text>
      <View style={styles.testimonial}>
        <Text style={styles.quote}>
          "Strinder made my morning runs so much more fun! I love seeing my route on the map and chatting with friends after a workout."
        </Text>
        <Text style={styles.author}>- Ana, student</Text>
      </View>
      <View style={styles.testimonial}>
        <Text style={styles.quote}>
          "The face login is super cool and makes me feel safe. Highly recommend for anyone who wants to track their progress!"
        </Text>
        <Text style={styles.author}>- Luka, student</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 6,
    color: '#2d2d2d',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 28,
    marginBottom: 10,
    color: '#1a73e8',
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 10,
  },
  featureCard: {
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  featureImg: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
  },
  galleryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
    gap: 8,
  },
  galleryImg: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  statsList: {
    marginBottom: 18,
    width: '100%',
  },
  statItem: {
    fontSize: 15,
    marginBottom: 6,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  testimonial: {
    backgroundColor: '#f0f4fa',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    width: '100%',
  },
  quote: {
    fontStyle: 'italic',
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
  },
  author: {
    textAlign: 'right',
    color: '#1a73e8',
    fontWeight: 'bold',
  },
});