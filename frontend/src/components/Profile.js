import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';
import '../styles/Profile.css';
import { ThemeContext } from "../themeContext";

function Profile(){
    const userContext = useContext(UserContext); 
    const [profile, setProfile] = useState({});

    const { theme } = useContext(ThemeContext);
    const isLight = theme === "light";

    useEffect(function(){
        const getProfile = async function(){
            const res = await fetch("http://localhost:3001/users/profile", {credentials: "include"});
            const data = await res.json();
            setProfile(data);
        }
        getProfile();
    }, []);

    return (
        <>
            <div className="profile">
                {!userContext.user ? <Navigate replace to="/login" /> : ""}
                <h1>User profile</h1>
                <img src="Profile-Default.svg" alt="Profile"></img>
                <p>{profile.username}</p>
                <p>{profile.email}</p>
                <button>
                    <img
                        src="Edit.png"
                        alt="Edit"
                        className={isLight ? "edit-icon invert" : "edit-icon"}
                    />
                    Edit Profile
                </button>
            </div>
        </>
    );
}

export default Profile;