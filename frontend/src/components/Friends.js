import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../userContext';

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
            <h2>Friends list</h2>
            {friends.length === 0 ? (
                <p>You currently have no friends.</p>
            ) : (
                <ul>
                    {friends.map(friend => (
                        <li key={friend._id}>
                            <p>
                                {friend.friend1._id === userContext.user._id
                                    ? friend.friend2.username
                                    : friend.friend1.username}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Friends;