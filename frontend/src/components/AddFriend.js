import { useContext, useState } from 'react';
import { Navigate } from 'react-router';
import { UserContext } from '../userContext';

function AddFriend(props) {
    const userContext = useContext(UserContext);
    const [username, setUsername] = useState('');
    const [requestSent, setRequestSent] = useState(false);

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

    return (
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
    );
}

export default AddFriend;