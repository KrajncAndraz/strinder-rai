import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../styles/Messages.css'



function ChatLogs() {
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
                setError(errorData.error || 'Error adding chat.');
                return;
            }

            const newChat = await res.json();
            setChatLogs([...chatLogs, newChat]);
            setNewChatUsername('');
        } catch (err) {
            console.error('Error adding chat:', err);
            setError('Error adding chat.');
        }
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h3 className="centered">Add new chat</h3>
            <form onSubmit={handleAddChat}>
                <input
                    type="text"
                    placeholder="Username"
                    value={newChatUsername}
                    onChange={(e) => setNewChatUsername(e.target.value)}
                    required
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Add</button>
            </form>

            <br />
            <h2>Chats</h2>
            {chatLogs.length === 0 ? (
                <p>You currently have no chats. Add a new one!</p>
            ) : (
                <ul className="chats">
                    {chatLogs.map(chat => (
                        <li className="chat" key={chat._id}>
                            <button className="chat_btn" onClick={() => navigate(`/messages/${chat._id}`)}>
                                <img src='/Chat.png' alt="chat icon" className="chat_icon" />
                                {chat.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ChatLogs;