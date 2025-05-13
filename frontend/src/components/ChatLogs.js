import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../userContext'; // Prepričaj se, da je to pravilno ime



function ChatLogs() {
    const userContext = useContext(UserContext);
    const [chatLogs, setChatLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newChatUsername, setNewChatUsername] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Hook za navigacijo

    useEffect(() => {
        async function fetchChatLogs() {
            try {
                const res = await fetch('http://localhost:3001/chat', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await res.json();
                console.log(data); // Preveri podatke
                setChatLogs(Array.isArray(data) ? data : []); // Poskrbi, da je array
                setLoading(false);
            } catch (err) {
                console.error('Error fetching chat logs:', err);
                setLoading(false);
            }
        }

        fetchChatLogs();
    }, []);

    async function handleAddChat(e) {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:3001/chat/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username: newChatUsername }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.error || 'Napaka pri dodajanju chata.');
                return;
            }

            const newChat = await res.json();
            setChatLogs([...chatLogs, newChat]);
            setNewChatUsername('');
        } catch (err) {
            console.error('Error adding chat:', err);
            setError('Napaka pri dodajanju chata.');
        }
    }

    if (loading) {
        return <p>Nalaganje...</p>;
    }

    return (
        <div>
            <h2>Seznam Chatov</h2>
            {chatLogs.length === 0 ? (
                <p>Trenutno nimate nobenih chatov. Dodajte novega!</p>
            ) : (
                <ul>
                    {chatLogs.map(chat => (
                        <li key={chat._id}>
                            <p>{chat.name}</p>
                            <button onClick={() => navigate(`/messages/${chat._id}`)}>Poglej sporočila</button>
                        </li>
                    ))}
                </ul>
            )}

            <h3>Dodaj nov chat</h3>
            <form onSubmit={handleAddChat}>
                <input
                    type="text"
                    placeholder="Uporabniško ime"
                    value={newChatUsername}
                    onChange={(e) => setNewChatUsername(e.target.value)}
                    required
                />
                <button type="submit">Dodaj</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default ChatLogs;