const express = require('express');
const router = express.Router();
const { addWorkout, getUserWorkouts, getWorkoutById, addTracker, deleteTracker, stopWorkout } = require('../controllers/workoutController');

function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        const err = new Error("You must be logged in to view this page");
        err.status = 401;
        return next(err);
    }
}

// Dodaj nov workout
router.post('/add', requiresLogin, addWorkout);
router.post('/stop', requiresLogin, stopWorkout);

// Pridobi workoute trenutnega uporabnika
router.get('/', requiresLogin, getUserWorkouts);

router.get('/view/:workoutId', requiresLogin, getWorkoutById);

router.post('/:workoutId/trackers', requiresLogin, addTracker);
router.delete('/:workoutId/trackers/:trackerId', requiresLogin, deleteTracker);

module.exports = router;