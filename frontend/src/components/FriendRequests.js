import { useContext, useState } from 'react';
import { Navigate } from 'react-router';
import { UserContext } from '../userContext';
import { useEffect } from 'react';

function FriendRequests() {
    const userContext = useContext(UserContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRequests() {
            const res = await fetch('http://localhost:3001/friends/requests', {
                method: 'GET',
                credentials: 'include',
            });
            const data = await res.json();
            setRequests(data);
            setLoading(false);
        }

        fetchRequests();
    }, []);

    async function acceptRequest(requestId) {
        const res = await fetch(`http://localhost:3001/friends/accept/${requestId}`, {
            method: 'POST',
            credentials: 'include',
        });

        if (res.ok) {
            setRequests(requests.filter(request => request._id !== requestId));
        } else {
            const errorData = await res.json();
            alert(`Napaka: ${errorData.message}`);
        }
    }

    async function declineRequest(requestId) {
        const res = await fetch(`http://localhost:3001/friends/remove/${requestId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (res.ok) {
            setRequests(requests.filter(request => request._id !== requestId));
        } else {
            const errorData = await res.json();
            alert(`Napaka: ${errorData.message}`);
        }
    }

    if (loading) {
        return <p>Nalaganje...</p>;
    }

    return (
        <div>
            <h2>Zahteve za prijateljstvo</h2>
            {requests.length === 0 ? (
                <p>Ni novih zahtev za prijateljstvo.</p>
            ) : (
                <ul>
                    {requests.map(request => (
                        <li key={request._id}>
                            <p>
                                Zahteva od: {request.friend1.username}
                            </p>
                            <button
                                className="btn btn-success"
                                onClick={() => acceptRequest(request._id)}
                            >
                                Sprejmi
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => declineRequest(request._id)}
                            >
                                Zavrniti
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default FriendRequests;