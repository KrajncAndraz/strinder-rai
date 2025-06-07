import { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { UserContext } from "../userContext";
import '../styles/Messages.css';
import { ThemeContext } from "../themeContext";

const socket = io('http://localhost:3001'); // Poveži se s strežnikom

function ChatMessages() {
    const { chatId } = useParams(); // Pridobi ID chatloga iz URL-ja
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null); // Ref za auto-scroll

    const { user } = useContext(UserContext);

    const { theme } = useContext(ThemeContext);
    const isLight = theme === "light";

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
                setError(errorData.error || 'Error sending message.');
                return;
            }

            const savedMessage = await res.json();

            // Pošlji sporočilo prek Socket.IO, da ga prejmejo drugi uporabniki
            socket.emit('sendMessage', savedMessage);

            // Počisti vnosno polje
            setNewMessage('');
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Error sending message.');
        }
    }

    if (loading || !user) {
        return <p>Loading...</p>;
    }

    return (
        <div className="messages-container">
            {/* Scrollable box za sporočila */}
            <div>
                <ul className="messages">
                    {messages.map((message, index) => {
                        var isOwner = message.sentBy?.username === user?.username;
                        return (
                            <li key={index} className={`${isOwner ? 'own-message' : 'message'}`}>
                                <p>
                                    <strong>{message.sentBy?.username || 'Unknown user'}:</strong> {message.content}
                                </p>
                                <p id="time">
                                    Sent at: {new Date(message.sentAt).toLocaleString()}
                                </p>
                            </li>
                        );
                    })}
                    <div ref={messagesEndRef} /> {/* Ref za auto-scroll */}
                </ul>
            </div>

            <form class="message-input" onSubmit={handleSendMessage}>
                <textarea
                    type="text"
                    placeholder="Enter message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    required
                    onInput={e => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                />
                <button type="submit" className="send-btn">
                    <img
                        src="/Send.svg"
                        alt="Send"
                        className={isLight ? "send-icon invert" : "send-icon"}
                    />
                    Send
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default ChatMessages;