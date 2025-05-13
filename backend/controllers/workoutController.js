const Workout = require('../models/workoutModel');
const User = require('../models/userModel');

module.exports = {
    /**
     * Dodaj nov workout
     */
    addWorkout: async (req, res) => {
        try {
            const { name, description, startTime } = req.body;

            // Ustvarimo nov workout
            const newWorkout = new Workout({
                name,
                description,
                startTime,
                createdBy: req.session.userId, // ID trenutnega uporabnika // Fiksna kategorija 'tek' (zamenjaj z ID kategorije iz baze)
            });

            await newWorkout.save();

            // Populiramo `createdBy` z uporabniškimi podatki
            const populatedWorkout = await newWorkout.populate('createdBy', 'username');

            // Pošlji shranjen workout nazaj kot odgovor
            res.status(201).json({ message: 'Workout uspešno dodan!', workout: populatedWorkout });
        } catch (err) {
            console.error('Napaka pri dodajanju workouta:', err);
            res.status(500).json({ error: 'Napaka pri dodajanju workouta.' });
        }
    },

    /**
     * Pridobi vse workoute
     */
    getAllWorkouts: async (req, res) => {
        try {
            const workouts = await Workout.find()
                .populate('createdBy', 'username') // Pridobi samo `username` iz povezane zbirke
                .sort({ startTime: -1 }); // Razvrsti po začetnem času (najnovejši najprej)

            res.status(200).json(workouts || []); // Če ni workoutov, vrni prazen array
        } catch (err) {
            console.error('Napaka pri pridobivanju workoutov:', err);
            res.status(500).json({ error: 'Napaka pri pridobivanju workoutov.', workouts: [] });
        }
    },

    /**
     * Pridobi workoute trenutnega uporabnika
     */
    getUserWorkouts: async (req, res) => {
        try {
            const userId = req.session.userId;

            // Pridobimo workoute, ki jih je ustvaril trenutni uporabnik
            const workouts = await Workout.find({ createdBy: userId })
                .sort({ startTime: -1 }); // Razvrsti po začetnem času (najnovejši najprej)

            res.status(200).json(workouts || []); // Če ni workoutov, vrni prazen array
        } catch (err) {
            console.error('Napaka pri pridobivanju workoutov uporabnika:', err);
            res.status(500).json({ error: 'Napaka pri pridobivanju workoutov uporabnika.', workouts: [] });
        }
    },

    getWorkoutById: async (req, res) => {
        try {
            const { workoutId } = req.params;

            const workout = await Workout.findById(workoutId);

            if (!workout) {
                return res.status(404).json({ error: 'Workout ne obstaja.' });
            }

            res.status(200).json(workout);
        } catch (err) {
            console.error('Napaka pri pridobivanju workouta:', err);
            res.status(500).json({ error: 'Napaka pri pridobivanju workouta.' });
        }
    },

    addTracker: async (req, res) => {
        try {
            const { workoutId } = req.params;
            const { lat, long, pingTime } = req.body;

            const workout = await Workout.findById(workoutId);
            if (!workout) {
                return res.status(404).json({ error: 'Workout ne obstaja.' });
            }

            workout.trackers.push({ lat, long, pingTime });
            await workout.save();

            res.status(200).json(workout);
        } catch (err) {
            console.error('Napaka pri dodajanju trackerja:', err);
            res.status(500).json({ error: 'Napaka pri dodajanju trackerja.' });
        }
    },

    // Izbriši tracker
    deleteTracker: async (req, res) => {
        try {
            const { workoutId, trackerId } = req.params;

            const workout = await Workout.findById(workoutId);
            if (!workout) {
                return res.status(404).json({ error: 'Workout ne obstaja.' });
            }

            workout.trackers = workout.trackers.filter((tracker) => tracker._id.toString() !== trackerId);
            await workout.save();

            res.status(200).json(workout);
        } catch (err) {
            console.error('Napaka pri brisanju trackerja:', err);
            res.status(500).json({ error: 'Napaka pri brisanju trackerja.' });
        }
    },
};