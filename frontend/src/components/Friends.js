import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../userContext';
import '../styles/Friends.css';

function Friends() {
    const userContext = useContext(UserContext);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h2>Friends List</h2>
            {friends.length === 0 ? (
                <p>You currently have no friends.</p>
            ) : (
                <ul>
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