import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AddWorkout() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [workouts, setWorkouts] = useState([]);
    const navigate = useNavigate(); // Za preusmeritev na drugo stran

    // Pridobi vse workoute ob nalaganju komponente
    useEffect(() => {
        async function fetchWorkouts() {
            try {
                const res = await fetch('http://localhost:3001/workouts', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await res.json();
                setWorkouts(data);
            } catch (err) {
                console.error('Napaka pri pridobivanju workoutov:', err);
                setError('Napaka pri pridobivanju workoutov.');
            }
        }

        fetchWorkouts();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage('');
        setError('');

        const workoutData = {
            name,
            description,
            startTime: new Date().toISOString(), // Avtomatsko nastavi trenutni čas
        };

        try {
            const res = await fetch('http://localhost:3001/workouts/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(workoutData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.error || 'Napaka pri dodajanju workouta.');
                return;
            }

            const data = await res.json();
            setMessage(data.message);
            setName('');
            setDescription('');

            // Posodobi seznam workoutov
            setWorkouts((prevWorkouts) => [...prevWorkouts, data.workout]);
        } catch (err) {
            console.error('Napaka pri dodajanju workouta:', err);
            setError('Napaka pri dodajanju workouta.');
        }
    }

    return (
        <div>
            <h2>Dodaj Workout</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Ime:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Opis:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Dodaj Workout</button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h2>Seznam Workoutov</h2>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                <ul>
                    {workouts.map((workout) => (
                        <li key={workout._id}>
                            <p>
                                <strong>Ime:</strong> {workout.name}
                            </p>
                            <p>
                                <strong>Opis:</strong> {workout.description}
                            </p>
                            <p>
                                <strong>Začetni čas:</strong> {new Date(workout.startTime).toLocaleString()}
                            </p>
                            <button onClick={() => navigate(`/workouts/view/${workout._id}`)}>
                                Poglej Workout
                            </button>
                            <hr />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default AddWorkout;