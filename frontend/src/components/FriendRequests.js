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
            alert(`Error: ${errorData.message}`);
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
            alert(`Error: ${errorData.message}`);
        }
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h2>Friend requests</h2>
            {requests.length === 0 ? (
                <p>No new friend requests.</p>
            ) : (
                <ul className="w100">
                    {requests.map(request => (
                        <li key={request._id} className="request">
                            <p>
                                Request from: {request.friend1.username}
                            </p>
                            <div className="request-actions">
                                <button id="accept" onClick={() => acceptRequest(request._id)}>
                                    Accpet
                                </button>
                                <button id="reject" onClick={() => declineRequest(request._id)}>
                                    Reject
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default FriendRequests;