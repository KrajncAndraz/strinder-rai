const mqtt = require('mqtt');
const Workout = require('../models/workoutModel'); 
const Statistics = require('../models/statisticsModel');

// const MQTT_BROKER = 'mqtt://172.20.10.2:1883';
const MQTT_BROKER = 'mqtt://http://localhost:1883'; 

const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
  console.log('MQTT backend connected');
  client.subscribe('workouts/location', (err) => {
    if (!err) {
      console.log('Subscribed to workouts/location');
    } else {
      console.error('MQTT subscribe error:', err);
    }
  });
  client.subscribe('statistics/login', (err) => {
    if (!err) {
      console.log('Subscribed to statistics/login');
    } else {
      console.error('MQTT subscribe error:', err);
    }
  });
});

client.on('message', async (topic, message) => {
  if (topic === 'workouts/location') {
    try {
      const { workoutId, latitude, longitude } = JSON.parse(message.toString());
      if (!workoutId || !latitude || !longitude) return;

      await Workout.findByIdAndUpdate(
        workoutId,
        { $push: { trackers: { lat: latitude, long: longitude, pingTime: new Date() } } }
      );
      console.log(`Updated workout ${workoutId} with new location`);
    } catch (err) {
      console.error('Failed to update workout:', err);
    }
  }
  else if (topic === 'statistics/login') {
    try {
    const { loginTime, device } = JSON.parse(message.toString());
    const stat = await Statistics.create({ loginTime, device });
    console.log('Login statistics saved');
  } catch (err) {
    console.error('Error saving statistics:', err);
  }
  }
});
