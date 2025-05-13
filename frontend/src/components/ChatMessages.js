import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001'); // Poveži se s strežnikom

function ChatMessages() {
    const { chatId } = useParams(); // Pridobi ID chatloga iz URL-ja
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null); // Ref za auto-scroll

    useEffect(() => {
        // Pridruži se chatu
        socket.emit('joinChat', chatId);

        // Poslušaj nova sporočila
        socket.on('receiveMessage', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Počisti poslušalce ob odhodu iz komponente
        return () => {
            socket.off('receiveMessage');
        };
    }, [chatId]);

    useEffect(() => {
        async function fetchMessages() {
            try {
                const res = await fetch(`http://localhost:3001/chat/messages/${chatId}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await res.json();
                console.log(data); // Preveri, kaj vrača API
                setMessages(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching messages:', err);
                setLoading(false);
            }
        }

        fetchMessages();
    }, [chatId]);

    useEffect(() => {
        // Auto-scroll na zadnje sporočilo
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    async function handleSendMessage(e) {
        e.preventDefault();
        setError('');

        const messageData = {
            content: newMessage,
        };

        try {
            // Pošlji sporočilo na backend API
            const res = await fetch(`http://localhost:3001/chat/messages/${chatId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(messageData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.error || 'Napaka pri pošiljanju sporočila.');
                return;
            }

            const savedMessage = await res.json();

            // Pošlji sporočilo prek Socket.IO, da ga prejmejo drugi uporabniki
            socket.emit('sendMessage', savedMessage);

            // Počisti vnosno polje
            setNewMessage('');
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Napaka pri pošiljanju sporočila.');
        }
    }

    if (loading) {
        return <p>Nalaganje...</p>;
    }

    return (
        <div>
            <h2>Sporočila</h2>
            {/* Scrollable box za sporočila */}
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                <ul>
                    {messages.map((message, index) => (
                        <li key={index}>
                            <p style={{ fontSize: '0.8em', color: 'gray' }}>
                                Poslano ob: {new Date(message.sentAt).toLocaleString()}
                            </p>
                            <p>
                                <strong>{message.sentBy?.username || 'Neznan uporabnik'}:</strong> {message.content}
                            </p>
                            <hr />
                        </li>
                    ))}
                    <div ref={messagesEndRef} /> {/* Ref za auto-scroll */}
                </ul>
            </div>

            <form onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Vnesite sporočilo"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    required
                />
                <button type="submit">Pošlji</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default ChatMessages;