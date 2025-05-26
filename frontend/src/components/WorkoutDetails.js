import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import WorkoutMap from './WorkoutMap';

function WorkoutDetails() {
    const { workoutId } = useParams(); //geta ID workouta iz url-ja
    const [workout, setWorkout] = useState(null);
    const [error, setError] = useState('');
    const [lat, setLat] = useState('');
    const [long, setLong] = useState('');

    useEffect(() => {
        async function fetchWorkout() {
            try {
                const res = await fetch(`http://localhost:3001/workouts/view/${workoutId}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    setError(errorData.error || 'Error fetching workout.');
                    return;
                }

                const data = await res.json();
                setWorkout(data);
            } catch (err) {
                console.error('Error fetching workout:', err);
                setError('Error fetching workout.');
            }
        }

        fetchWorkout();
    }, [workoutId]);

    async function handleAddTracker(e) {
        e.preventDefault();

        const trackerData = {
            lat,
            long,
            pingTime: new Date().toISOString(), // Avtomatsko dodaj trenutni čas
        };

        try {
            const res = await fetch(`http://localhost:3001/workouts/${workoutId}/trackers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(trackerData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.error || 'Error adding tracker.');
                return;
            }

            const updatedWorkout = await res.json();
            setWorkout(updatedWorkout); // Posodobi workout z novim trackerjem
            setLat('');
            setLong('');
        } catch (err) {
            console.error('Error adding tracker:', err);
            setError('Error adding tracker.');
        }
    }

    async function handleDeleteTracker(trackerId) {
        try {
            const res = await fetch(`http://localhost:3001/workouts/${workoutId}/trackers/${trackerId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.error || 'Error deleting tracker.');
                return;
            }

            const updatedWorkout = await res.json();
            setWorkout(updatedWorkout); // Posodobi workout brez izbrisanega trackerja
        } catch (err) {
            console.error('Error deleting tracker:', err);
            setError('Error deleting tracker.');
        }
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!workout) {
        return <p>Loading workout details...</p>;
    }

    return (
        <div className="workout-details">
            <h2>Workout details</h2>
            <p>
                <strong>Name:</strong> {workout.name}
            </p>
            <p>
                <strong>Description:</strong> {workout.description}
            </p>
            <p>
                <strong>Started at:</strong> {new Date(workout.startTime).toLocaleString()}
            </p>

            <br />
            <h3>Trackers</h3>
            <div>
                <ul>
                    {workout.trackers.map((tracker) => (
                        <li key={tracker._id}>
                            <p>
                                <strong>Lat:</strong> {tracker.lat}, <strong>Long:</strong> {tracker.long}
                            </p>
                            <p>
                                <strong>Time:</strong> {new Date(tracker.pingTime).toLocaleString()}
                            </p>
                            <button onClick={() => handleDeleteTracker(tracker._id)}>Delete</button>
                            <hr />
                        </li>
                    ))}
                </ul>
            </div>

            <br />
            <h3 className="centered">Add Tracker</h3>
            <form onSubmit={handleAddTracker}>
                <div>
                    <input
                        type="text"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        required
                        placeholder="Latitude"
                    />
                </div>
                <div>
                    <input
                        type="text"
                        value={long}
                        onChange={(e) => setLong(e.target.value)}
                        required
                        placeholder="Longitude"
                    />
                </div>
                <button type="submit">Add Tracker</button>
            </form>

            <WorkoutMap trackers={workout.trackers} />
        </div>
    );
}

export default WorkoutDetails;