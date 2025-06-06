import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from "../themeContext";

function AddWorkout() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [workouts, setWorkouts] = useState([]);
    const navigate = useNavigate(); // Za preusmeritev na drugo stran

    const { theme } = useContext(ThemeContext);
    const isLight = theme === "light";

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
                console.error('Error fetching workouts:', err);
                setError('Error fetching workouts.');
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
                setError(errorData.error || 'Error adding workout.');
                return;
            }

            const data = await res.json();
            setMessage(data.message);
            setName('');
            setDescription('');

            // Posodobi seznam workoutov
            setWorkouts((prevWorkouts) => [...prevWorkouts, data.workout]);
        } catch (err) {
            console.error('Error adding workout:', err);
            setError('Error adding workout.');
        }
    }

    return (
        <div>
            <h2>Add Workout</h2>
            <form class="fullW" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Name"
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Description"
                    onInput={e => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                />
                {message && <p style={{ color: 'green' }}>{message}</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Add Workout</button>
            </form>

            <h2>Workout list</h2>
            <div>
                <ul className="workout_list">
                    {workouts.map((workout) => (
                        <li key={workout._id} className="workout_item">
                            <p>
                                <strong>Name:</strong> {workout.name}
                            </p>
                            <p>
                                <strong>Description:</strong> {workout.description}
                            </p>
                            <p>
                                <strong>Start time:</strong> {new Date(workout.startTime).toLocaleString()}
                            </p>
                            <button onClick={() => navigate(`/workouts/view/${workout._id}`)}>
                                <img
                                    src="/Inspect.png"
                                    alt="Inspect"
                                    className={isLight ? "inspect-icon invert" : "inspect-icon"}
                                />
                                Inspect Workout
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default AddWorkout;