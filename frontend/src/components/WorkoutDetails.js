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
                    setError(errorData.error || 'Napaka pri pridobivanju workouta.');
                    return;
                }

                const data = await res.json();
                setWorkout(data);
            } catch (err) {
                console.error('Napaka pri pridobivanju workouta:', err);
                setError('Napaka pri pridobivanju workouta.');
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
                setError(errorData.error || 'Napaka pri dodajanju trackerja.');
                return;
            }

            const updatedWorkout = await res.json();
            setWorkout(updatedWorkout); // Posodobi workout z novim trackerjem
            setLat('');
            setLong('');
        } catch (err) {
            console.error('Napaka pri dodajanju trackerja:', err);
            setError('Napaka pri dodajanju trackerja.');
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
                setError(errorData.error || 'Napaka pri brisanju trackerja.');
                return;
            }

            const updatedWorkout = await res.json();
            setWorkout(updatedWorkout); // Posodobi workout brez izbrisanega trackerja
        } catch (err) {
            console.error('Napaka pri brisanju trackerja:', err);
            setError('Napaka pri brisanju trackerja.');
        }
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!workout) {
        return <p>Nalaganje podrobnosti workouta...</p>;
    }

    return (
        <div style={{ margin: '5%' }}>
            <h2>Podrobnosti Workouta</h2>
            <p>
                <strong>Ime:</strong> {workout.name}
            </p>
            <p>
                <strong>Opis:</strong> {workout.description}
            </p>
            <p>
                <strong>Začetni čas:</strong> {new Date(workout.startTime).toLocaleString()}
            </p>

            <h3>Trackerji</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', width: '80%', marginLeft: '10%' }}>
                <ul>
                    {workout.trackers.map((tracker) => (
                        <li key={tracker._id}>
                            <p>
                                <strong>Lat:</strong> {tracker.lat}, <strong>Long:</strong> {tracker.long}
                            </p>
                            <p>
                                <strong>Čas:</strong> {new Date(tracker.pingTime).toLocaleString()}
                            </p>
                            <button onClick={() => handleDeleteTracker(tracker._id)}>Izbriši</button>
                            <hr />
                        </li>
                    ))}
                </ul>
            </div>

            <h3>Dodaj Tracker</h3>
            <form onSubmit={handleAddTracker}>
                <div>
                    <label>Lat:</label>
                    <input
                        type="text"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Long:</label>
                    <input
                        type="text"
                        value={long}
                        onChange={(e) => setLong(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Dodaj Tracker</button>
            </form>

            <WorkoutMap trackers={workout.trackers} />
        </div>
    );
}

export default WorkoutDetails;