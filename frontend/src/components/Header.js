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
                <Link to='/'>Home</Link>
                {isLoggedIn ? (
                    <>
                        <Link to='/profile'>Profile</Link>
                        <Link to='/friends'>Friends</Link>
                        <Link to='/chatlogs'>Chats</Link>
                        <Link to='/workouts'>Workouts</Link>
                        <Link to='/mqtt'>Mqtt</Link>
                        <Link to='/statistics'>Statistics</Link>
                        <Link to='/logout'>Logout</Link>
                    </>
                ) : (
                    <>
                        <Link to='/login'>Login</Link>
                        <Link to='/register'>Register</Link>
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
                            src={isLight ? '/Theme-Light.png' : '/Theme-Dark.png'}
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