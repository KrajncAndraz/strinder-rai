import { ThemeContext } from "../themeContext";
import { useContext } from "react";
import { UserContext } from "../userContext";
import { Link } from "react-router-dom";
import '../styles/Header.css';

function Header(props) {
    const { theme, setTheme } = useContext(ThemeContext);
    const context = useContext(UserContext);
    const isLoggedIn = !!context.user;

    const isLight = theme === "light";

    return (
        <header>
            <div className={`header-container ${isLoggedIn ? "header-space-around" : "header-left-gap"}`}>
                <Link to='/'>
                    <img
                        src="/Home.svg"
                        alt="Home"
                    />
                    Home
                </Link>
                {isLoggedIn ? (
                    <>
                        <Link to='/profile'>
                            <img
                                src="/Profile-Default.svg"
                                alt="Profile"
                            />
                            Profile
                        </Link>
                        <Link to='/friends'>
                            <img
                                src="/Friends.svg"
                                alt="Friends"
                                id="friends-icon"
                            />
                            Friends
                        </Link>
                        <Link to='/chatlogs'>
                            <img
                                src="/Chat.svg"
                                alt="Chat"
                            />
                            Chats
                        </Link>
                        <Link to='/workouts'>
                            <img
                                src="/Workout.svg"
                                alt="Workout"
                            />
                            Workouts
                        </Link>
                        <Link to='/mqtt'>
                            <img
                                src="/MQTT.svg"
                                alt="MQTT"
                                id="mqtt-icon"
                            />
                        </Link>
                        <Link to='/statistics'>
                            <img
                                src="/Statistics.svg"
                                alt="Statistics"
                            />
                            Statistics
                        </Link>
                        <Link to='/logout'>
                            <img
                                src="/Logout.svg"
                                alt="Logout"
                            />
                            Logout
                        </Link>
                    </>
                ) : (
                    <>
                            <Link to='/login'>
                                <img
                                    src="/Login.svg"
                                    alt="Login"
                                />
                                Login
                            </Link>
                            <Link to='/register'>
                                <img
                                    src="/Register.svg"
                                    alt="Register"
                                />
                                Register
                            </Link>
                    </>
                )}
                <label class="switch">
                    <input
                        type="checkbox"
                        checked={isLight}
                        onChange={() => setTheme(isLight ? "dark" : "light")}
                        aria-label="Toggle theme"
                    />
                    <span className="slider">
                        <img
                            src={isLight ? '/Theme-Light.svg' : '/Theme-Dark.svg'}
                            alt="theme icon"
                            className={`slider-img${isLight ? " slider-img-checked" : ""}`}
                        />
                    </span>
                </label>
            </div>
        </header>
    );
}

export default Header;