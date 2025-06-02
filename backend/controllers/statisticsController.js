const Statistics = require('../models/statisticsModel');
const Workout = require('../models/workoutModel');

exports.getDeviceStatistics = async (req, res) => {
  try {
    const stats = await Statistics.find().sort({ loginTime: -1 }).limit(100);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching device statistics', error: err });
  }
};

exports.getAllTrackers = async (req, res) => {
  try {
    // Pridobi vse trackerje iz vseh workoutov
    const workouts = await Workout.find({}, { trackers: 1, description: 1});
    // Razširi v en seznam z dodatnimi podatki o workoutu
    const allTrackers = [];
    workouts.forEach(workout => {
      (workout.trackers || []).forEach(tracker => {
        allTrackers.push({
          workoutDescription: workout.description,
          lat: tracker.lat,
          long: tracker.long,
          pingTime: tracker.pingTime
        });
      });
    });
    // Zadnjih 100 trackerjev
    allTrackers.sort((a, b) => new Date(b.pingTime) - new Date(a.pingTime));
    res.json(allTrackers.slice(0, 100));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trackers', error: err });
  }
};