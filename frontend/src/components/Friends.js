import { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import { UserContext } from '../userContext';
import '../styles/Friends.css';

function Friends(props) {
    const userContext = useContext(UserContext);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    const [username, setUsername] = useState('');
    const [requestSent, setRequestSent] = useState(false);

    const [requests, setRequests] = useState([]);

    useEffect(() => {
        async function fetchFriends() {
            const res = await fetch('http://localhost:3001/friends', {
                method: 'GET',
                credentials: 'include',
            });
            const data = await res.json();
            setFriends(data);
            setLoading(false);
        }

        fetchFriends();
    }, []);



    async function onSubmit(e) {
        e.preventDefault();

        if (!username) {
            alert("Enter a username!");
            return;
        }

        const res = await fetch('http://localhost:3001/friends/add', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        if (res.ok) {
            setRequestSent(true);
        } else {
            const errorData = await res.json();
            alert(`Error: ${errorData.message}`);
        }
    }



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
            <form className="form-group" onSubmit={onSubmit}>
                {!userContext.user ? <Navigate replace to="/login" /> : ""}
                {requestSent ? <Navigate replace to="/" /> : ""}
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="submit"
                    name="submit"
                    value="Send Friend Request"
                />
            </form>

            <br />
            <h2>Friend requests</h2>
            {requests.length === 0 ? (
                <p>No new friend requests.</p>
            ) : (
                <ul className="requests">
                    {requests.map(request => (
                        <li key={request._id} className="request">
                            <p>
                                Request from: {request.friend1.username}
                            </p>
                            <div className="request-actions">
                                <button id="accept" onClick={() => acceptRequest(request._id)}>
                                    Accept
                                </button>
                                <button id="reject" onClick={() => declineRequest(request._id)}>
                                    Reject
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <br />
            <h2>Friends</h2>
            {friends.length === 0 ? (
                <p>You currently have no friends.</p>
            ) : (
                <ul className="friends">
                    {friends.map(friend => (
                        <li className="friend" key={friend._id}>
                            <img src="Profile-Default.svg" alt="Profile"></img>
                            <p>
                                {friend.friend1._id === userContext.user._id
                                    ? friend.friend2.username
                                    : friend.friend1.username}
                            </p>
                            <button>Message</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Friends;