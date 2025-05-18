import { useContext } from "react";
import { UserContext } from "../userContext";
import { Link } from "react-router-dom";
import '../styles/Header.css';

function Header(props) {
    return (
        <header>
            <div className="header-container">
                <Link to='/'>Home</Link>
                <UserContext.Consumer>
                    {context => (
                        context.user ?
                            <>
                                <Link to='/profile'>Profile</Link>
                                <Link to='/friends'>Friends</Link>
                                <Link to='/addFriend'>Add Friend</Link>
                                <Link to='/friendRequests'>Friend Requests</Link>
                                <Link to='/chatlogs'>Chat logs</Link>
                                <Link to='/workouts'>Workouts</Link>
                                <Link to='/logout'>Logout</Link>
                            </>
                            :
                            <>
                                <Link to='/login'>Login</Link>
                                <Link to='/register'>Register</Link>
                            </>

                    )}
                </UserContext.Consumer>
            </div>
        </header>
    );
}

export default Header;